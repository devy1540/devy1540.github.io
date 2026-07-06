import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { SearchIcon, XIcon } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { getAllPosts, getAllSeries, type SeriesInfo } from "@/lib/posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PageContainer } from "@/components/PageContainer"
import { useLanguage } from "@/i18n"
import { filteredViewMeta, localizePath, postPath } from "@/lib/i18n-routing"

type SeriesSort = "recent" | "count" | "name"

interface SeriesGroup {
  id: string
  label: string
  tags: string[]
}

const seriesSorts = new Set<SeriesSort>(["recent", "count", "name"])

const SERIES_GROUPS: SeriesGroup[] = [
  {
    id: "backend-auth",
    label: "Backend / Auth",
    tags: ["authentication", "oauth", "jwt", "payment", "java"],
  },
  {
    id: "infra",
    label: "Infra / DevOps",
    tags: ["devops", "kubernetes", "migration", "aws", "gcp", "observability", "argocd", "gitops"],
  },
  {
    id: "frontend-ai",
    label: "Frontend / AI",
    tags: ["react", "typescript", "blog", "seo", "ux", "ai", "spring-ai", "llm"],
  },
]

function toSeriesSort(value: string | null): SeriesSort {
  return seriesSorts.has(value as SeriesSort) ? (value as SeriesSort) : "recent"
}

function sortSeries(series: SeriesInfo[], sortMode: SeriesSort) {
  return [...series].sort((a, b) => {
    if (sortMode === "name") return a.name.localeCompare(b.name)
    if (sortMode === "count") {
      if (a.postCount !== b.postCount) return b.postCount - a.postCount
      if (a.latestDate !== b.latestDate) return b.latestDate.localeCompare(a.latestDate)
      return a.name.localeCompare(b.name)
    }

    if (a.latestDate !== b.latestDate) return b.latestDate.localeCompare(a.latestDate)
    if (a.postCount !== b.postCount) return b.postCount - a.postCount
    return a.name.localeCompare(b.name)
  })
}

function matchesQuery(series: SeriesInfo, query: string) {
  const q = query.toLowerCase()
  return (
    series.name.toLowerCase().includes(q) ||
    series.description.toLowerCase().includes(q) ||
    series.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    series.posts.some((post) => (
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q)
    ))
  )
}

function getGroupScore(series: SeriesInfo, group: SeriesGroup) {
  const groupTags = new Set(group.tags)
  return series.tags.reduce((score, tag) => score + (groupTags.has(tag) ? 1 : 0), 0)
}

export function SeriesPage() {
  const { language, t } = useLanguage()

  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSeriesName = searchParams.get("name") ?? ""
  const query = searchParams.get("q") ?? ""
  const sortMode = toSeriesSort(searchParams.get("sort"))

  useMetaTags({
    title: t.common.series,
    description: t.series.description,
    url: localizePath("/series", language),
    ...filteredViewMeta("/series", searchParams.toString(), language),
  })

  const posts = useMemo(() => getAllPosts(language), [language])
  const allSeries = useMemo(() => getAllSeries(language), [language])
  const seriesByName = useMemo(() => new Map(allSeries.map((series) => [series.name, series])), [allSeries])
  const selectedSeries = selectedSeriesName ? seriesByName.get(selectedSeriesName) : undefined

  const matchingSeries = useMemo(() => {
    const trimmedQuery = query.trim()
    const filtered = trimmedQuery ? allSeries.filter((series) => matchesQuery(series, trimmedQuery)) : allSeries
    return sortSeries(filtered, sortMode)
  }, [allSeries, query, sortMode])

  const activeSeries = selectedSeries ?? matchingSeries[0] ?? null

  const groupedSeries = useMemo(() => {
    const queryValue = query.trim()
    const groups = SERIES_GROUPS.map((group) => ({ ...group, series: [] as SeriesInfo[] }))
    const ungrouped: SeriesInfo[] = []

    for (const series of matchingSeries) {
      const [bestGroup] = groups
        .map((group, index) => ({ group, index, score: getGroupScore(series, group) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)

      if (bestGroup && bestGroup.score > 0) {
        bestGroup.group.series.push(series)
      } else {
        ungrouped.push(series)
      }
    }

    const visibleGroups = groups.filter((group) => group.series.length > 0)
    if (ungrouped.length > 0) {
      visibleGroups.push({
        id: "etc",
        label: t.series.ungrouped,
        tags: [],
        series: queryValue ? ungrouped : ungrouped.slice(0, 8),
      })
    }

    return visibleGroups
  }, [matchingSeries, query, t.series.ungrouped])

  function updateParam(key: string, value: string, defaultValue = "") {
    const next = new URLSearchParams(searchParams)
    if (!value || value === defaultValue) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  function resetFilters() {
    setSearchParams({}, { replace: true })
  }

  function seriesPathFor(seriesName: string) {
    const next = new URLSearchParams(searchParams)
    next.set("name", seriesName)
    const suffix = next.toString()
    return localizePath(`/series${suffix ? `?${suffix}` : ""}`, language)
  }

  const hasFilters = Boolean(query.trim() || selectedSeriesName || sortMode !== "recent")

  return (
    <PageContainer variant="wide">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t.common.series}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.series.summary(posts.length, allSeries.length)}
          </p>
        </div>

        {activeSeries && (
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-sm">
            {t.series.selectedLabel(activeSeries.name)}
          </Badge>
        )}
      </div>

      <div className="mb-8 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder={t.series.searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToggleGroup
            type="single"
            value={sortMode}
            onValueChange={(value) => { if (value) updateParam("sort", value, "recent") }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="recent">{t.series.sortRecent}</ToggleGroupItem>
            <ToggleGroupItem value="count">{t.series.sortCount}</ToggleGroupItem>
            <ToggleGroupItem value="name">{t.series.sortName}</ToggleGroupItem>
          </ToggleGroup>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit self-start sm:self-auto"
              onClick={resetFilters}
            >
              <XIcon className="size-3" />
              {t.series.reset}
            </Button>
          )}
        </div>
      </div>

      {allSeries.length === 0 ? (
        <p className="text-muted-foreground">{t.series.noSeries}</p>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-9">
            <section>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t.series.topSeries}
                </h2>
                <span className="hidden text-xs text-muted-foreground sm:inline">{t.series.topSeriesNote}</span>
              </div>

              {matchingSeries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.series.noMatchingSeries}</p>
              ) : (
                <div className="border-t">
                  {matchingSeries.map((series) => (
                    <Link
                      key={series.name}
                      to={seriesPathFor(series.name)}
                      viewTransition
                      className="grid min-h-20 grid-cols-1 gap-1 border-b py-4 transition-colors hover:bg-accent/40 sm:grid-cols-[minmax(0,1fr)_5rem_7rem] sm:items-center sm:gap-4 sm:px-0"
                    >
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-2 font-medium">
                          <span
                            className={
                              activeSeries?.name === series.name
                                ? "size-2 shrink-0 rounded-full bg-foreground"
                                : "size-2 shrink-0 rounded-full bg-muted-foreground/25"
                            }
                          />
                          <span className="truncate">{series.name}</span>
                        </span>
                        <span className="mt-1 block line-clamp-2 break-all pl-4 text-sm leading-6 text-muted-foreground">
                          {series.description || t.series.fallbackDescription(series.name)}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">{t.series.postCountShort(series.postCount)}</span>
                      <time dateTime={series.latestDate} className="text-sm text-muted-foreground">
                        {series.latestDate}
                      </time>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t.series.topicGroups}
              </h2>

              {groupedSeries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.series.noMatchingSeries}</p>
              ) : (
                <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  {groupedSeries.map((group) => (
                    <div key={group.id} className="min-w-0">
                      <h3 className="mb-3 text-base font-semibold">{group.label}</h3>
                      <div className="border-t">
                        {group.series.map((series) => (
                          <Link
                            key={series.name}
                            to={seriesPathFor(series.name)}
                            viewTransition
                            className="flex h-8 items-center justify-between gap-3 border-b text-sm transition-colors hover:bg-accent/40"
                          >
                            <span className="truncate">{series.name}</span>
                            <span className="shrink-0 text-muted-foreground">{t.series.postCountShort(series.postCount)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {activeSeries && (
            <aside className="border-t pt-8 lg:sticky lg:top-20 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="break-keep text-3xl font-bold tracking-tight">{activeSeries.name}</h2>
                <Badge className="shrink-0 rounded-full">{t.series.postCountShort(activeSeries.postCount)}</Badge>
              </div>

              <p className="mb-6 break-all text-sm leading-6 text-muted-foreground">
                {activeSeries.description || t.series.fallbackDescription(activeSeries.name)}
              </p>

              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t.series.readingPath}
                </h3>
                <div className="border-t">
                  {activeSeries.posts.map((post, index) => (
                    <Link
                      key={`${post.language}:${post.slug}`}
                      to={postPath(post.slug, post.language)}
                      viewTransition
                      className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5 border-b py-4 transition-colors hover:bg-accent/40"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block line-clamp-2 text-sm font-semibold leading-5">{post.title}</span>
                        {post.description && (
                          <span className="mt-1 block line-clamp-2 break-all text-xs leading-5 text-muted-foreground">
                            {post.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {activeSeries.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t.series.relatedTags}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSeries.tags.slice(0, 8).map((tag) => (
                      <Link key={tag} to={localizePath(`/posts?tag=${encodeURIComponent(tag)}`, language)} viewTransition>
                        <Badge variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {activeSeries.posts[0] && (
                <Button asChild variant="outline" className="w-full">
                  <Link to={postPath(activeSeries.posts[0].slug, activeSeries.posts[0].language)} viewTransition>
                    {t.series.startReading}
                  </Link>
                </Button>
              )}
            </aside>
          )}
        </div>
      )}
    </PageContainer>
  )
}
