export interface DailyData { date: string; views: number }
export interface PageViewsData {
  totalViews: number
  pages: Record<string, number>
  daily: DailyData[]
  lastUpdated: string | null
}
const TTL = 15 * 60 * 1000
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0

export function parsePageViews(raw: unknown): PageViewsData {
  if (!raw || typeof raw !== "object") throw new Error("Invalid analytics response")
  const data = raw as Record<string, unknown>
  if (data.success === false || !isCount(data.totalViews) || !data.pages || typeof data.pages !== "object" || Array.isArray(data.pages)) throw new Error("Analytics unavailable")
  const pages = data.pages as Record<string, unknown>
  if (!Object.values(pages).every(isCount)) throw new Error("Invalid page counts")
  const daily = data.daily ?? []
  if (!Array.isArray(daily) || !daily.every(item => item && typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && isCount(item.views))) throw new Error("Invalid daily counts")
  const meta = data.meta as { cachedAt?: unknown } | undefined
  return { totalViews: data.totalViews, pages: pages as Record<string, number>, daily: daily as DailyData[], lastUpdated: typeof data.lastUpdated === "string" ? data.lastUpdated : typeof meta?.cachedAt === "string" ? meta.cachedAt : null }
}

export class PageViewsClient {
  private cached: PageViewsData | null = null
  private cachedAt = 0
  private pending: Promise<{ data: PageViewsData | null; isError: boolean }> | null = null

  private readonly url: string | undefined
  private readonly storage: () => Storage | undefined
  private readonly request: typeof fetch
  constructor(url: string | undefined, storage: () => Storage | undefined = () => window.sessionStorage, request: typeof fetch = fetch) {
    this.url = url; this.storage = storage; this.request = request
  }

  private readCache() {
    try {
      const storage = this.storage()
      const raw = storage?.getItem("page-views")
      const timestamp = Number(storage?.getItem("page-views-ts"))
      if (raw && timestamp > 0 && timestamp <= Date.now()) { this.cached = parsePageViews(JSON.parse(raw)); this.cachedAt = timestamp }
    } catch {
      try { this.storage()?.removeItem("page-views"); this.storage()?.removeItem("page-views-ts") } catch { /* 메모리 캐시로 계속 동작한다. */ }
    }
  }

  load(force = false): Promise<{ data: PageViewsData | null; isError: boolean }> {
    if (!this.url) return Promise.resolve({ data: null, isError: false })
    if (this.pending) return this.pending
    if (!this.cached) this.readCache()
    if (!force && this.cached && Date.now() - this.cachedAt < TTL) return Promise.resolve({ data: this.cached, isError: false })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    this.pending = Promise.resolve().then(() => this.request(this.url!, { signal: controller.signal }))
      .then(response => { if (!response.ok) throw new Error("Analytics request failed"); return response.json() })
      .then(raw => {
        this.cached = parsePageViews(raw)
        this.cachedAt = Date.now()
        try {
          const storage = this.storage()
          storage?.setItem("page-views", JSON.stringify(this.cached))
          storage?.setItem("page-views-ts", String(this.cachedAt))
        } catch { /* 저장소 차단은 정상 응답을 버리는 이유가 아니다. */ }
        return { data: this.cached, isError: false }
      })
      .catch(() => ({ data: this.cached, isError: true }))
      .finally(() => { clearTimeout(timeout); this.pending = null })
    return this.pending
  }
}
