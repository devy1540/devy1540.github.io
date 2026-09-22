import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useLanguage, useT } from "@/i18n"
import { useDeferredModule } from "@/hooks/useDeferredModule"
import { createRetryableLoader } from "@/lib/async-loader"
import { formatChartValue, parseMarkdownChart, type MarkdownChartSpec } from "@/lib/markdown-chart"

const loadChart = createRetryableLoader(() => import("@/components/MarkdownChartPlot"))

function DataTable({ spec }: { spec: MarkdownChartSpec }) {
  const { language, t } = useLanguage()
  const hasNotes = spec.rows.some((row) => row.note)
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{spec.title} · {spec.unit}</caption>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="p-3 text-left font-medium">{spec.categoryLabel}</th>
            {spec.series.map((series) => <th scope="col" key={series.key} className="p-3 text-right font-medium">{series.label}</th>)}
            {hasNotes && <th scope="col" className="p-3 text-left font-medium">{t.components.chartNote}</th>}
          </tr>
        </thead>
        <tbody>
          {spec.rows.map((row) => (
            <tr key={row.label} className="border-b border-border/60 last:border-0">
              <th scope="row" className="p-3 text-left font-medium whitespace-nowrap">
                {row.label}{row.partial ? "*" : ""}
                {row.partial && <span className="sr-only"> · {t.components.chartPartial}</span>}
              </th>
              {spec.series.map((series) => <td key={series.key} className="p-3 text-right tabular-nums whitespace-nowrap">{formatChartValue(row.values[series.key]!, spec.decimals, language)}</td>)}
              {hasNotes && <td className="min-w-36 p-3 text-muted-foreground">{row.note ?? "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DeferredPlot({ spec }: { spec: MarkdownChartSpec }) {
  const { value: module, error, retry } = useDeferredModule(loadChart)
  const t = useT()
  if (module) return <module.MarkdownChartPlot spec={spec} />
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground" role={error ? "alert" : "status"}>
        <p>{error ? t.common.chartLoadError : t.common.chartLoading}</p>
        {error && <Button type="button" variant="outline" size="sm" onClick={retry}>{t.common.retry}</Button>}
      </div>
      <DataTable spec={spec} />
    </>
  )
}

/** The server and first hydration both render an ordinary data table. */
export function MarkdownChart({ source }: { source: string }) {
  const spec = useMemo(() => parseMarkdownChart(source), [source])
  const [view, setView] = useState("chart")
  const [nearby, setNearby] = useState(false)
  const container = useRef<HTMLElement>(null)
  const id = useId()
  const t = useT()

  useEffect(() => {
    const element = container.current
    if (!element) return
    let active = true
    if (typeof IntersectionObserver === "undefined") {
      void Promise.resolve().then(() => { if (active) setNearby(true) })
      return () => { active = false }
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setNearby(true)
        observer.disconnect()
      }
    }, { rootMargin: "200px" })
    observer.observe(element)
    return () => { active = false; observer.disconnect() }
  }, [])

  if (!spec) return <p className="not-prose my-6 text-sm text-muted-foreground" role="alert">{t.components.chartDataError}</p>

  return (
    <figure ref={container} aria-labelledby={`${id}-title`} data-markdown-chart className="not-prose my-8 min-w-0 space-y-4">
      <figcaption className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id={`${id}-title`} className="text-base font-semibold">{spec.title}</p>
          <ToggleGroup type="single" value={view} variant="outline" size="sm" aria-label={`${spec.title} · ${t.components.chartViewLabel}`} onValueChange={(value) => {
            if (!value) return
            setView(value)
            if (value === "chart") setNearby(true)
          }}>
            <ToggleGroupItem value="chart" aria-controls={`${id}-content`}>{t.components.chartView}</ToggleGroupItem>
            <ToggleGroupItem value="table" aria-controls={`${id}-content`}>{t.components.chartTable}</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {spec.description && <p className="text-sm leading-relaxed text-muted-foreground">{spec.description}</p>}
        <p className="text-xs text-muted-foreground">{t.components.chartUnit}: {spec.unit}</p>
      </figcaption>
      <div id={`${id}-content`}>
        {view === "chart" && nearby ? <DeferredPlot spec={spec} /> : <DataTable spec={spec} />}
      </div>
    </figure>
  )
}
