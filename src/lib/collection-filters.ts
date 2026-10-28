import type { Language } from "@/i18n"
import { localizePath, stripLanguagePrefix } from "./i18n-routing.ts"

const filterPrefix = "#filters:"

// Collection filters are reader state, not separate documents for search engines.
export function readCollectionFilters(search: string, hash: string): URLSearchParams {
  return new URLSearchParams(hash.startsWith(filterPrefix) ? hash.slice(filterPrefix.length) : search)
}

export function collectionFilterHash(params: URLSearchParams): string {
  const query = params.toString()
  return query ? `${filterPrefix}${query}` : ""
}

export function collectionFilterPath(path: string, params: URLSearchParams, language: Language): string {
  return `${localizePath(path, language)}${collectionFilterHash(params)}`
}

export function isCollectionFilterHash(pathname: string, hash: string): boolean {
  const path = stripLanguagePrefix(pathname).replace(/\/+$/, "")
  return ["/posts", "/tags", "/series"].includes(path) && hash.startsWith(filterPrefix)
}
