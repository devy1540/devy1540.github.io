---
title: "블로그 만들기 #5 — Google Analytics 연동 & 방문자 수 표시"
date: "2026-02-26"
description: "정적 사이트에서 GA4 데이터를 활용해 방문자 수와 일별 조회수 차트를 표시하는 방법을 정리합니다."
tags: ["react", "google-analytics", "shadcn-ui", "blog"]
series: "React 블로그 만들기"
seriesOrder: 5
---

## 문제: 정적 사이트에서 GA 데이터 보여주기

Google Analytics를 추가하는 것 자체는 간단합니다. `index.html`에 스크립트 태그를 넣으면 끝입니다.

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

하지만 수집된 데이터를 **블로그에 직접 표시**하려면 이야기가 달라집니다. GA4 Data API는 서비스 계정 인증이 필요해서, 클라이언트 JavaScript에서 직접 호출할 수 없습니다.

## 해결: Google Apps Script 프록시

**Google Apps Script**를 중간 프록시로 사용했습니다. 무료이고, 별도 서버 없이 GA4 Data API를 호출할 수 있습니다.

### 구조

```
블로그 (fetch) → Apps Script (웹 앱) → GA4 Data API → 응답 반환
```

### Apps Script 구현

하나의 스크립트에서 `type` 파라미터로 두 가지 데이터를 제공합니다.

**Summary** (`?type=summary`) — 전체 조회수 + 페이지별 조회수

```javascript
function getSummary(propertyId) {
  // 전체 조회수
  var totalRequest = AnalyticsData.newRunReportRequest();
  totalRequest.dateRanges = [AnalyticsData.newDateRange()];
  totalRequest.dateRanges[0].startDate = '2020-01-01';
  totalRequest.dateRanges[0].endDate = 'today';
  totalRequest.metrics = [AnalyticsData.newMetric()];
  totalRequest.metrics[0].name = 'screenPageViews';

  // 페이지별 조회수
  var pageRequest = AnalyticsData.newRunReportRequest();
  pageRequest.dimensions = [AnalyticsData.newDimension()];
  pageRequest.dimensions[0].name = 'pagePath';
  // ...

  return { totalViews, pages }
}
```

**Daily** (`?type=daily`) — 최근 30일 일별 조회수

```javascript
function getDailyViews(propertyId) {
  var request = AnalyticsData.newRunReportRequest();
  request.dateRanges[0].startDate = '30daysAgo';
  request.dimensions[0].name = 'date';
  // ...

  return { daily: [{ date: "2026-02-26", views: 42 }, ...] }
}
```

### Apps Script 설정 시 주의사항

1. **고급 서비스 활성화** — Apps Script 에디터에서 `Google Analytics Data API` 서비스를 추가해야 합니다. 이걸 빠뜨리면 `AnalyticsData is not defined` 에러가 발생합니다.

2. **Property ID vs Measurement ID** — API에는 숫자로 된 Property ID가 필요합니다. `G-XXXXXXXXXX` 형태의 Measurement ID가 아닙니다. GA 관리 > 속성 설정에서 확인할 수 있습니다.

3. **배포 버전 관리** — 코드를 수정한 후 "새 배포"가 아니라 기존 배포를 "수정"해서 새 버전을 적용해야 같은 URL이 유지됩니다.

## 블로그 측 구현

### 데이터 공유: usePageViews 훅

API를 한 번만 호출하고 여러 컴포넌트에서 공유하기 위해 모듈 레벨 캐싱 + `sessionStorage` 캐싱을 적용했습니다.

```tsx
let cached: PageViewsData | null = null
let fetching: Promise<PageViewsData | null> | null = null

function fetchPageViews() {
  if (cached) return Promise.resolve(cached)
  if (fetching) return fetching

  const stored = sessionStorage.getItem("page-views")
  if (stored) {
    cached = JSON.parse(stored)
    return Promise.resolve(cached)
  }

  fetching = fetch(GA_API_URL)
    .then((res) => res.json())
    .then((data) => {
      cached = data
      sessionStorage.setItem("page-views", JSON.stringify(data))
      return data
    })

  return fetching
}
```

이렇게 하면:
- 같은 세션 내에서는 API를 한 번만 호출
- 여러 컴포넌트가 동시에 요청해도 중복 fetch 없음
- 새로고침해도 세션 동안은 캐시 활용

### 일별 조회수 차트

shadcn/ui의 Chart 컴포넌트(`ChartContainer`, `ChartTooltip`)와 Recharts의 `AreaChart`를 사용합니다.

핵심은 **클라이언트에서 30일치 날짜를 미리 생성**하는 것입니다. API에서 데이터가 없는 날짜는 0으로 채워서 빈 날에도 그래프가 끊기지 않습니다.

```tsx
function generateLast30Days(): DailyData[] {
  const days: DailyData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({ date: formatDate(d), views: 0 })
  }
  return days
}

function mergeData(base: DailyData[], fetched: DailyData[]): DailyData[] {
  const map = new Map(fetched.map((d) => [d.date, d.views]))
  return base.map((d) => ({ ...d, views: map.get(d.date) ?? 0 }))
}
```

### 스켈레톤 로딩

Apps Script 응답까지 약간의 지연이 있으므로, 로딩 중에는 shadcn의 `Skeleton` 컴포넌트로 레이아웃을 유지합니다.

```tsx
if (isLoading) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex gap-6 mb-4">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-7 w-20" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
      <Skeleton className="h-[100px] w-full rounded-md" />
    </div>
  )
}
```

### 포스트별 조회수

각 포스트 목록과 상세 페이지에도 조회수를 표시합니다. 데이터가 없으면 0으로 표시합니다.

```tsx
const { getPostViews } = usePageViews()

// 포스트 목록에서
<span className="flex items-center gap-1">
  <Eye className="size-3" />
  {(getPostViews(post.slug) ?? 0).toLocaleString()}
</span>
```

## GA 커스텀 이벤트

기본 페이지뷰 외에 사용자 행동을 추적하는 커스텀 이벤트도 추가했습니다.

```tsx
// src/lib/analytics.ts
export const analytics = {
  viewPost(title, slug) {
    trackEvent("view_post", { post_title: title, post_slug: slug })
  },
  search(query, resultCount) {
    trackEvent("search", { search_term: query, result_count: resultCount })
  },
  changeTheme(theme) {
    trackEvent("change_theme", { theme })
  },
  changeColorTheme(color) {
    trackEvent("change_color_theme", { color })
  },
  clickSeriesNav(series, targetSlug) {
    trackEvent("click_series_nav", { series_name: series, target_slug: targetSlug })
  },
}
```

GA 콘솔의 이벤트 > 맞춤 이벤트에서 어떤 포스트가 많이 읽히는지, 어떤 테마가 인기 있는지, 검색어 트렌드 등을 분석할 수 있습니다.

## 마치며

정적 사이트의 한계를 Google Apps Script라는 무료 프록시로 극복한 것이 이번 시리즈에서 가장 재미있었던 부분입니다. 별도 서버 비용 없이 GA4의 데이터를 블로그에 직접 표시할 수 있게 되었습니다.

이 시리즈에서 다룬 전체 기능 목록:
- Command Palette 검색 (Cmd+K)
- View Transitions API
- 컬러 테마 프리셋
- 포스트 시리즈
- 고급 검색 (날짜/태그 필터)
- SEO (메타 태그, sitemap, RSS)
- Google Analytics 연동 + 방문자 차트
- 포스트별 조회수

---

> 이 블로그의 소스 코드는 [GitHub](https://github.com/devy1540/devy1540.github.io)에서 확인할 수 있습니다.
