declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
}

type AnalyticsParams = Record<string, string | number | boolean | undefined>

function pushDataLayer(eventName: string, params?: AnalyticsParams) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event: eventName, ...params })
}

function trackEvent(eventName: string, params?: AnalyticsParams) {
  if (import.meta.env.DEV) return

  if (window.gtag) {
    window.gtag("event", eventName, params)
    return
  }

  pushDataLayer(eventName, params)
}

export function trackPageView(path: string) {
  trackEvent("page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  })
}

export const analytics = {
  viewPost(title: string, slug: string) {
    trackEvent("view_post", { post_title: title, post_slug: slug })
  },
  search(query: string, resultCount: number) {
    trackEvent("search", { search_term: query, result_count: resultCount })
  },
  changeTheme(theme: string) {
    trackEvent("change_theme", { theme })
  },
  changeColorTheme(color: string) {
    trackEvent("change_color_theme", { color })
  },
  clickSeriesNav(series: string, targetSlug: string) {
    trackEvent("click_series_nav", { series_name: series, target_slug: targetSlug })
  },
  changeLanguage(lang: string) {
    trackEvent("change_language", { language: lang })
  },
}
