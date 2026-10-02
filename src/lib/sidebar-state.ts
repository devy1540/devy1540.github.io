const listeners = new Set<() => void>()
let current: boolean | undefined
let initialized = false

export function getSidebarOpen(defaultOpen: boolean) {
  if (current !== undefined) return current
  if (initialized || typeof document === "undefined") return defaultOpen
  initialized = true
  try {
    const value = document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith("sidebar_state="))?.slice("sidebar_state=".length)
    if (value === "true" || value === "false") { current = value === "true"; return current }
  } catch { /* 쿠키가 차단된 경우에는 현재 문서의 상태만 사용한다. */ }
  return defaultOpen
}

export function subscribeSidebarOpen(callback: () => void) {
  listeners.add(callback)
  return () => { listeners.delete(callback) }
}

export function setSidebarOpen(open: boolean) {
  current = open
  initialized = true
  try { document.cookie = `sidebar_state=${open}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax` } catch { /* 메모리 상태는 유지한다. */ }
  for (const listener of listeners) listener()
}
