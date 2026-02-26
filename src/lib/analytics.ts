declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function trackEvent(eventName: string, params?: Record<string, string | number>) {
  window.gtag?.("event", eventName, params)
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
}
