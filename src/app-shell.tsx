import { StrictMode, type ReactNode } from "react"
import { ThemeProvider } from "./hooks/useTheme"
import { LanguageProvider } from "./i18n"
import type { Language } from "./i18n"

export function AppProviders({
  children,
  initialLanguage,
}: {
  children: ReactNode
  initialLanguage?: Language
}) {
  return (
    <StrictMode>
      <ThemeProvider>
        <LanguageProvider initialLanguage={initialLanguage}>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
