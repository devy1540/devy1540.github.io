import { useEffect, useState } from "react"

const GA_API_URL =
  "https://script.google.com/macros/s/AKfycbxx7z1-AvZnCWurLcNBSWiWEDqMXwUoZeC7PsuiHQGloISAb0ZjQrUq0MWbC8pUiSMF/exec"

export interface DailyData {
  date: string
  views: number
}

interface PageViewsData {
  totalViews: number
  pages: Record<string, number>
  daily: DailyData[]
  lastUpdated: string | null
}

const CACHE_TTL = 60 * 60 * 1000 // 1시간

let cached: PageViewsData | null = null
let fetching: Promise<PageViewsData | null> | null = null
let fetchError = false

function isCacheValid(): boolean {
  const ts = sessionStorage.getItem("page-views-ts")
  if (!ts) return false
  return Date.now() - Number(ts) < CACHE_TTL
}

function fetchPageViews(): Promise<PageViewsData | null> {
  if (cached && isCacheValid()) return Promise.resolve(cached)
  if (fetching) return fetching

  const stored = sessionStorage.getItem("page-views")
  if (stored && isCacheValid()) {
    cached = JSON.parse(stored)
    return Promise.resolve(cached)
  }

  cached = null
  fetchError = false
  fetching = fetch(GA_API_URL)
    .then((res) => res.json())
    .then((raw: {
      totalViews: number
      pages: Record<string, number>
      daily?: DailyData[]
      meta?: { cachedAt?: string }
    }) => {
      const data: PageViewsData = {
        totalViews: raw.totalViews,
        pages: raw.pages,
        daily: raw.daily ?? [],
        lastUpdated: raw.meta?.cachedAt ?? null,
      }
      cached = data
      sessionStorage.setItem("page-views", JSON.stringify(data))
      sessionStorage.setItem("page-views-ts", String(Date.now()))
      return data
    })
    .catch(() => {
      fetchError = true
      return null
    })
    .finally(() => { fetching = null })

  return fetching
}

export function usePageViews() {
  const [data, setData] = useState<PageViewsData | null>(cached)
  const [isLoading, setIsLoading] = useState(!cached)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    fetchPageViews().then((d) => {
      if (d) {
        setData(d)
        setIsError(false)
      } else {
        setIsError(fetchError)
      }
      setIsLoading(false)
    })
  }, [])

  return {
    totalViews: data?.totalViews ?? null,
    allPageViews: data?.pages ?? null,
    daily: data?.daily ?? [],
    isLoading,
    isError,
    lastUpdated: data?.lastUpdated ?? null,
    getPostViews(slug: string): number | null {
      if (!data) return null
      return data.pages[`/posts/${slug}`] ?? data.pages[`/posts/${slug}/`] ?? null
    },
  }
}
