import { useState, useEffect, useCallback, useContext, createContext } from "react"
import { ko, en, type Language, type Translations } from "./translations"
import { setStoredLanguage } from "@/lib/i18n-routing"

interface LanguageContextValue {
  language: Language
  setLanguage: (next: Language, options?: { persist?: boolean }) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const translations: Record<Language, Translations> = { ko, en }

function detectRouteLanguage(): Language {
  if (typeof window === "undefined") return "ko"
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/"
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko"
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(() => initialLanguage ?? detectRouteLanguage())

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language, options?: { persist?: boolean }) => {
    if (options?.persist ?? true) setStoredLanguage(next)
    setLanguageState(next)
  }, [])

  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export function useT() {
  return useLanguage().t
}
