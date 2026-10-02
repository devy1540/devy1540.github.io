import { useEffect, useRef, useState } from "react"

const listeners = new Map<Element, () => void>()
let observer: IntersectionObserver | undefined

function observe(element: Element, callback: () => void) {
  if (!observer) observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      const listener = listeners.get(entry.target)
      listeners.delete(entry.target)
      observer?.unobserve(entry.target)
      listener?.()
    }
  }, { rootMargin: "300px 0px" })
  listeners.set(element, callback)
  observer.observe(element)
  return () => {
    listeners.delete(element)
    observer?.unobserve(element)
    if (!listeners.size) { observer?.disconnect(); observer = undefined }
  }
}

export function useNearViewport() {
  const ref = useRef<HTMLDivElement>(null)
  const [nearby, setNearby] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === "undefined") {
      let active = true
      void Promise.resolve().then(() => { if (active) setNearby(true) })
      return () => { active = false }
    }
    return observe(element, () => setNearby(true))
  }, [])
  return { ref, nearby }
}
