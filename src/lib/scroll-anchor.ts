export function followScrollAnchor(target: HTMLElement, behavior: ScrollBehavior) {
  let active = true
  let moving = false
  let idle: ReturnType<typeof setTimeout> | undefined
  let frame = 0
  const content = target.closest(".prose") ?? target.parentElement!

  const align = () => {
    if (!active || !target.isConnected || moving) return
    const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    const delta = target.getBoundingClientRect().top - offset
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const destination = Math.max(0, Math.min(maximum, window.scrollY + delta))
    if (Math.abs(window.scrollY - destination) < 2) return
    moving = behavior === "smooth"
    target.scrollIntoView({ block: "start", behavior })
    if (moving) idle = setTimeout(ended, 150)
  }
  const ended = () => {
    clearTimeout(idle)
    moving = false
    align()
  }
  const scrolling = () => {
    if (!moving) return
    clearTimeout(idle)
    idle = setTimeout(ended, 150)
  }
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(align)
  }
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule)
  const stop = () => {
    active = false
    observer?.disconnect()
    cancelAnimationFrame(frame)
    clearTimeout(idle)
    clearTimeout(expiry)
    window.removeEventListener("scroll", scrolling)
    window.removeEventListener("scrollend", ended)
    window.removeEventListener("wheel", stop)
    window.removeEventListener("touchstart", stop)
    window.removeEventListener("keydown", manualKey)
  }
  const manualKey = (event: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) stop()
  }
  const expiry = setTimeout(stop, 10000)
  observer?.observe(content)
  window.addEventListener("scroll", scrolling, { passive: true })
  window.addEventListener("scrollend", ended)
  window.addEventListener("wheel", stop, { passive: true })
  window.addEventListener("touchstart", stop, { passive: true })
  window.addEventListener("keydown", manualKey)
  align()
  return stop
}
