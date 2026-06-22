import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useMetaTags } from "@/hooks/useMetaTags"
import { LayoutListIcon, LayoutGridIcon, SearchIcon, XIcon } from "lucide-react"
import { getAllPosts, searchPosts } from "@/lib/posts"
import { PostList } from "@/components/PostList"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePageViews } from "@/hooks/usePageViews"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"
import type { PostMeta } from "@/types/post"

type SortMode = "latest" | "popular" | "oldest"
type SearchScope = "all" | "summary" | "tags"

const sortModes = new Set<SortMode>(["latest", "popular", "oldest"])
const searchScopes = new Set<SearchScope>(["all", "summary", "tags"])

function toSortMode(value: string | null): SortMode {
  return sortModes.has(value as SortMode) ? (value as SortMode) : "latest"
}

function toSearchScope(value: string | null): SearchScope {
  return searchScopes.has(value as SearchScope) ? (value as SearchScope) : "all"
}

function postMatchesSummary(post: PostMeta, query: string) {
  const q = query.toLowerCase()
  return (
    post.title.toLowerCase().includes(q) ||
    post.description.toLowerCase().includes(q) ||
    post.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

function postMatchesTags(post: PostMeta, query: string) {
  const q = query.toLowerCase()
  return post.tags.some((tag) => tag.toLowerCase().includes(q))
}

export function PostsPage() {
  const { language, t } = useLanguage()
  useMetaTags({ title: t.common.posts, description: t.posts.description, url: localizePath("/posts", language) })
  const [searchParams, setSearchParams] = useSearchParams()
  const { getPostViews } = usePageViews()
  const allPosts = useMemo(() => getAllPosts(language), [language])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const query = searchParams.get("q") ?? ""
  const selectedTag = searchParams.get("tag") ?? ""
  const selectedYear = searchParams.get("year") ?? ""
  const sortMode = toSortMode(searchParams.get("sort"))
  const searchScope = toSearchScope(searchParams.get("scope"))

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

  const availableYears = useMemo(() => (
    Array.from(new Set(allPosts.map((post) => post.date.slice(0, 4)))).sort((a, b) => (a > b ? -1 : 1))
  ), [allPosts])

  const featuredTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    for (const post of allPosts) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    const tags = [...tagCounts.entries()]
      .sort(([a, aCount], [b, bCount]) => bCount - aCount || a.localeCompare(b))
      .slice(0, 7)
      .map(([tag]) => tag)

    if (selectedTag && !tags.includes(selectedTag)) return [selectedTag, ...tags]
    return tags
  }, [allPosts, selectedTag])

  const filteredPosts = useMemo(() => {
    const trimmedQuery = query.trim()
    let result = trimmedQuery
      ? searchScope === "all"
        ? searchPosts(trimmedQuery, language)
        : allPosts.filter((post) => (
          searchScope === "summary"
            ? postMatchesSummary(post, trimmedQuery)
            : postMatchesTags(post, trimmedQuery)
        ))
      : allPosts

    if (selectedTag) {
      result = result.filter((post) => post.tags.includes(selectedTag))
    }
    if (selectedYear) {
      result = result.filter((post) => post.date.startsWith(selectedYear))
    }

    return [...result].sort((a, b) => {
      if (sortMode === "oldest") return a.date > b.date ? 1 : -1
      if (sortMode === "popular") {
        const aViews = getPostViews(a.slug, a.language) ?? -1
        const bViews = getPostViews(b.slug, b.language) ?? -1
        if (aViews !== bViews) return bViews - aViews
      }
      return a.date > b.date ? -1 : 1
    })
  }, [allPosts, getPostViews, language, query, searchScope, selectedTag, selectedYear, sortMode])

  const groupedByYear = useMemo(() => {
    const groups = new Map<string, PostMeta[]>()
    for (const post of filteredPosts) {
      const year = post.date.slice(0, 4)
      const list = groups.get(year)
      if (list) {
        list.push(post)
      } else {
        groups.set(year, [post])
      }
    }
    return groups
  }, [filteredPosts])

  const hasFilters = Boolean(query.trim() || selectedTag || selectedYear || sortMode !== "latest" || searchScope !== "all")

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{t.common.posts}</h1>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => { if (v) setViewMode(v as "list" | "grid") }}
          size="sm"
        >
          <ToggleGroupItem value="list" aria-label={t.posts.listView}>
            <LayoutListIcon className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label={t.posts.gridView}>
            <LayoutGridIcon className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="mb-8 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder={t.posts.searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Select
              value={sortMode}
              onValueChange={(value) => updateParam("sort", value, "latest")}
            >
              <SelectTrigger aria-label={t.posts.sortLabel} className="w-[6.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{t.posts.sortLatest}</SelectItem>
                <SelectItem value="popular">{t.posts.sortPopular}</SelectItem>
                <SelectItem value="oldest">{t.posts.sortOldest}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedYear || "all"}
              onValueChange={(value) => updateParam("year", value === "all" ? "" : value)}
            >
              <SelectTrigger aria-label={t.posts.yearLabel} className="w-[7.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.posts.allYears}</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchScope}
              onValueChange={(value) => updateParam("scope", value, "all")}
            >
              <SelectTrigger aria-label={t.posts.scopeLabel} className="w-[12.5rem] max-w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.posts.scopeAll}</SelectItem>
                <SelectItem value="summary">{t.posts.scopeSummary}</SelectItem>
                <SelectItem value="tags">{t.posts.scopeTags}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
              <XIcon className="size-3" />
              {t.posts.reset}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant={selectedTag ? "outline" : "default"}
            size="xs"
            className="rounded-full"
            onClick={() => updateParam("tag", "")}
          >
            {t.posts.allTags}
          </Button>
          {featuredTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={selectedTag === tag ? "default" : "outline"}
              size="xs"
              className="rounded-full"
              onClick={() => updateParam("tag", selectedTag === tag ? "" : tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {hasFilters ? t.posts.filteredCount(filteredPosts.length) : t.posts.totalCount(allPosts.length)}
        </p>
      </div>

      {filteredPosts.length === 0 ? (
        <PostList posts={filteredPosts} emptyMessage={t.posts.noResults} />
      ) : (
        [...groupedByYear.entries()].map(([year, yearPosts]) => (
          <div key={year} className="mb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {year}
            </h2>
            <PostList posts={yearPosts} viewMode={viewMode} />
          </div>
        ))
      )}
    </PageContainer>
  )
}
