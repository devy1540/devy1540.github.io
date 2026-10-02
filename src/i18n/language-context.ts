import { createContext, useContext } from "react"
import type { Language, Translations } from "./translations"
interface LanguageContextValue {
  language: Language
  setLanguage: (next: Language, options?: { persist?: boolean }) => void
  t: Translations
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

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
