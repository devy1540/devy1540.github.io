import { useEffect } from "react"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"
import type { Language } from "@/i18n"

interface MetaTagsOptions {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  url?: string
  type?: string
  noindex?: boolean
  canonicalPath?: string
  alternateUrls?: Partial<Record<Language, string>>
}

const BASE_URL = "https://devy1540.dev"
const OG_IMAGE_URL = `${BASE_URL}/og-image.png?v=20260610`
const OG_IMAGE_ALT = "Devy Archive preview image"

function toCanonicalUrl(path?: string) {
  if (!path) return BASE_URL
  // Normalize the trailing slash on the pathname only, keeping any ?query/#hash intact
  // (e.g. "/tags/?tag=java" must not become "/tags/?tag=java/").
  const [, pathname = "/", suffix = ""] = path.match(/^([^?#]*)([?#].*)?$/) ?? []
  const normalizedPathname = pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`
  return `${BASE_URL}${normalizedPathname}${suffix}`
}

function setMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("property", property)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function setNameMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("name", name)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    document.head.appendChild(el)
  }
  el.setAttribute("data-meta", "true")
  el.setAttribute("href", href)
}

function setAlternateLink(hreflang: string, href: string) {
  let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`)
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "alternate")
    el.setAttribute("hreflang", hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute("data-meta", "true")
  el.setAttribute("href", href)
}

export function useMetaTags({
  title,
  description,
  ogTitle,
  ogDescription,
  url,
  type = "website",
  noindex = false,
  canonicalPath,
  alternateUrls,
}: MetaTagsOptions = {}) {
  const { language, t } = useLanguage()

  useEffect(() => {
    const siteName = t.meta.siteName
    const fullTitle = title ? `${title} | ${siteName}` : siteName
    const desc = description || t.meta.defaultDescription
    const previewTitle = ogTitle || fullTitle
    const previewDescription = ogDescription || desc
    const fullUrl = toCanonicalUrl(canonicalPath ?? url)
    const ogLocale = language === "ko" ? "ko_KR" : "en_US"
    const alternates = alternateUrls ?? (url ? {
      ko: localizePath(url, "ko"),
      en: localizePath(url, "en"),
    } satisfies Partial<Record<Language, string>> : undefined)

    document.title = fullTitle

    setNameMeta("description", desc)
    setNameMeta("robots", noindex ? "noindex, nofollow" : "index, follow")
    setMeta("og:title", previewTitle)
    setMeta("og:description", previewDescription)
    setMeta("og:url", fullUrl)
    setMeta("og:type", type)
    setMeta("og:site_name", siteName)
    setMeta("og:locale", ogLocale)
    setMeta("og:image", OG_IMAGE_URL)
    setMeta("og:image:width", "1200")
    setMeta("og:image:height", "630")
    setMeta("og:image:alt", OG_IMAGE_ALT)

    setLink("canonical", fullUrl)
    document.querySelectorAll('link[rel="alternate"][data-meta="true"]').forEach((el) => el.remove())
    if (alternates?.ko) setAlternateLink("ko-KR", toCanonicalUrl(alternates.ko))
    if (alternates?.en) setAlternateLink("en", toCanonicalUrl(alternates.en))
    if (alternates?.ko) setAlternateLink("x-default", toCanonicalUrl(alternates.ko))

    setNameMeta("twitter:card", "summary_large_image")
    setNameMeta("twitter:title", previewTitle)
    setNameMeta("twitter:description", previewDescription)
    setNameMeta("twitter:image", OG_IMAGE_URL)
    setNameMeta("twitter:image:alt", OG_IMAGE_ALT)

    return () => {
      document.title = siteName
    }
  }, [title, description, ogTitle, ogDescription, url, type, noindex, canonicalPath, alternateUrls, language, t])
}
