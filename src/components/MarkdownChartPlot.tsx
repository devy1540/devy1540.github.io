import { useId } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useLanguage } from "@/i18n"
import { formatChartValue, type MarkdownChartSpec } from "@/lib/markdown-chart"

export function MarkdownChartPlot({ spec }: { spec: MarkdownChartSpec }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const { language, t } = useLanguage()
  const horizontal = spec.orientation === "horizontal"
  const stacked = spec.type === "stacked-bar"
  const data = spec.rows.map((row) => ({
    label: row.label,
    displayLabel: `${row.label}${row.partial ? "*" : ""}`,
    note: row.note, partial: row.partial,
    ...row.values,
    total: Object.values(row.values).reduce((sum, value) => sum + value, 0),
  }))
  const config: ChartConfig = Object.fromEntries(spec.series.map((series) => [series.key, { label: series.label, color: `var(--${series.color})` }]))
  const format = (value: number) => formatChartValue(value, spec.decimals, language)
  const height = horizontal ? Math.max(240, data.length * 64 + 60) : 300

  return (
    <div className="space-y-3">
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height }} aria-label={`${spec.title} · ${spec.unit}`}>
        <BarChart accessibilityLayer={!horizontal} role={horizontal ? "img" : undefined} aria-label={spec.title} data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 24, right: horizontal ? 64 : 12, bottom: 12, left: 0 }}>
          <defs>
            {spec.series.map((series) => (
              <pattern key={series.key} id={`${id}-${series.key}`} width="7" height="7" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill={`var(--color-${series.key})`} />
                <path d="M-1,1 l2,-2 M0,7 l7,-7 M6,8 l2,-2" stroke="var(--background)" strokeWidth="1.5" />
              </pattern>
            ))}
          </defs>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="var(--border)" />
          <XAxis
            type={horizontal ? "number" : "category"}
            dataKey={horizontal ? undefined : "displayLabel"}
            domain={horizontal ? [0, "auto"] : undefined}
            tickFormatter={horizontal ? format : undefined}
            tickCount={horizontal ? 4 : undefined}
            tickLine={false} axisLine={false} tickMargin={10} minTickGap={8}
          />
          <YAxis
            type={horizontal ? "category" : "number"}
            dataKey={horizontal ? "displayLabel" : undefined}
            domain={horizontal ? undefined : [0, "auto"]}
            tickFormatter={horizontal ? undefined : format}
            width={horizontal ? 64 : 36}
            allowDecimals={spec.decimals > 0}
            tickLine={false} axisLine={false} tickMargin={8}
          />
          <ChartTooltip content={
            <ChartTooltipContent className="max-w-64 text-sm" labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as (typeof data)[number] | undefined
              return row ? <div className="space-y-1"><p>{row.displayLabel}{row.partial ? ` · ${t.components.chartPartial}` : ""}</p>{row.note && <p className="font-normal text-muted-foreground">{row.note}</p>}</div> : null
            }} formatter={(value, name, item) => (
              <div className="flex w-full items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground"><span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />{config[String(name)]?.label ?? String(name)}</span>
                <span className="font-medium tabular-nums">{format(Number(value))}{spec.unit}</span>
              </div>
            )} />
          } />
          {spec.series.map((series, index) => (
            <Bar key={series.key} dataKey={series.key} stackId={stacked ? "total" : undefined} fill={`var(--color-${series.key})`} maxBarSize={horizontal ? 40 : 56} isAnimationActive={false}>
              {data.map((row) => <Cell key={row.label} fill={row.partial ? `url(#${id}-${series.key})` : `var(--color-${series.key})`} />)}
              {(!stacked || index === spec.series.length - 1) && (
                <LabelList dataKey={stacked ? "total" : series.key} position={horizontal ? "right" : "top"} offset={8} fill="var(--foreground)" fontSize={12} formatter={(value: unknown) => `${format(Number(value))}${horizontal ? spec.unit : ""}`} />
              )}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>
      {spec.series.length > 1 && <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm" aria-label={t.components.chartLegend}>
        {spec.series.map((series) => <li key={series.key} className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ backgroundColor: `var(--${series.color})` }} aria-hidden="true" />{series.label}</li>)}
      </ul>}
    </div>
  )
}
