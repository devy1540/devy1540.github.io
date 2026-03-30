import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface BenchmarkRow {
  label: string
  values: number[]
  format?: string[]
  best?: number
}

interface BenchmarkData {
  columns: string[]
  rows: BenchmarkRow[]
}

const COLORS = ["#4ade80", "#facc15", "#60a5fa"]

export function BenchmarkChart({ data }: { data: string }) {
  const [view, setView] = useState<string>("table")
  const [selectedRow, setSelectedRow] = useState(0)

  const parsed = useMemo<BenchmarkData | null>(() => {
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }, [data])

  if (!parsed) return null

  const { columns, rows } = parsed

  const chartConfig = Object.fromEntries(
    columns.map((col, i) => [
      col,
      { label: col, color: COLORS[i % COLORS.length] },
    ])
  ) satisfies ChartConfig

  const chartData = columns.map((col, i) => ({
    name: col,
    value: rows[selectedRow]!.values[i]!,
    formatted: rows[selectedRow]!.format?.[i] ?? String(rows[selectedRow]!.values[i]),
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <Card className="not-prose my-6 gap-0 py-0">
      <div className="flex justify-end px-4 py-1.5 border-b border-border">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="table" className="text-xs px-3 h-7">
            표
          </ToggleGroupItem>
          <ToggleGroupItem value="chart" className="text-xs px-3 h-7">
            차트
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <CardContent className="p-0">
        {view === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground" />
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-center font-medium text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                      {row.label}
                    </td>
                    {row.values.map((_, ci) => {
                      const display = row.format?.[ci] ?? String(row.values[ci])
                      const isBest = row.best === ci
                      return (
                        <td
                          key={ci}
                          className="px-4 py-2.5 text-center whitespace-nowrap"
                        >
                          {isBest ? (
                            <span className="font-bold text-primary">
                              {display}
                            </span>
                          ) : (
                            display
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "chart" && (
          <div className="p-4">
            {rows.length > 1 && (
              <div className="mb-4 flex items-center gap-2">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="benchmark-metric"
                >
                  지표:
                </label>
                <select
                  id="benchmark-metric"
                  value={selectedRow}
                  onChange={(e) => setSelectedRow(Number(e.target.value))}
                  className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                >
                  {rows.map((row, i) => (
                    <option key={i} value={i}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
                    return String(v)
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(_, __, props) => {
                        const item = props.payload as { formatted?: string; name?: string }
                        return (
                          <span>
                            {item.name}: <span className="font-bold">{item.formatted}</span>
                          </span>
                        )
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
