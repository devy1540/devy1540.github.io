import { useEffect, useState } from "react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const GA_API_URL =
  "https://script.google.com/macros/s/AKfycbxx7z1-AvZnCWurLcNBSWiWEDqMXwUoZeC7PsuiHQGloISAb0ZjQrUq0MWbC8pUiSMF/exec"

interface DailyData {
  date: string
  views: number
}

const chartConfig = {
  views: {
    label: "Views",
    color: "oklch(var(--primary))",
  },
} satisfies ChartConfig

export function DailyVisitsChart() {
  const [data, setData] = useState<DailyData[]>(() => {
    const cached = sessionStorage.getItem("daily-views")
    return cached ? JSON.parse(cached) : []
  })

  useEffect(() => {
    if (data.length > 0) return

    fetch(`${GA_API_URL}?type=daily`)
      .then((res) => res.json())
      .then((res) => {
        if (res.daily) {
          setData(res.daily)
          sessionStorage.setItem("daily-views", JSON.stringify(res.daily))
        }
      })
      .catch(() => {})
  }, [data.length])

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Daily Views (30 days)
      </h3>
      {data.length > 0 ? (
        <ChartContainer config={chartConfig} className="aspect-[4/1] w-full">
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-views)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-views)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(5)}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
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
      ) : (
        <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
          데이터 수집 중...
        </div>
      )}
    </div>
  )
}
