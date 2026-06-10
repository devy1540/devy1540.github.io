import { StrictMode, type ReactNode } from "react"
import { ThemeProvider } from "./hooks/useTheme"
import { LanguageProvider } from "./i18n"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
