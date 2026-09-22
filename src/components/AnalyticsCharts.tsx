import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useT } from "@/i18n"

export { DailyVisitsChart } from "@/components/DailyVisitsChart"

export function TagDistributionChart({ data }: { data: { tag: string; count: number; fill: string }[] }) {
  const t = useT()
  const config: ChartConfig = { count: { label: t.analytics.postsCount } }
  for (const item of data) config[item.tag] = { label: item.tag, color: item.fill }

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[300px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="tag" hideLabel />} />
        <Pie data={data} dataKey="count" nameKey="tag" innerRadius={60} strokeWidth={2} stroke="var(--background)">
          <Label content={({ viewBox }) => {
            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                    {data.reduce((sum, item) => sum + item.count, 0)}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-sm">
                    {t.analytics.postsCount}
                  </tspan>
                </text>
              )
            }
          }} />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function MonthlyPostsChart({ data }: { data: { month: string; count: number }[] }) {
  const t = useT()
  const config = { count: { label: t.analytics.postsCount, color: "var(--primary)" } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="h-[200px] w-full">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={(value: string) => {
          const [year, month] = value.split("-")
          return `${year!.slice(2)}/${month}`
        }} tickLine={false} axisLine={false} tickMargin={8} minTickGap={30} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={4} width={24} />
        <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} labelFormatter={(value) => value} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ChartContainer>
  )
}
