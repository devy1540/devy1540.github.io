import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Eye, FileText, Library, Tags, Hash } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DailyVisitsChart } from "@/components/DailyVisitsChart"
import { usePageViews } from "@/hooks/usePageViews"
import { useMetaTags } from "@/hooks/useMetaTags"
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts"
import { useT } from "@/i18n"

const monthlyChartConfig = {
  count: {
    label: "Posts",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function AnalyticsPage() {
  const t = useT()
  useMetaTags({ title: "Analytics", description: t.analytics.description, url: "/analytics" })

  const { totalViews, allPageViews } = usePageViews()
  const posts = getAllPosts()
  const series = getAllSeries()
  const tags = getAllTags()

  const popularPosts = useMemo(() => {
    if (!allPageViews) return []
    return Object.entries(allPageViews)
      .filter(([path]) => path.startsWith("/posts/"))
      .map(([path, views]) => {
        const slug = path.replace("/posts/", "").replace(/\/$/, "")
        const post = posts.find((p) => p.slug === slug)
        return { slug, title: post?.title ?? slug, views }
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }, [allPageViews, posts])

  const tagDistribution = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) {
        map.set(tag, (map.get(tag) ?? 0) + 1)
      }
    }
    return [...map.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [posts])

  const monthlyPosts = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of posts) {
      const month = post.date.slice(0, 7) // YYYY-MM
      map.set(month, (map.get(month) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [posts])

  const summaryCards = [
    { label: t.analytics.totalViews, value: totalViews?.toLocaleString() ?? "-", icon: Eye },
    { label: t.analytics.totalPosts, value: posts.length, icon: FileText },
    { label: t.analytics.totalSeries, value: series.length, icon: Library },
    { label: t.analytics.totalTags, value: tags.length, icon: Tags },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t.common.analytics}</h1>
        <p className="text-muted-foreground">{t.analytics.description}</p>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.label} className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <card.icon className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Daily Visits Chart */}
      <section className="mb-8">
        <DailyVisitsChart />
      </section>

      {/* Popular Posts Top 10 */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t.analytics.popularPosts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.analytics.noData}</p>
            ) : (
              <div className="space-y-2">
                {popularPosts.map((post, i) => (
                  <Link
                    key={post.slug}
                    to={`/posts/${post.slug}`}
                    viewTransition
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <span className="text-xs font-medium text-muted-foreground w-5 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-sm flex-1 truncate">{post.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
                      <Eye className="size-3" />
                      {post.views.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tag Distribution */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t.analytics.tagDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tagDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.analytics.noData}</p>
            ) : (
              <div className="space-y-1.5">
                {tagDistribution.map((item) => (
                  <Link
                    key={item.tag}
                    to={`/tags?tag=${encodeURIComponent(item.tag)}`}
                    viewTransition
                    className="flex items-center gap-2 group"
                  >
                    <Hash className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-sm w-28 truncate group-hover:text-primary transition-colors">
                      {item.tag}
                    </span>
                    <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-primary/20 group-hover:bg-primary/30 transition-colors rounded-sm"
                        style={{
                          width: `${(item.count / (tagDistribution[0]?.count ?? 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">
                      {item.count}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Monthly Posts */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t.analytics.monthlyPosts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.analytics.noData}</p>
            ) : (
              <ChartContainer config={monthlyChartConfig} className="h-[200px] w-full">
                <BarChart data={monthlyPosts} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(v) => {
                      const [y, m] = v.split("-")
                      return `${y.slice(2)}/${m}`
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={30}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    width={24}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel={false} />}
                    labelFormatter={(v) => v}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
