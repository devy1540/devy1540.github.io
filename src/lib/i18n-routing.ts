import type { Language } from "@/i18n"

export const LANGUAGE_STORAGE_KEY = "language"

export function isLanguage(value: unknown): value is Language {
  return value === "ko" || value === "en"
}

export function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(stored) ? stored : null
  } catch {
    return null
  }
}

export function setStoredLanguage(language: Language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Ignore storage errors so language switching still works in restricted browsers.
  }
}

export function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "ko"

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  const primaryLanguage = languages.find((language) => language.trim().length > 0)?.toLowerCase()

  return primaryLanguage?.startsWith("ko") ? "ko" : "en"
}

export function getRouteLanguage(pathname: string): Language {
  const normalized = pathname.replace(/\/+$/, "") || "/"
  return normalized === "/en" || normalized.startsWith("/en/") ? "en" : "ko"
}

export function stripLanguagePrefix(pathname: string): string {
  const normalized = pathname || "/"
  if (normalized === "/en") return "/"
  if (normalized.startsWith("/en/")) return normalized.slice(3) || "/"
  return normalized
}

export function localizePath(path: string, language: Language): string {
  const [, pathname = "/", suffix = ""] = path.match(/^([^?#]*)([?#].*)?$/) ?? []
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  const basePath = stripLanguagePrefix(normalizedPath)

  if (language === "ko") return `${basePath}${suffix}`
  return `${basePath === "/" ? "/en" : `/en${basePath}`}${suffix}`
}

export function postPath(slug: string, language: Language): string {
  return localizePath(`/posts/${slug}`, language)
}
