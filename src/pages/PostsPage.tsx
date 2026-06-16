import { useState, useMemo } from "react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { LayoutListIcon, LayoutGridIcon } from "lucide-react"
import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/PostList"
import { PageContainer } from "@/components/PageContainer"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"
import type { PostMeta } from "@/types/post"

export function PostsPage() {
  const { language, t } = useLanguage()
  useMetaTags({ title: t.common.posts, description: t.posts.description, url: localizePath("/posts", language) })
  const posts = getAllPosts(language)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const groupedByYear = useMemo(() => {
    const groups = new Map<string, PostMeta[]>()
    for (const post of posts) {
      const year = post.date.slice(0, 4)
      const list = groups.get(year)
      if (list) {
        list.push(post)
      } else {
        groups.set(year, [post])
      }
    }
    return groups
  }, [posts])

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

      {[...groupedByYear.entries()].map(([year, yearPosts]) => (
        <div key={year} className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {year}
          </h2>
          <PostList posts={yearPosts} viewMode={viewMode} />
        </div>
      ))}
    </PageContainer>
  )
}
