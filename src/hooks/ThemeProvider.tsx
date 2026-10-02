import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react"
import { ThemeContext, type Theme, type ResolvedTheme } from "./theme-context"
import { readLocalSetting, writeLocalSetting } from "@/lib/browser-storage"
let currentTheme: Theme | null = null
const listeners = new Set<() => void>()
const validTheme = (value: string | null): value is Theme => value === "light" || value === "dark" || value === "system"
function readTheme(): Theme { const stored = readLocalSetting("theme"); return currentTheme ?? (validTheme(stored) ? stored : "system") }
function subscribeTheme(callback: () => void) {
  listeners.add(callback)
  const changed = () => { currentTheme = null; callback() }
  window.addEventListener("storage", changed)
  return () => { listeners.delete(callback); window.removeEventListener("storage", changed) }
}
function subscribeSystem(callback: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)")
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme)
  const readResolved = useCallback((): ResolvedTheme => theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme, [theme])
  const resolvedTheme = useSyncExternalStore(subscribeSystem, readResolved, () => "light" as ResolvedTheme)
  useEffect(() => { document.documentElement.classList.toggle("dark", resolvedTheme === "dark") }, [resolvedTheme])
  const setTheme = useCallback((next: Theme) => { currentTheme = next; writeLocalSetting("theme", next); listeners.forEach(callback => callback()) }, [])
  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}
