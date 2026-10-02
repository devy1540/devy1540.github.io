const listeners = new Set<() => void>()
let observer: MutationObserver | undefined
let frame: number | undefined
let previous = ""

export function getDiagramThemeKey() {
  const root = document.documentElement
  return `${root.classList.contains("dark") ? "dark" : "light"}:${root.dataset.color ?? ""}`
}
export function getServerDiagramThemeKey() { return "light:" }

export function subscribeDiagramTheme(callback: () => void) {
  listeners.add(callback)
  if (!observer) {
    previous = getDiagramThemeKey()
    observer = new MutationObserver(() => {
      if (frame !== undefined) return
      frame = requestAnimationFrame(() => {
        frame = undefined
        const key = getDiagramThemeKey()
        if (key === previous) return
        previous = key
        for (const listener of listeners) listener()
      })
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-color"] })
  }
  return () => {
    listeners.delete(callback)
    if (!listeners.size) {
      observer?.disconnect()
      observer = undefined
      if (frame !== undefined) cancelAnimationFrame(frame)
      frame = undefined
    }
  }
}
