import type { DailyData } from "./page-views-client"

export interface DailySeriesPoint extends DailyData {
  label: string
}

function dayKeys(days: number, offset: number, now = new Date()): string[] {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)
  const value = (type: string) => Number(parts.find(part => part.type === type)!.value)
  const today = Date.UTC(value("year"), value("month") - 1, value("day"))
  return Array.from({ length: days }, (_, index) => new Date(today - (offset + days - 1 - index) * 86400000).toISOString().slice(0, 10))
}
export function formatShortDate(dateKey: string): string {
  const [, month = "0", day = "0"] = dateKey.split("-")
  return `${Number(month)}/${Number(day)}`
}
export function buildDailySeries(days: number, fetched: DailyData[], now = new Date()): DailySeriesPoint[] {
  const map = new Map(fetched.map(item => [item.date, item.views]))
  return dayKeys(days, 0, now).map(date => ({ date, label: formatShortDate(date), views: map.get(date) ?? 0 }))
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

export function getPreviousComparableRange(days: number, fetched: DailyData[], now = new Date()): DailySeriesPoint[] {
  const keys = dayKeys(days, days, now)
  const sorted = [...fetched].sort((a, b) => a.date.localeCompare(b.date))
  if (!sorted.length || sorted[0]!.date > keys[0]!) return []
  const map = new Map(sorted.map(item => [item.date, item.views]))
  return keys.map(date => ({ date, label: formatShortDate(date), views: map.get(date) ?? 0 }))
}

export function getPercentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}
