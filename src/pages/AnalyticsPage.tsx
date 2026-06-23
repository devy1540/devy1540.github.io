import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Activity, AlertCircle, CalendarDays, Eye, FileText, Gauge, Library, PenLine, RefreshCw, Tags, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DailyVisitsChart } from "@/components/DailyVisitsChart"
import { PageContainer } from "@/components/PageContainer"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePageViews } from "@/hooks/usePageViews"
import { useMetaTags } from "@/hooks/useMetaTags"
import { averageViews, buildDailySeries, getPeakDay, getPercentChange, getPreviousComparableRange, sumViews } from "@/lib/analytics-data"
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts"
import { useLanguage } from "@/i18n"
import { localizePath, postPath } from "@/lib/i18n-routing"

const TAG_COLORS = [
  "oklch(0.65 0.2 250)",   // blue
  "oklch(0.65 0.2 150)",   // green
  "oklch(0.65 0.2 20)",    // rose
  "oklch(0.7 0.2 50)",     // orange
  "oklch(0.6 0.25 290)",   // violet
  "oklch(0.65 0.15 200)",  // teal
  "oklch(0.65 0.2 330)",   // pink
  "oklch(0.7 0.15 90)",    // lime
  "oklch(0.6 0.2 270)",    // indigo
  "oklch(0.7 0.15 60)",    // amber
]

type RangeDays = 7 | 14 | 30

const RANGE_OPTIONS: RangeDays[] = [7, 14, 30]
const DAY_MS = 24 * 60 * 60 * 1000

function getPostViews(allPageViews: Record<string, number> | null, slug: string, language: "ko" | "en") {
  if (!allPageViews) return 0
  const localizedPath = language === "en" ? `/en/posts/${slug}` : `/posts/${slug}`
  return allPageViews[localizedPath] ?? allPageViews[`/posts/${slug}`] ?? 0
}

function getDaysSince(date: string) {
  const publishedAt = new Date(`${date}T00:00:00`).getTime()
  if (Number.isNaN(publishedAt)) return 1
  return Math.max(1, Math.ceil((Date.now() - publishedAt) / DAY_MS))
}

function formatMetric(value: number, fractionDigits = 0) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
  })
}

function formatPercent(value: number | null) {
  if (value === null) return null
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${value.toFixed(1)}%`
}

export function AnalyticsPage() {
  const { language, t } = useLanguage()
  const [rangeDays, setRangeDays] = useState<RangeDays>(14)
  useMetaTags({ title: t.common.analytics, description: t.analytics.description, url: localizePath("/analytics", language) })

  const { totalViews, allPageViews, daily, isError, isLoading, lastUpdated, refresh } = usePageViews()
  const posts = getAllPosts(language)
  const series = getAllSeries(language)
  const tags = getAllTags(language)

  const postPerformance = useMemo(() => {
    return posts.map((post) => {
      const views = getPostViews(allPageViews, post.slug, language)
      const daysLive = getDaysSince(post.publishDate ?? post.date)
      return {
        ...post,
        views,
        daysLive,
        viewsPerDay: views / daysLive,
      }
    })
  }, [allPageViews, language, posts])

  const popularPosts = useMemo(() => {
    return [...postPerformance]
      .filter((post) => post.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }, [postPerformance])

  const fastestPosts = useMemo(() => {
    return [...postPerformance]
      .filter((post) => post.views > 0)
      .sort((a, b) => b.viewsPerDay - a.viewsPerDay || b.views - a.views)
      .slice(0, 5)
  }, [postPerformance])

  const tagPerformance = useMemo(() => {
    const map = new Map<string, { tag: string; count: number; views: number }>()
    for (const post of postPerformance) {
      for (const tag of post.tags) {
        const current = map.get(tag) ?? { tag, count: 0, views: 0 }
        current.count += 1
        current.views += post.views
        map.set(tag, current)
      }
    }
    return [...map.values()]
      .map((item) => ({ ...item, averageViews: item.views / item.count }))
      .sort((a, b) => b.views - a.views || b.averageViews - a.averageViews)
      .slice(0, 8)
  }, [postPerformance])

  const seriesPerformance = useMemo(() => {
    const map = new Map<string, { series: string; count: number; views: number }>()
    for (const post of postPerformance) {
      if (!post.series) continue
      const current = map.get(post.series) ?? { series: post.series, count: 0, views: 0 }
      current.count += 1
      current.views += post.views
      map.set(post.series, current)
    }
    return [...map.values()]
      .map((item) => ({ ...item, averageViews: item.views / item.count }))
      .sort((a, b) => b.views - a.views || b.averageViews - a.averageViews)
      .slice(0, 5)
  }, [postPerformance])

  const selectedDaily = useMemo(() => buildDailySeries(rangeDays, daily), [daily, rangeDays])
  const previousDaily = useMemo(() => getPreviousComparableRange(rangeDays, daily), [daily, rangeDays])
  const rangeViews = useMemo(() => sumViews(selectedDaily), [selectedDaily])
  const previousRangeViews = useMemo(() => sumViews(previousDaily), [previousDaily])
  const percentChange = formatPercent(getPercentChange(rangeViews, previousRangeViews))
  const peakDay = useMemo(() => getPeakDay(selectedDaily), [selectedDaily])
  const dailyAverage = averageViews(selectedDaily)
  const maxTagViews = Math.max(...tagPerformance.map((item) => item.views), 1)

  const tagDistribution = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) {
        map.set(tag, (map.get(tag) ?? 0) + 1)
      }
    }
    const sorted = [...map.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)

    const top = sorted.slice(0, 5)
    const restCount = sorted.slice(5).reduce((s, d) => s + d.count, 0)

    const result = top.map((item, i) => ({
      tag: item.tag,
      count: item.count,
      fill: TAG_COLORS[i]!,
    }))

    if (restCount > 0) {
      result.push({ tag: t.analytics.others, count: restCount, fill: "var(--muted-foreground)" })
    }

    return result
  }, [posts, t])

  const tagChartConfig = useMemo(() => {
    const config: ChartConfig = { count: { label: t.analytics.postsCount } }
    for (const item of tagDistribution) {
      config[item.tag] = { label: item.tag, color: item.fill }
    }
    return config
  }, [tagDistribution, t])

  const monthlyChartConfig = useMemo<ChartConfig>(() => ({
    count: {
      label: t.analytics.postsCount,
      color: "var(--primary)",
    },
  }), [t])

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

  const draftCount = import.meta.env.DEV
    ? posts.filter((p) => p.draft || (p.publishDate && p.publishDate > new Date().toISOString().split("T")[0]!)).length
    : 0

  const summaryCards = [
    { label: t.analytics.totalViews, value: totalViews?.toLocaleString() ?? "-", icon: Eye },
    { label: t.analytics.totalPosts, value: posts.length, icon: FileText },
    { label: t.analytics.totalSeries, value: series.length, icon: Library },
    { label: t.analytics.totalTags, value: tags.length, icon: Tags },
    ...(import.meta.env.DEV && draftCount > 0
      ? [{ label: t.analytics.draftPosts, value: draftCount, icon: PenLine }]
      : []),
  ]

  const momentumCards = [
    {
      label: t.analytics.viewsInRange,
      value: formatMetric(rangeViews),
      detail: `${rangeDays}${language === "ko" ? "일" : "d"}`,
      icon: TrendingUp,
    },
    {
      label: t.analytics.avgDailyViews,
      value: formatMetric(dailyAverage, 1),
      detail: t.analytics.views,
      icon: Activity,
    },
    {
      label: t.analytics.peakDay,
      value: peakDay ? formatMetric(peakDay.views) : "-",
      detail: peakDay?.label ?? t.analytics.noData,
      icon: CalendarDays,
    },
    {
      label: t.analytics.periodChange,
      value: percentChange ?? "-",
      detail: percentChange ? t.analytics.periodChange : t.analytics.compareUnavailable,
      icon: Gauge,
    },
  ]

  return (
    <PageContainer>
      <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t.common.analytics}</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-muted-foreground flex-1">{t.analytics.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={String(rangeDays)}
              onValueChange={(value) => {
                if (value) setRangeDays(Number(value) as RangeDays)
              }}
            >
              {RANGE_OPTIONS.map((days) => (
                <ToggleGroupItem key={days} value={String(days)} aria-label={`${days} days`}>
                  {days === 7 ? t.analytics.range7d : days === 14 ? t.analytics.range14d : t.analytics.range30d}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              {t.analytics.refresh}
            </Button>
          </div>
        </div>
        {isError && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle />
            <AlertDescription>{t.analytics.loadError}</AlertDescription>
          </Alert>
        )}
        {lastUpdated && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t.analytics.lastUpdated}: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-3 mb-8 md:grid-cols-4">
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
        <DailyVisitsChart
          totalViews={totalViews}
          daily={daily}
          isLoading={isLoading}
          rangeDays={rangeDays}
        />
      </section>

      {/* Traffic Momentum */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t.analytics.trafficMomentum}
          </h2>
          <Badge variant="outline">{rangeDays === 7 ? t.analytics.range7d : rangeDays === 14 ? t.analytics.range14d : t.analytics.range30d}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {momentumCards.map((card) => (
            <Card key={card.label} className="py-4">
              <CardContent className="px-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <card.icon className="size-4 text-muted-foreground shrink-0" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground truncate">{card.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Content Insights */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t.analytics.contentInsights}
          </h2>
          <Badge variant="secondary">{t.analytics.allTimeBasis}</Badge>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {t.analytics.fastestPosts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fastestPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.analytics.noData}</p>
              ) : (
                <div className="space-y-2">
                  {fastestPosts.map((post, i) => (
                    <Link
                      key={post.slug}
                      to={postPath(post.slug, language)}
                      viewTransition
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                    >
                      <span className="text-xs font-medium text-muted-foreground w-5 text-right tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{post.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatMetric(post.viewsPerDay, 1)} {t.analytics.viewsPerDay}
                        </span>
                      </span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {t.analytics.tagPerformance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tagPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.analytics.noData}</p>
              ) : (
                <div className="space-y-3">
                  {tagPerformance.map((item) => (
                    <div key={item.tag}>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{item.tag}</span>
                        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                          {formatMetric(item.views)} · {formatMetric(item.averageViews, 1)} {t.analytics.averageViews}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${Math.max(8, (item.views / maxTagViews) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {t.analytics.seriesPerformance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seriesPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.analytics.noSeriesData}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {seriesPerformance.map((item) => (
                    <div key={item.series} className="rounded-md border p-3">
                      <p className="mb-2 line-clamp-2 min-h-10 text-sm font-medium">{item.series}</p>
                      <p className="text-xl font-bold tabular-nums">{formatMetric(item.views)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} {t.analytics.postsCount} · {formatMetric(item.averageViews, 1)} {t.analytics.averageViews}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
                    to={postPath(post.slug, language)}
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
              <ChartContainer config={tagChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="tag" hideLabel />} />
                  <Pie
                    data={tagDistribution}
                    dataKey="count"
                    nameKey="tag"
                    innerRadius={60}
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const total = tagDistribution.reduce((s, d) => s + d.count, 0)
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                {total}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-sm">
                                {t.analytics.postsCount}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
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
    </PageContainer>
  )
}
