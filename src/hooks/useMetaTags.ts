import { useEffect } from "react"

interface MetaTagsOptions {
  title?: string
  description?: string
  url?: string
  type?: string
}

const SITE_NAME = "Devy's Blog"
const DEFAULT_DESCRIPTION = "개발하며 배운 것들을 정리하고 공유합니다."
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
}: MetaTagsOptions = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const desc = description || DEFAULT_DESCRIPTION
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL

    document.title = fullTitle

    setNameMeta("description", desc)
    setMeta("og:title", fullTitle)
    setMeta("og:description", desc)
    setMeta("og:url", fullUrl)
    setMeta("og:type", type)
    setMeta("og:site_name", SITE_NAME)

    return () => {
      document.title = SITE_NAME
    }
  }, [title, description, url, type])
}
