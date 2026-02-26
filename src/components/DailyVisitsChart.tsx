import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Eye, TrendingUp } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageViews } from "@/hooks/usePageViews"
import { useT } from "@/i18n"

const GA_API_URL =
  "https://script.google.com/macros/s/AKfycbxx7z1-AvZnCWurLcNBSWiWEDqMXwUoZeC7PsuiHQGloISAb0ZjQrUq0MWbC8pUiSMF/exec"

interface DailyData {
  date: string
  views: number
}

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function generateLast30Days(): DailyData[] {
  const days: DailyData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    days.push({ date: `${yyyy}-${mm}-${dd}`, views: 0 })
  }
  return days
}

function mergeData(base: DailyData[], fetched: DailyData[]): DailyData[] {
  const map = new Map(fetched.map((d) => [d.date, d.views]))
  return base.map((d) => ({ ...d, views: map.get(d.date) ?? 0 }))
}

export function DailyVisitsChart() {
  const { totalViews } = usePageViews()
  const t = useT()
  const [data, setData] = useState<DailyData[]>(() => {
    const cached = sessionStorage.getItem("daily-views")
    if (cached) return mergeData(generateLast30Days(), JSON.parse(cached))
    return generateLast30Days()
  })
  const [fetched, setFetched] = useState(() => !!sessionStorage.getItem("daily-views"))

  useEffect(() => {
    if (fetched) return

    fetch(`${GA_API_URL}?type=daily`)
      .then((res) => res.json())
      .then((res) => {
        if (res.daily) {
          const merged = mergeData(generateLast30Days(), res.daily)
          setData(merged)
          sessionStorage.setItem("daily-views", JSON.stringify(res.daily))
        }
        setFetched(true)
      })
      .catch(() => setFetched(true))
  }, [fetched])

  const monthlyTotal = data.reduce((sum, d) => sum + d.views, 0)
  const isLoading = totalViews === null && !fetched

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
              {t.components.last30Days}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {monthlyTotal.toLocaleString()}
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
