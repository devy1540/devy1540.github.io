var PROPERTY_ID = '306384783';
var CACHE_TTL = 300; // 5분
var REPORT_START_DATE = '2020-01-01';

/**
 * GET 요청: GA4 기준 summary + daily 단일 응답
 * CacheService 5분 캐시 적용
 */
function doGet() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('pageviews_response');

  if (cached) {
    return ContentService
      .createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);
  }

  var summary = getGA4Summary();
  var response = {
    totalViews: summary.totalViews,
    pages: summary.pages,
    daily: getGA4Daily(),
    meta: {
      cachedAt: new Date().toISOString(),
      source: 'ga4'
    }
  };

  var json = JSON.stringify(response);
  cache.put('pageviews_response', json, CACHE_TTL);

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 요청은 더 이상 조회수 집계에 사용하지 않음.
 * 조회수의 source of truth는 GA4 Data API.
 */
function doPost() {
  return jsonResponse({
    success: false,
    error: 'read-only analytics endpoint'
  });
}

function getGA4Summary() {
  try {
    return {
      totalViews: getGA4TotalViews(),
      pages: getGA4PageViews()
    };
  } catch (err) {
    Logger.log('getGA4Summary error: ' + err.message);
    return { totalViews: 0, pages: {} };
  }
}

function getGA4TotalViews() {
  var request = AnalyticsData.newRunReportRequest();
  request.dateRanges = [AnalyticsData.newDateRange()];
  request.dateRanges[0].startDate = REPORT_START_DATE;
  request.dateRanges[0].endDate = 'today';
  request.metrics = [AnalyticsData.newMetric()];
  request.metrics[0].name = 'screenPageViews';

  var response = AnalyticsData.Properties.runReport(
    request, 'properties/' + PROPERTY_ID
  );

  if (!response.rows || response.rows.length === 0) return 0;
  return parseInt(response.rows[0].metricValues[0].value, 10) || 0;
}

function getGA4PageViews() {
  var request = AnalyticsData.newRunReportRequest();
  request.dateRanges = [AnalyticsData.newDateRange()];
  request.dateRanges[0].startDate = REPORT_START_DATE;
  request.dateRanges[0].endDate = 'today';
  request.dimensions = [AnalyticsData.newDimension()];
  request.dimensions[0].name = 'pagePath';
  request.metrics = [AnalyticsData.newMetric()];
  request.metrics[0].name = 'screenPageViews';
  request.limit = 10000;

  var response = AnalyticsData.Properties.runReport(
    request, 'properties/' + PROPERTY_ID
  );

  var pages = {};
  if (response.rows) {
    for (var i = 0; i < response.rows.length; i++) {
      var path = normalizePath(response.rows[i].dimensionValues[0].value);
      var views = parseInt(response.rows[i].metricValues[0].value, 10) || 0;
      if (path) {
        pages[path] = (pages[path] || 0) + views;
      }
    }
  }

  return pages;
}

function getGA4Daily() {
  try {
    var request = AnalyticsData.newRunReportRequest();
    request.dateRanges = [AnalyticsData.newDateRange()];
    request.dateRanges[0].startDate = '30daysAgo';
    request.dateRanges[0].endDate = 'today';
    request.dimensions = [AnalyticsData.newDimension()];
    request.dimensions[0].name = 'date';
    request.metrics = [AnalyticsData.newMetric()];
    request.metrics[0].name = 'screenPageViews';
    request.orderBys = [AnalyticsData.newOrderBy()];
    request.orderBys[0].dimension = AnalyticsData.newDimensionOrderBy();
    request.orderBys[0].dimension.dimensionName = 'date';

    var response = AnalyticsData.Properties.runReport(
      request, 'properties/' + PROPERTY_ID
    );

    var daily = [];
    if (response.rows) {
      for (var i = 0; i < response.rows.length; i++) {
        var dateStr = response.rows[i].dimensionValues[0].value;
        var views = parseInt(response.rows[i].metricValues[0].value, 10) || 0;
        daily.push({
          date: dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8),
          views: views
        });
      }
    }
    return daily;
  } catch (err) {
    Logger.log('getGA4Daily error: ' + err.message);
    return [];
  }
}

function normalizePath(path) {
  if (!path) return '';
  path = String(path).split('?')[0].split('#')[0];
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  path = path.replace(/\/+/g, '/');
  return path;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoGet() {
  var result = doGet();
  Logger.log(result.getContent());
}
