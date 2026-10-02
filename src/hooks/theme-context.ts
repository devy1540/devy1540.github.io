import { createContext, useContext } from "react"
export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"
export const ThemeContext = createContext<{ theme: Theme; resolvedTheme: ResolvedTheme; setTheme: (theme: Theme) => void } | null>(null)
export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error("useTheme must be used within a ThemeProvider")
  return value
}
