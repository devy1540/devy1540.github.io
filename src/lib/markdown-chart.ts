export interface ChartSeries {
  key: string
  label: string
  color: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
}

export interface ChartRow {
  label: string
  note?: string
  partial: boolean
  values: Record<string, number>
}

export interface MarkdownChartSpec {
  type: "bar" | "stacked-bar"
  orientation: "vertical" | "horizontal"
  title: string
  description?: string
  categoryLabel: string
  unit: string
  decimals: number
  series: ChartSeries[]
  rows: ChartRow[]
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown, max = 160): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max
}

/** Only data is accepted: no executable code, HTML or arbitrary CSS configuration. */
export function parseMarkdownChart(source: string): MarkdownChartSpec | null {
  if (source.length > 60_000) return null
  try {
    const input: unknown = JSON.parse(source)
    if (!object(input) || !["bar", "stacked-bar"].includes(String(input.type))) return null
    if (!text(input.title) || !text(input.categoryLabel, 80) || !text(input.unit, 24)) return null
    if (input.description !== undefined && !text(input.description, 500)) return null
    const orientation = input.orientation ?? "vertical"
    if (orientation !== "vertical" && orientation !== "horizontal") return null
    const decimals = input.decimals ?? 0
    if (typeof decimals !== "number" || !Number.isInteger(decimals) || decimals < 0 || decimals > 3) return null
    if (!Array.isArray(input.series) || input.series.length < 1 || input.series.length > 5) return null
    if (!Array.isArray(input.data) || input.data.length < 1 || input.data.length > 60) return null

    const keys = new Set<string>()
    const reserved = new Set(["label", "note", "partial", "total", "displayLabel", "constructor", "prototype"])
    const series: ChartSeries[] = []
    for (const [index, item] of input.series.entries()) {
      if (!object(item) || !text(item.key, 32) || !/^[a-z][a-zA-Z0-9]*$/.test(item.key)) return null
      if (keys.has(item.key) || reserved.has(item.key) || !text(item.label, 80)) return null
      const color = item.color ?? `chart-${index + 1}`
      if (typeof color !== "string" || !/^chart-[1-5]$/.test(color)) return null
      keys.add(item.key)
      series.push({ key: item.key, label: item.label, color: color as ChartSeries["color"] })
    }

    const labels = new Set<string>()
    const rows: ChartRow[] = []
    for (const item of input.data) {
      if (!object(item) || !text(item.label, 80) || labels.has(item.label)) return null
      if (item.note !== undefined && !text(item.note, 300)) return null
      if (item.partial !== undefined && typeof item.partial !== "boolean") return null
      const values: Record<string, number> = {}
      for (const { key } of series) {
        const value = item[key]
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) return null
        values[key] = value
      }
      if (!Number.isFinite(Object.values(values).reduce((sum, value) => sum + value, 0))) return null
      labels.add(item.label)
      rows.push({ label: item.label, note: item.note as string | undefined, partial: item.partial === true, values })
    }
    return {
      type: input.type as MarkdownChartSpec["type"], orientation,
      title: input.title, description: input.description as string | undefined,
      categoryLabel: input.categoryLabel, unit: input.unit, decimals, series, rows,
    }
  } catch {
    return null
  }
}

export function formatChartValue(value: number, decimals: number, locale = "ko") {
  return value.toLocaleString(locale, { maximumFractionDigits: decimals })
}
