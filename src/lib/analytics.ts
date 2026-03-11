declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function trackEvent(eventName: string, params?: Record<string, string | number>) {
  window.gtag?.("event", eventName, params)
}

const GA_API_URL = import.meta.env.VITE_GA_API_URL as string | undefined

/**
 * 방문 기록을 Apps Script → Sheets에 실시간 기록
 * sendBeacon 사용으로 페이지 이탈 시에도 안정적
 */
export function trackPageVisit(path: string) {
  // dev 모드에서는 비활성화
  if (import.meta.env.DEV) return
  if (!GA_API_URL) return

  // 세션 내 중복 방지
  const key = `visited:${path}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, "1")

  const body = JSON.stringify({
    path,
    userAgent: navigator.userAgent,
  })

  // sendBeacon은 text/plain으로 전송 (CORS preflight 방지)
  navigator.sendBeacon(GA_API_URL, body)
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
