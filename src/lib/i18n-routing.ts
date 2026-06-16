import type { Language } from "@/i18n"

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
