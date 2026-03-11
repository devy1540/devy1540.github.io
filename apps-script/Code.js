var PROPERTY_ID = '306384783';
var SPREADSHEET_ID = '1X-OWsZhJwQcvkDGvMKcTuz2z-OQEF8hi2ac6V0NXMmg';
var CACHE_TTL = 300; // 5분

/**
 * GET 요청: summary + daily 합산 단일 응답
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

  var sheetsData = getSheetsData();
  var dailyData = getSheetsDailyData();
  var ga4Daily = getGA4Daily();

  // Sheets daily + GA4 daily 병합 (Sheets 우선)
  var dailyMap = {};
  for (var i = 0; i < ga4Daily.length; i++) {
    dailyMap[ga4Daily[i].date] = ga4Daily[i].views;
  }
  for (var i = 0; i < dailyData.length; i++) {
    var d = dailyData[i].date;
    dailyMap[d] = (dailyMap[d] || 0) + dailyData[i].views;
  }

  var daily = [];
  var dates = Object.keys(dailyMap).sort();
  for (var i = 0; i < dates.length; i++) {
    daily.push({ date: dates[i], views: dailyMap[dates[i]] });
  }

  var response = {
    totalViews: sheetsData.totalViews,
    pages: sheetsData.pages,
    daily: daily,
    meta: {
      cachedAt: new Date().toISOString(),
      source: 'sheets+ga4'
    }
  };

  var json = JSON.stringify(response);
  cache.put('pageviews_response', json, CACHE_TTL);

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 요청: 방문 기록을 Sheets에 실시간 기록
 * sendBeacon으로 호출됨 (text/plain)
 */
function doPost(e) {
  try {
    var body = e.postData ? e.postData.contents : '';
    var data = JSON.parse(body);
    var path = normalizePath(data.path || '');

    if (!path || !path.startsWith('/')) {
      return jsonResponse({ success: false, error: 'invalid path' });
    }

    // 봇 필터링
    var ua = (data.userAgent || '').toLowerCase();
    if (isBot(ua)) {
      return jsonResponse({ success: false, error: 'bot' });
    }

    // PageViews 시트에 카운트 증가
    incrementPageView(path);

    // DailyViews 시트에 오늘 날짜 카운트 증가
    incrementDailyView();

    // 캐시 무효화
    CacheService.getScriptCache().remove('pageviews_response');

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ─── Sheets 데이터 조회 ───

function getSheetsData() {
  if (!SPREADSHEET_ID) {
    return { totalViews: 0, pages: {} };
  }

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('PageViews');
    if (!sheet || sheet.getLastRow() < 2) {
      return { totalViews: 0, pages: {} };
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    var pages = {};
    var totalViews = 0;

    for (var i = 0; i < data.length; i++) {
      var path = String(data[i][0]);
      var count = Number(data[i][1]) || 0;
      if (path) {
        pages[path] = count;
        totalViews += count;
      }
    }

    return { totalViews: totalViews, pages: pages };
  } catch (err) {
    Logger.log('getSheetsData error: ' + err.message);
    return { totalViews: 0, pages: {} };
  }
}

function getSheetsDailyData() {
  if (!SPREADSHEET_ID) return [];

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('DailyViews');
    if (!sheet || sheet.getLastRow() < 2) return [];

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    var daily = [];

    // 최근 30일만 반환
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    var cutoffStr = formatDate(cutoff);

    for (var i = 0; i < data.length; i++) {
      var raw = data[i][0];
      var date = (raw instanceof Date) ? formatDate(raw) : String(raw);
      var views = Number(data[i][1]) || 0;
      if (date >= cutoffStr) {
        daily.push({ date: date, views: views });
      }
    }

    return daily;
  } catch (err) {
    Logger.log('getSheetsDailyData error: ' + err.message);
    return [];
  }
}

// ─── Sheets 기록 ───

function incrementPageView(path) {
  if (!SPREADSHEET_ID) return;

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('PageViews');
  if (!sheet) {
    sheet = ss.insertSheet('PageViews');
    sheet.appendRow(['path', 'count', 'lastVisited']);
  }

  var lastRow = sheet.getLastRow();
  var found = false;

  if (lastRow >= 2) {
    var paths = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < paths.length; i++) {
      if (String(paths[i][0]) === path) {
        var row = i + 2;
        var currentCount = Number(sheet.getRange(row, 2).getValue()) || 0;
        sheet.getRange(row, 2).setValue(currentCount + 1);
        sheet.getRange(row, 3).setValue(new Date().toISOString());
        found = true;
        break;
      }
    }
  }

  if (!found) {
    sheet.appendRow([path, 1, new Date().toISOString()]);
  }
}

function incrementDailyView() {
  if (!SPREADSHEET_ID) return;

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('DailyViews');
  if (!sheet) {
    sheet = ss.insertSheet('DailyViews');
    sheet.appendRow(['date', 'views']);
  }

  var today = formatDate(new Date());
  var lastRow = sheet.getLastRow();
  var found = false;

  if (lastRow >= 2) {
    var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < dates.length; i++) {
      if (String(dates[i][0]) === today) {
        var row = i + 2;
        var currentCount = Number(sheet.getRange(row, 2).getValue()) || 0;
        sheet.getRange(row, 2).setValue(currentCount + 1);
        found = true;
        break;
      }
    }
  }

  if (!found) {
    sheet.appendRow([today, 1]);
  }
}

// ─── GA4 데이터 (daily용, 상세 분석) ───

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
        var views = parseInt(response.rows[i].metricValues[0].value);
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

// ─── 유틸리티 ───

function normalizePath(path) {
  if (!path) return '';
  // trailing slash 제거 (루트 제외)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  // 연속 슬래시 제거
  path = path.replace(/\/+/g, '/');
  return path;
}

function isBot(ua) {
  var bots = ['bot', 'crawl', 'spider', 'slurp', 'mediapartners', 'prerender', 'lighthouse', 'pagespeed', 'headless'];
  for (var i = 0; i < bots.length; i++) {
    if (ua.indexOf(bots[i]) !== -1) return true;
  }
  return false;
}

function formatDate(d) {
  var yyyy = d.getFullYear();
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return yyyy + '-' + mm + '-' + dd;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── 권한 승인용 (try-catch 없이 직접 호출) ───

function authorizeSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Sheets authorized: ' + ss.getName());
}

// ─── 테스트 ───

function testDoGet() {
  var result = doGet();
  Logger.log(result.getContent());
}

function testDoPost() {
  var e = {
    postData: {
      contents: JSON.stringify({ path: '/posts/test-post', userAgent: 'Mozilla/5.0' })
    }
  };
  var result = doPost(e);
  Logger.log(result.getContent());
}
