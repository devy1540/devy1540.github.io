import { useEffect } from "react"
import { prefetchRoute } from "@/lib/route-modules"

export function RoutePreloader() {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return

    function prefetchOnIntent(event: Event) {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null
      if (!link || link.hasAttribute("download") || link.target === "_blank") return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      void prefetchRoute(url.pathname)
    }

    document.addEventListener("pointerover", prefetchOnIntent, { passive: true })
    document.addEventListener("focusin", prefetchOnIntent)
    document.addEventListener("touchstart", prefetchOnIntent, { passive: true })
    return () => {
      document.removeEventListener("pointerover", prefetchOnIntent)
      document.removeEventListener("focusin", prefetchOnIntent)
      document.removeEventListener("touchstart", prefetchOnIntent)
    }
  }, [])
  return null
}
