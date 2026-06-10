import { useState, useEffect, useCallback, useContext, createContext } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  setTheme: (next: Theme) => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined" || typeof window === "undefined") return
  const root = document.documentElement
  root.classList.add("theme-transition")

  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }

  // Remove transition class after animation completes
  window.setTimeout(() => {
    root.classList.remove("theme-transition")
  }, 200)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (isTheme(stored) && stored !== theme) {
      setThemeState(stored)
      return
    }

    const resolved: ResolvedTheme =
      theme === "system" ? getSystemTheme() : theme
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      const resolved: ResolvedTheme = e.matches ? "dark" : "light"
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem("theme", next)
    setThemeState(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
