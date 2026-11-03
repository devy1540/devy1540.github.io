import { useEffect } from "react"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"
import { SITE, resolveSeo, type SeoOptions } from "@/lib/seo"

export function useMetaTags(options: SeoOptions = {}) {
  const { language } = useLanguage()
  const { title, description, ogTitle, ogDescription, url, type, noindex, canonicalPath, alternateUrls, datePublished, dateModified } = options

  useEffect(() => {
    const seo = resolveSeo({
      title, description, ogTitle, ogDescription, url, type, noindex, canonicalPath, datePublished, dateModified,
      alternateUrls: alternateUrls ?? (url ? { ko: localizePath(url, "ko"), en: localizePath(url, "en") } : undefined),
    }, language)
    document.title = seo.title
    document.documentElement.lang = language
    document.head.querySelectorAll('[data-seo="true"]').forEach(element => element.remove())
    for (const tag of seo.meta) {
      // Also replaces unmarked development-template metadata.
      const element = document.head.querySelector<HTMLMetaElement>(`meta[${tag.key}="${tag.name}"]`) ?? document.createElement("meta")
      element.setAttribute(tag.key, tag.name)
      element.content = tag.content
      element.dataset.seo = "true"
      document.head.appendChild(element)
    }
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement("link")
    canonical.rel = "canonical"
    canonical.href = seo.url
    canonical.dataset.seo = "true"
    document.head.appendChild(canonical)
    document.head.querySelectorAll('link[hreflang], link[type="application/rss+xml"]').forEach(element => element.remove())
    for (const alternate of seo.alternates) {
      const link = document.createElement("link")
      link.rel = "alternate"
      link.hreflang = alternate.hreflang
      link.href = alternate.href
      link.dataset.seo = "true"
      document.head.appendChild(link)
    }
    const feed = document.createElement("link")
    feed.rel = "alternate"
    feed.type = "application/rss+xml"
    feed.title = `${SITE.name} RSS`
    feed.href = seo.feedUrl
    feed.dataset.seo = "true"
    document.head.appendChild(feed)
  }, [title, description, ogTitle, ogDescription, url, type, noindex, canonicalPath, alternateUrls, datePublished, dateModified, language])
}
