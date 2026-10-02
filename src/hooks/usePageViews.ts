import { useCallback, useEffect, useState } from "react"
import type { Language } from "@/i18n"
import { PageViewsClient, type PageViewsData } from "@/lib/page-views-client"
export type { DailyData } from "@/lib/page-views-client"

const client = new PageViewsClient(import.meta.env.VITE_GA_API_URL)

export function usePageViews() {
  const [data, setData] = useState<PageViewsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  useEffect(() => {
    let active = true
    void client.load().then(result => {
      if (!active) return
      setData(result.data); setIsError(result.isError); setIsLoading(false)
    })
    return () => { active = false }
  }, [])
  const refresh = useCallback(() => {
    setIsLoading(true)
    void client.load(true).then(result => {
      setData(result.data); setIsError(result.isError); setIsLoading(false)
    })
  }, [])
  const getPostViews = useCallback((slug: string, language: Language = "ko"): number | null => {
    if (!data) return null
    return data.pages[language === "en" ? `/en/posts/${slug}` : `/posts/${slug}`] ?? null
  }, [data])
  return { totalViews: data?.totalViews ?? null, allPageViews: data?.pages ?? null, daily: data?.daily ?? [], isLoading, isError, lastUpdated: data?.lastUpdated ?? null, refresh, getPostViews }
}
