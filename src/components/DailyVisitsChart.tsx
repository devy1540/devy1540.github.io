import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Eye, TrendingUp } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { DailyData } from "@/hooks/usePageViews"
import { useT } from "@/i18n"
import { buildDailySeries, sumViews } from "@/lib/analytics-data"

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface DailyVisitsChartProps {
  totalViews: number | null
  daily: DailyData[]
  isLoading: boolean
  rangeDays?: number
}

export function DailyVisitsChart({ totalViews, daily, isLoading, rangeDays = 30 }: DailyVisitsChartProps) {
  const t = useT()

  const data = buildDailySeries(rangeDays, daily)
  const rangeTotal = sumViews(data)
  const rangeLabel = rangeDays === 7
    ? t.analytics.range7d
    : rangeDays === 14
      ? t.analytics.range14d
      : t.analytics.range30d

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex gap-6 mb-4">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-20" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
        <Skeleton className="h-[100px] w-full rounded-md" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Eye className="size-3" />
              {t.components.totalViews}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {totalViews !== null ? totalViews.toLocaleString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="size-3" />
              {rangeLabel}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {rangeTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[100px] w-full">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-views)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-views)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => {
              const [, m, d] = v.split("-")
              return `${+m}/${+d}`
            }}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={40}
          />
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" hideLabel={false} />}
            labelFormatter={(v) => v}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--color-views)"
            strokeWidth={2}
            fill="url(#fillViews)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
