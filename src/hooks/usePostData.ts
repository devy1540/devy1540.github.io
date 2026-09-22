import { useEffect, useSyncExternalStore } from "react"
import type { Language } from "@/i18n"
import { getPostDataVersion, getServerPostDataVersion, subscribePostData, loadPostContent, hasPostContent, hasPostContentError, getSearchStatus, getPostSearchText, loadPostSearch } from "@/lib/posts"

export function usePostContent(slug: string | undefined, language: Language) {
  useSyncExternalStore(subscribePostData, getPostDataVersion, getServerPostDataVersion)
  useEffect(() => {
    if (slug) void loadPostContent(slug, language).catch(() => undefined)
  }, [slug, language])
  return { loaded: !!slug && hasPostContent(slug, language), error: !!slug && hasPostContentError(slug, language) }
}

export function usePostSearchIndex(enabled: boolean, language: Language) {
  useSyncExternalStore(subscribePostData, getPostDataVersion, getServerPostDataVersion)
  useEffect(() => {
    if (enabled) void loadPostSearch(language)
  }, [enabled, language])
  const status = getSearchStatus(language)
  return { texts: getPostSearchText(language), loading: enabled && (status === "idle" || status === "loading"), error: enabled && status === "error" }
}
