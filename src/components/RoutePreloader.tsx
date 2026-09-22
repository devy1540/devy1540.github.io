import { useEffect } from "react"
import { prefetchRoute } from "@/lib/route-modules"

export function RoutePreloader() {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return

    const paths = ["/posts", "/tags", "/series", "/about", "/analytics"]
    let active = true
    let idleId: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    function schedule() {
      if (!active || paths.length === 0) return
      const run = () => {
        if (!active) return
        const path = paths.shift()!
        void prefetchRoute(path).then(schedule)
      }
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(run, { timeout: 2000 })
      else timer = setTimeout(run, 1000)
    }
    schedule()
    return () => {
      active = false
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [])
  return null
}
