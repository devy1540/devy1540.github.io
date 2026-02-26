import { useState, useEffect, useCallback, useContext, createContext } from "react"
import { ko, en, type Language, type Translations } from "./translations"

interface LanguageContextValue {
  language: Language
  setLanguage: (next: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const translations: Record<Language, Translations> = { ko, en }

function detectLanguage(): Language {
  const stored = localStorage.getItem("language") as Language | null
  if (stored === "ko" || stored === "en") return stored
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith("ko")) return "ko"
  return "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    localStorage.setItem("language", next)
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
