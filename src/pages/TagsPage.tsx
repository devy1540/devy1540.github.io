import { useCollectionFilters } from "@/hooks/useCollectionFilters"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, XIcon } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { getAllPosts } from "@/lib/posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PageContainer } from "@/components/PageContainer"
import { useLanguage } from "@/i18n"
import { filteredViewMeta, localizePath, postPath } from "@/lib/i18n-routing"
import { collectionFilterPath } from "@/lib/collection-filters"
import type { PostMeta } from "@/types/post"

type TagSort = "popular" | "recent" | "name"

interface TagStats {
  tag: string
  count: number
  latestDate: string
  posts: PostMeta[]
}

interface TagGroup {
  id: string
  label: string
  tags: string[]
}

const tagSorts = new Set<TagSort>(["popular", "recent", "name"])

const TAG_GROUPS: TagGroup[] = [
  {
    id: "backend",
    label: "Backend",
    tags: ["java", "spring-boot", "spring", "authentication", "oauth", "jwt", "architecture", "payment"],
  },
  {
    id: "infra",
    label: "Infra / DevOps",
    tags: ["devops", "kubernetes", "migration", "aws", "gcp", "observability", "argocd", "gitops"],
  },
  {
    id: "frontend",
    label: "Frontend",
    tags: ["react", "typescript", "shadcn-ui", "css", "tailwind", "seo", "ux"],
  },
  {
    id: "ai-blog",
    label: "AI / Blog",
    tags: ["ai", "spring-ai", "llm", "prompt-engineering", "blog", "google-analytics", "view-transitions"],
  },
]

function toTagSort(value: string | null): TagSort {
  return tagSorts.has(value as TagSort) ? (value as TagSort) : "popular"
}

function buildTagStats(posts: PostMeta[]): TagStats[] {
  const tagMap = new Map<string, TagStats>()

  for (const post of posts) {
    for (const tag of post.tags) {
      const current = tagMap.get(tag)
      if (current) {
        current.count += 1
        current.latestDate = post.date > current.latestDate ? post.date : current.latestDate
        current.posts.push(post)
      } else {
        tagMap.set(tag, {
          tag,
          count: 1,
          latestDate: post.date,
          posts: [post],
        })
      }
    }
  }

  return [...tagMap.values()].map((stats) => ({
    ...stats,
    posts: [...stats.posts].sort((a, b) => (a.date > b.date ? -1 : 1)),
  }))
}

function sortTagStats(tags: TagStats[], sortMode: TagSort) {
  return [...tags].sort((a, b) => {
    if (sortMode === "name") return a.tag.localeCompare(b.tag)
    if (sortMode === "recent") {
      if (a.latestDate !== b.latestDate) return b.latestDate.localeCompare(a.latestDate)
      if (a.count !== b.count) return b.count - a.count
      return a.tag.localeCompare(b.tag)
    }

    if (a.count !== b.count) return b.count - a.count
    if (a.latestDate !== b.latestDate) return b.latestDate.localeCompare(a.latestDate)
    return a.tag.localeCompare(b.tag)
  })
}

function matchesQuery(stats: TagStats, query: string) {
  return stats.tag.toLowerCase().includes(query.toLowerCase())
}

export function TagsPage() {
  const { language, t } = useLanguage()

  const posts = useMemo(() => getAllPosts(language), [language])
  const [searchParams, setSearchParams, legacyQuery] = useCollectionFilters()
  const selectedTag = searchParams.get("tag") ?? ""
  const query = searchParams.get("q") ?? ""
  const sortMode = toTagSort(searchParams.get("sort"))

  useMetaTags({
    title: t.common.tags,
    description: t.tags.description,
    url: localizePath("/tags", language),
    ...filteredViewMeta("/tags", legacyQuery, language),
  })

  const tagStats = useMemo(() => buildTagStats(posts), [posts])
  const statsByTag = useMemo(() => new Map(tagStats.map((stats) => [stats.tag, stats])), [tagStats])
  const selectedStats = selectedTag ? statsByTag.get(selectedTag) : undefined

  const matchingTags = useMemo(() => {
    const trimmedQuery = query.trim()
    const filtered = trimmedQuery ? tagStats.filter((stats) => matchesQuery(stats, trimmedQuery)) : tagStats
    return sortTagStats(filtered, sortMode)
  }, [query, sortMode, tagStats])

  const visibleTopTags = query.trim() ? matchingTags : matchingTags.slice(0, 12)
  const activeStats = selectedStats ?? matchingTags[0] ?? null

  const groupedTags = useMemo(() => {
    const groupedTagNames = new Set(TAG_GROUPS.flatMap((group) => group.tags))
    const queryValue = query.trim()

    const groups = TAG_GROUPS.map((group) => ({
      ...group,
      tags: sortTagStats(
        group.tags
          .map((tag) => statsByTag.get(tag))
          .filter((stats): stats is TagStats => Boolean(stats))
          .filter((stats) => !queryValue || matchesQuery(stats, queryValue)),
        sortMode
      ),
    })).filter((group) => group.tags.length > 0)

    const ungrouped = sortTagStats(
      tagStats
        .filter((stats) => !groupedTagNames.has(stats.tag))
        .filter((stats) => !queryValue || matchesQuery(stats, queryValue)),
      sortMode
    )

    if (ungrouped.length > 0) {
      groups.push({
        id: "etc",
        label: t.tags.ungrouped,
        tags: queryValue ? ungrouped : ungrouped.slice(0, 10),
      })
    }

    return groups
  }, [query, sortMode, statsByTag, t.tags.ungrouped, tagStats])

  const relatedTags = useMemo(() => {
    if (!activeStats) return []

    const related = new Map<string, number>()
    for (const post of activeStats.posts) {
      for (const tag of post.tags) {
        if (tag === activeStats.tag) continue
        related.set(tag, (related.get(tag) ?? 0) + 1)
      }
    }

    return [...related.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 6)
  }, [activeStats])

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

  function tagsPathFor(tag: string) {
    const next = new URLSearchParams(searchParams)
    next.set("tag", tag)
    return collectionFilterPath("/tags", next, language)
  }

  const hasFilters = Boolean(query.trim() || selectedTag || sortMode !== "popular")

  return (
    <PageContainer variant="wide" className="@container/taxonomy">
      <div className="mb-8 flex flex-col flex-wrap gap-4 @min-[32rem]/taxonomy:flex-row @min-[32rem]/taxonomy:items-end @min-[32rem]/taxonomy:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t.common.tags}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.tags.summary(posts.length, tagStats.length)}
          </p>
        </div>

        {selectedStats && (
          <Badge variant="outline" className="max-w-full whitespace-normal break-words rounded-full px-3 py-1 text-sm">
            {t.tags.selectedLabel(selectedStats.tag)}
          </Badge>
        )}
      </div>

      <div className="mb-8 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => updateParam("q", event.target.value)}
            aria-label={t.tags.searchPlaceholder}
            placeholder={t.tags.searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 @min-[32rem]/taxonomy:flex-row @min-[32rem]/taxonomy:items-center @min-[32rem]/taxonomy:justify-between">
          <ToggleGroup
            type="single"
            value={sortMode}
            onValueChange={(value) => { if (value) updateParam("sort", value, "popular") }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="popular">{t.tags.sortPopular}</ToggleGroupItem>
            <ToggleGroupItem value="recent">{t.tags.sortRecent}</ToggleGroupItem>
            <ToggleGroupItem value="name">{t.tags.sortName}</ToggleGroupItem>
          </ToggleGroup>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit self-start @min-[32rem]/taxonomy:self-auto"
              onClick={resetFilters}
            >
              <XIcon className="size-3" />
              {t.tags.reset}
            </Button>
          )}
        </div>
      </div>

      {tagStats.length === 0 ? (
        <p className="text-muted-foreground">{t.tags.noTags}</p>
      ) : (
        <div className="grid gap-10 @min-[56rem]/taxonomy:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="@container/taxonomy-list min-w-0 space-y-9">
            <section>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t.tags.topTags}
                </h2>
                <span className="hidden text-xs text-muted-foreground @min-[32rem]/taxonomy-list:inline">{t.tags.topTagsNote}</span>
              </div>

              {visibleTopTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.tags.noMatchingTags}</p>
              ) : (
                <div className="border-t">
                  {visibleTopTags.map((stats) => (
                    <Link
                      key={stats.tag}
                      to={tagsPathFor(stats.tag)}
                      className="grid min-h-14 grid-cols-1 gap-1 border-b py-3 transition-colors hover:bg-accent/40 @min-[28rem]/taxonomy-list:grid-cols-[minmax(0,1fr)_5rem_7rem] @min-[28rem]/taxonomy-list:items-center @min-[28rem]/taxonomy-list:gap-4"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-medium">
                        <span
                          className={
                            selectedTag === stats.tag
                              ? "size-2 shrink-0 rounded-full bg-foreground"
                              : "size-2 shrink-0 rounded-full bg-muted-foreground/25"
                          }
                        />
                        <span className="truncate">{stats.tag}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">{t.tags.postCount(stats.count)}</span>
                      <time dateTime={stats.latestDate} className="text-sm text-muted-foreground">
                        {stats.latestDate}
                      </time>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t.tags.topicGroups}
              </h2>

              {groupedTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.tags.noMatchingTags}</p>
              ) : (
                <div className="grid gap-x-8 gap-y-7 @min-[28rem]/taxonomy-list:grid-cols-2">
                  {groupedTags.map((group) => (
                    <div key={group.id} className="min-w-0">
                      <h3 className="mb-3 text-base font-semibold">{group.label}</h3>
                      <div className="border-t">
                        {group.tags.map((stats) => (
                          <Link
                            key={stats.tag}
                            to={tagsPathFor(stats.tag)}
                            className="flex h-8 items-center justify-between gap-3 border-b text-sm transition-colors hover:bg-accent/40"
                          >
                            <span className="truncate">{stats.tag}</span>
                            <span className="shrink-0 text-muted-foreground">{t.tags.postCount(stats.count)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {activeStats && (
            <aside className="min-w-0 border-t pt-8 @min-[56rem]/taxonomy:sticky @min-[56rem]/taxonomy:top-20 @min-[56rem]/taxonomy:border-l @min-[56rem]/taxonomy:border-t-0 @min-[56rem]/taxonomy:pl-7 @min-[56rem]/taxonomy:pt-0">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="break-all text-3xl font-bold tracking-tight">{activeStats.tag}</h2>
                <Badge className="shrink-0 rounded-full">{t.tags.postCount(activeStats.count)}</Badge>
              </div>

              <p className="mb-6 text-sm leading-6 text-muted-foreground">
                {t.tags.selectedDescription(activeStats.tag)}
              </p>

              {relatedTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t.tags.relatedTags}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {relatedTags.map(({ tag }) => (
                      <Link key={tag} to={tagsPathFor(tag)}>
                        <Badge variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t.tags.recentPosts}
                </h3>
                <div className="border-t">
                  {activeStats.posts.slice(0, 3).map((post) => (
                    <Link
                      key={`${post.language}:${post.slug}`}
                      to={postPath(post.slug, post.language)}
                      className="block border-b py-4 transition-colors hover:bg-accent/40"
                    >
                      <time dateTime={post.date} className="text-xs text-muted-foreground">
                        {post.date}
                      </time>
                      <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{post.title}</h4>
                      {post.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {post.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <Button asChild variant="outline" className="mt-5 h-auto min-h-9 w-full whitespace-normal">
                <Link to={collectionFilterPath("/posts", new URLSearchParams({ tag: activeStats.tag }), language)}>
                  {t.tags.viewInPosts(activeStats.tag)}
                </Link>
              </Button>
            </aside>
          )}
        </div>
      )}
    </PageContainer>
  )
}
