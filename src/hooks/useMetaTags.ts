import { useEffect } from "react"
import { useLanguage } from "@/i18n"

interface MetaTagsOptions {
  title?: string
  description?: string
  url?: string
  type?: string
  noindex?: boolean
}

const BASE_URL = "https://devy1540.github.io"

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
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL
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

    return () => {
      document.title = siteName
    }
  }, [title, description, url, type, noindex, language, t])
}
