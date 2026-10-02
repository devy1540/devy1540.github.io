import { useEffect, useRef } from "react"
import { useLocation, useNavigationType } from "react-router-dom"
import { getScrollBehavior } from "@/lib/motion"
import { followScrollAnchor } from "@/lib/scroll-anchor"

const positions = new Map<string, number>()

export function ScrollToTop() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const previousPath = useRef(pathname)
  const initialNavigation = useRef(true)

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    return () => { window.history.scrollRestoration = previous }
  }, [])

  useEffect(() => {
    const samePage = previousPath.current === pathname
    if (previousPath.current !== pathname) {
      document.getElementById("main-content")?.focus({ preventScroll: true })
      previousPath.current = pathname
    }
    let observer: MutationObserver | undefined
    let stopFollowing: (() => void) | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined
    let restoring = true
    const saved = navigationType === "POP" ? positions.get(key) : undefined
    const remember = () => {
      if (restoring) return
      positions.set(key, window.scrollY)
      if (positions.size > 100) positions.delete(positions.keys().next().value!)
    }
    const frame = requestAnimationFrame(() => {
      const initial = initialNavigation.current
      initialNavigation.current = false
      if (saved !== undefined) {
        window.scrollTo(0, saved)
      } else if (hash) {
        let id: string
        try { id = decodeURIComponent(hash.slice(1)) } catch { id = hash.slice(1) }
        const scroll = () => {
          const target = document.getElementById(id)
          if (!target) return false
          const behavior = samePage && navigationType !== "POP" ? getScrollBehavior() : "auto"
          stopFollowing = followScrollAnchor(target, behavior)
          observer?.disconnect()
          if (timeout) clearTimeout(timeout)
          return true
        }
        if (!scroll()) {
          observer = new MutationObserver(scroll)
          observer.observe(document.getElementById("main-content") ?? document.body, { childList: true, subtree: true })
          timeout = setTimeout(() => observer?.disconnect(), 10000)
        }
      } else if (!initial && !samePage) {
        window.scrollTo(0, 0)
      }
      restoring = false
      remember()
    })
    window.addEventListener("scroll", remember, { passive: true })
    // 링크가 이동하기 전에 현재 위치를 기록해 지연된 scroll 이벤트와 분리한다.
    document.addEventListener("click", remember, true)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      stopFollowing?.()
      if (timeout) clearTimeout(timeout)
      window.removeEventListener("scroll", remember)
      document.removeEventListener("click", remember, true)
    }
  }, [pathname, hash, key, navigationType])

  return null
}
