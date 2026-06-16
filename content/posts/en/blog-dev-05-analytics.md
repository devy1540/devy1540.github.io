---
title: "Building a Blog #5 - Google Analytics Integration and View Counts"
date: "2026-02-26"
description: "How I display visitor counts and daily page view charts on a static site using GA4 data."
tags: ["react", "google-analytics", "shadcn-ui", "blog"]
series: "Building a React Blog"
seriesOrder: 5
---

## Problem: Showing GA Data on a Static Site

Adding Google Analytics itself is simple. You can add the script tag to `index.html`.

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

But if you want to **display the collected data directly inside the blog**, the situation changes. The GA4 Data API requires service account authentication, so it cannot be called directly from client-side JavaScript.

## Solution: Google Apps Script Proxy

I used **Google Apps Script** as a middle proxy. It is free, and it can call the GA4 Data API without running a separate server.

### Structure

```text
Blog (fetch) -> Apps Script (web app) -> GA4 Data API -> response
```

### Apps Script Implementation

One script provides two data shapes through a `type` parameter.

**Summary** (`?type=summary`) - total views and page-level views

```javascript
function getSummary(propertyId) {
  // total views
  var totalRequest = AnalyticsData.newRunReportRequest();
  totalRequest.dateRanges = [AnalyticsData.newDateRange()];
  totalRequest.dateRanges[0].startDate = '2020-01-01';
  totalRequest.dateRanges[0].endDate = 'today';
  totalRequest.metrics = [AnalyticsData.newMetric()];
  totalRequest.metrics[0].name = 'screenPageViews';

  // views by page
  var pageRequest = AnalyticsData.newRunReportRequest();
  pageRequest.dimensions = [AnalyticsData.newDimension()];
  pageRequest.dimensions[0].name = 'pagePath';
  // ...

  return { totalViews, pages }
}
```

**Daily** (`?type=daily`) - daily views for the last 30 days

```javascript
function getDailyViews(propertyId) {
  var request = AnalyticsData.newRunReportRequest();
  request.dateRanges[0].startDate = '30daysAgo';
  request.dimensions[0].name = 'date';
  // ...

  return { daily: [{ date: "2026-02-26", views: 42 }, ...] }
}
```

### Things to Watch When Setting Up Apps Script

1. **Enable advanced services** - In the Apps Script editor, add the `Google Analytics Data API` service. If this is missing, you will get an `AnalyticsData is not defined` error.

2. **Property ID vs Measurement ID** - The API needs the numeric Property ID, not the `G-XXXXXXXXXX` Measurement ID. You can find it in GA Admin > Property settings.

3. **Deployment version management** - After changing code, update the existing deployment with a new version instead of creating a new deployment. That keeps the same URL.

## Blog-side Implementation

### Sharing Data with the usePageViews Hook

To call the API only once and share the result across components, I used module-level caching plus `sessionStorage` caching.

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

This gives three benefits:

- The API is called only once within the same session.
- Multiple components requesting data at the same time do not duplicate fetches.
- Refreshes still reuse the cache during the session.

### Daily View Chart

I used shadcn/ui's Chart components (`ChartContainer`, `ChartTooltip`) with Recharts' `AreaChart`.

The key is to **generate the last 30 days on the client first**. Dates with no API data are filled with zero so the chart does not break on empty days.

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

### Skeleton Loading

Apps Script can take a moment to respond, so I used shadcn's `Skeleton` component during loading to preserve layout.

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

### Per-post View Counts

Post lists and post detail pages also show view counts. If no data exists, they show zero.

```tsx
const { getPostViews } = usePageViews()

// In the post list
<span className="flex items-center gap-1">
  <Eye className="size-3" />
  {(getPostViews(post.slug) ?? 0).toLocaleString()}
</span>
```

## GA Custom Events

In addition to default page views, I added custom events to track user behavior.

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

In the GA console, custom events can reveal which posts are popular, which themes users choose, and what search terms are trending.

## Closing

The most interesting part of this series was working around the limits of a static site with a free Google Apps Script proxy. It became possible to display GA4 data directly in the blog without paying for a separate server.

Features covered in this series:

- Command Palette search (Cmd+K)
- View Transitions API
- Color theme presets
- Post series
- Advanced search with date/tag filters
- SEO with meta tags, sitemap, and RSS
- Google Analytics integration and visitor chart
- Per-post view counts

---

> The source code for this blog is available on [GitHub](https://github.com/devy1540/devy1540.github.io).
