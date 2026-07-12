import type { DailyData } from "@/hooks/usePageViews"

export interface DailySeriesPoint extends DailyData {
  label: string
}

function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function formatShortDate(dateKey: string): string {
  const [, month = "0", day = "0"] = dateKey.split("-")
  return `${Number(month)}/${Number(day)}`
}

export function buildDailySeries(days: number, fetched: DailyData[]): DailySeriesPoint[] {
  const map = new Map(fetched.map((d) => [d.date, d.views]))
  const today = new Date()

  return Array.from({ length: days }, (_, index) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - index))
    const date = formatDateKey(d)

    return {
      date,
      label: formatShortDate(date),
      views: map.get(date) ?? 0,
    }
  })
}

export function sumViews(data: Pick<DailyData, "views">[]): number {
  return data.reduce((sum, d) => sum + d.views, 0)
}

export function averageViews(data: Pick<DailyData, "views">[]): number {
  if (data.length === 0) return 0
  return sumViews(data) / data.length
}

export function getPeakDay(data: DailySeriesPoint[]): DailySeriesPoint | null {
  if (data.length === 0) return null
  return data.reduce((peak, d) => (d.views > peak.views ? d : peak), data[0]!)
}

export function getPreviousComparableRange(days: number, fetched: DailyData[]): DailySeriesPoint[] {
  if (fetched.length < days * 2) return []

  const sorted = [...fetched].sort((a, b) => a.date.localeCompare(b.date))
  return sorted
    .slice(Math.max(0, sorted.length - days * 2), sorted.length - days)
    .map((d) => ({ ...d, label: formatShortDate(d.date) }))
}

export function getPercentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}
