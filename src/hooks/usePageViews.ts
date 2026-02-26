import { useEffect, useState } from "react"

const GA_API_URL =
  "https://script.google.com/macros/s/AKfycbxx7z1-AvZnCWurLcNBSWiWEDqMXwUoZeC7PsuiHQGloISAb0ZjQrUq0MWbC8pUiSMF/exec"

interface PageViewsData {
  totalViews: number
  pages: Record<string, number>
}

let cached: PageViewsData | null = null
let fetching: Promise<PageViewsData | null> | null = null

function fetchPageViews(): Promise<PageViewsData | null> {
  if (cached) return Promise.resolve(cached)
  if (fetching) return fetching

  const stored = sessionStorage.getItem("page-views")
  if (stored) {
    cached = JSON.parse(stored)
    return Promise.resolve(cached)
  }

  fetching = fetch(GA_API_URL)
    .then((res) => res.json())
    .then((data: PageViewsData) => {
      cached = data
      sessionStorage.setItem("page-views", JSON.stringify(data))
      return data
    })
    .catch(() => null)

  return fetching
}

export function usePageViews() {
  const [data, setData] = useState<PageViewsData | null>(cached)

  useEffect(() => {
    fetchPageViews().then((d) => {
      if (d) setData(d)
    })
  }, [])

  return {
    totalViews: data?.totalViews ?? null,
    allPageViews: data?.pages ?? null,
    getPostViews(slug: string): number | null {
      if (!data) return null
      return data.pages[`/posts/${slug}`] ?? data.pages[`/posts/${slug}/`] ?? null
    },
  }
}
