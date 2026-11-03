import type { Language } from "../i18n/translations"

// Jekyll SEO Tag's site defaults + per-page overrides, shared by SSG and navigation.
export const SITE = {
  url: "https://dev.devy.dev",
  name: "Devy Archive",
  image: "https://dev.devy.dev/og-image.png?v=20260922-5",
  imageAlt: "What works, and why. — Engineering notes by Devy",
  description: {
    ko: "Devy의 기술 블로그입니다. 백엔드·클라우드 인프라·AI 개발과 운영에서 겪은 문제와 해결 과정을 기록합니다.",
    en: "Devy's technical blog about backend engineering, cloud infrastructure, and AI. Notes on development and operations problems and how they were solved.",
  },
} as const

export interface SeoOptions {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  url?: string
  type?: string
  noindex?: boolean
  canonicalPath?: string
  alternateUrls?: Partial<Record<Language, string>>
  datePublished?: string
  dateModified?: string
}

export function canonicalUrl(path = "/"): string {
  const url = new URL(path, `${SITE.url}/`)
  if (url.origin !== SITE.url) throw new Error(`SEO URL must belong to ${SITE.url}: ${path}`)
  url.pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`
  // Fragments select a position/filter in a document, never a separate canonical.
  url.hash = ""
  return url.href
}

export function languageAlternates(paths?: SeoOptions["alternateUrls"]) {
  return [
    ...(paths?.ko ? [{ hreflang: "ko-KR", href: canonicalUrl(paths.ko) }] : []),
    ...(paths?.en ? [{ hreflang: "en", href: canonicalUrl(paths.en) }] : []),
    ...(paths?.ko ? [{ hreflang: "x-default", href: canonicalUrl(paths.ko) }] : []),
  ]
}

export function resolveSeo(options: SeoOptions, language: Language) {
  const title = options.title ? `${options.title} | ${SITE.name}` : SITE.name
  const description = options.description || SITE.description[language]
  const previewTitle = options.ogTitle || title
  const previewDescription = options.ogDescription || description
  const url = canonicalUrl(options.canonicalPath ?? options.url)
  const meta: { key: "name" | "property"; name: string; content: string }[] = [
    { key: "name", name: "description", content: description },
    { key: "name", name: "robots", content: options.noindex ? "noindex, nofollow" : "index, follow" },
    { key: "property", name: "og:title", content: previewTitle },
    { key: "property", name: "og:description", content: previewDescription },
    { key: "property", name: "og:url", content: url },
    { key: "property", name: "og:type", content: options.type || "website" },
    { key: "property", name: "og:site_name", content: SITE.name },
    { key: "property", name: "og:locale", content: language === "ko" ? "ko_KR" : "en_US" },
    { key: "property", name: "og:image", content: SITE.image },
    { key: "property", name: "og:image:width", content: "1200" },
    { key: "property", name: "og:image:height", content: "630" },
    { key: "property", name: "og:image:alt", content: SITE.imageAlt },
    { key: "name", name: "twitter:card", content: "summary_large_image" },
    { key: "name", name: "twitter:title", content: previewTitle },
    { key: "name", name: "twitter:description", content: previewDescription },
    { key: "name", name: "twitter:image", content: SITE.image },
    { key: "name", name: "twitter:image:alt", content: SITE.imageAlt },
  ]
  if (options.type === "article" && !options.noindex) {
    if (options.datePublished) meta.push({ key: "property", name: "article:published_time", content: options.datePublished })
    if (options.dateModified) meta.push({ key: "property", name: "article:modified_time", content: options.dateModified })
  }
  return {
    title, meta, url,
    alternates: languageAlternates(options.alternateUrls),
    feedUrl: `${SITE.url}${language === "en" ? "/en" : ""}/rss.xml`,
  }
}

export function escapeMarkup(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

export function renderSeoHead(options: SeoOptions, language: Language) {
  const seo = resolveSeo(options, language)
  return [
    `<title>${escapeMarkup(seo.title)}</title>`,
    ...seo.meta.map(tag => `<meta ${tag.key}="${tag.name}" content="${escapeMarkup(tag.content)}" data-seo="true" />`),
    `<link rel="canonical" href="${escapeMarkup(seo.url)}" data-seo="true" />`,
    ...seo.alternates.map(alt => `<link rel="alternate" hreflang="${alt.hreflang}" href="${escapeMarkup(alt.href)}" data-seo="true" />`),
    `<link rel="alternate" type="application/rss+xml" title="${SITE.name} RSS" href="${seo.feedUrl}" data-seo="true" />`,
    `<link rel="sitemap" type="application/xml" title="Sitemap" href="${SITE.url}/sitemap.xml" />`,
  ].join("\n    ")
}
