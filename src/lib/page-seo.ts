import { ko, en, type Language } from "../i18n/translations"
import { localizePath } from "./i18n-routing"
import type { SeoOptions } from "./seo"

export const STATIC_PAGE_PATHS = ["/", "/posts/", "/tags/", "/series/", "/search/", "/analytics/", "/about/", "/privacy/"] as const
export type StaticPagePath = typeof STATIC_PAGE_PATHS[number]

export function staticPageSeo(path: StaticPagePath, language: Language) {
  const t = language === "ko" ? ko : en
  const pages: Record<StaticPagePath, { title: string; description: string; ogTitle?: string }> = {
    "/": { title: t.meta.homeTitle, description: t.meta.defaultDescription, ogTitle: t.meta.siteName },
    "/posts/": { title: t.common.posts, description: t.posts.description },
    "/tags/": { title: t.common.tags, description: t.tags.description },
    "/series/": { title: t.common.series, description: t.series.description },
    "/search/": { title: t.common.posts, description: t.posts.description },
    "/analytics/": { title: t.common.analytics, description: t.analytics.description },
    "/about/": { title: t.common.about, description: t.about.description },
    "/privacy/": { title: t.common.privacy, description: language === "en" ? "Privacy policy for dev.devy.dev." : "dev.devy.dev의 개인정보처리방침입니다." },
  }
  const canonicalPath = path === "/search/" ? "/posts/" : path
  return {
    ...pages[path],
    url: localizePath(path, language),
    noindex: path === "/search/",
    canonicalPath: localizePath(canonicalPath, language),
    alternateUrls: { ko: localizePath(canonicalPath, "ko"), en: localizePath(canonicalPath, "en") },
  } satisfies SeoOptions
}
