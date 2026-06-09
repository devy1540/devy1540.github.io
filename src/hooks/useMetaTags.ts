import { useEffect } from "react"
import { useLanguage } from "@/i18n"

interface MetaTagsOptions {
  title?: string
  description?: string
  url?: string
  type?: string
  noindex?: boolean
}

const BASE_URL = "https://devy1540.dev"

function toCanonicalUrl(path?: string) {
  if (!path) return BASE_URL
  const normalizedPath = path === "/" || path.endsWith("/") ? path : `${path}/`
  return `${BASE_URL}${normalizedPath}`
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

export function useMetaTags({
  title,
  description,
  url,
  type = "website",
  noindex = false,
}: MetaTagsOptions = {}) {
  const { language, t } = useLanguage()

  useEffect(() => {
    const siteName = t.meta.siteName
    const fullTitle = title ? `${title} | ${siteName}` : siteName
    const desc = description || t.meta.defaultDescription
    const fullUrl = toCanonicalUrl(url)
    const ogLocale = language === "ko" ? "ko_KR" : "en_US"

    document.title = fullTitle

    setNameMeta("description", desc)
    setNameMeta("robots", noindex ? "noindex, nofollow" : "index, follow")
    setMeta("og:title", fullTitle)
    setMeta("og:description", desc)
    setMeta("og:url", fullUrl)
    setMeta("og:type", type)
    setMeta("og:site_name", siteName)
    setMeta("og:locale", ogLocale)
    setMeta("og:image", `${BASE_URL}/og-image.png`)
    setMeta("og:image:width", "1200")
    setMeta("og:image:height", "630")

    setLink("canonical", fullUrl)
    setNameMeta("twitter:card", "summary_large_image")
    setNameMeta("twitter:title", fullTitle)
    setNameMeta("twitter:description", desc)
    setNameMeta("twitter:image", `${BASE_URL}/og-image.png`)

    return () => {
      document.title = siteName
    }
  }, [title, description, url, type, noindex, language, t])
}
