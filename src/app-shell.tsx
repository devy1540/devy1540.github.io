import { StrictMode, type ReactNode } from "react"
import { ThemeProvider } from "./hooks/ThemeProvider"
import { LanguageProvider } from "./i18n"
import { AdminAuthProvider } from "./lib/admin/AdminAuthProvider"
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
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
