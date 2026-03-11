import { useCallback, useEffect, useState } from "react"

const GA_API_URL = import.meta.env.VITE_GA_API_URL as string | undefined

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

const CACHE_TTL = 15 * 60 * 1000 // 15분

let cached: PageViewsData | null = null
let fetching: Promise<PageViewsData | null> | null = null
let fetchError = false

function isCacheValid(): boolean {
  const ts = sessionStorage.getItem("page-views-ts")
  if (!ts) return false
  return Date.now() - Number(ts) < CACHE_TTL
}

function fetchPageViews(ignoreCache = false): Promise<PageViewsData | null> {
  if (!GA_API_URL) return Promise.resolve(null)

  if (!ignoreCache && cached && isCacheValid()) return Promise.resolve(cached)
  if (!ignoreCache && fetching) return fetching

  if (!ignoreCache) {
    const stored = sessionStorage.getItem("page-views")
    if (stored && isCacheValid()) {
      cached = JSON.parse(stored)
      return Promise.resolve(cached)
    }
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

  const refresh = useCallback(() => {
    setIsLoading(true)
    setIsError(false)
    fetchPageViews(true).then((d) => {
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
    refresh,
    getPostViews(slug: string): number | null {
      if (!data) return null
      const normalized = `/posts/${slug}`
      return data.pages[normalized] ?? null
    },
  }
}
