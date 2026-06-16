import { Link, useSearchParams } from "react-router-dom"
import { useMetaTags } from "@/hooks/useMetaTags"
import { getAllPosts } from "@/lib/posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PostList } from "@/components/PostList"
import { PageContainer } from "@/components/PageContainer"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"

export function TagsPage() {
  const { language, t } = useLanguage()
  useMetaTags({ title: t.common.tags, description: t.tags.description, url: localizePath("/tags", language) })
  const posts = getAllPosts(language)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTag = searchParams.get("tag")

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : []

  function clearTag() {
    setSearchParams({})
  }

  return (
    <PageContainer>
      <h1 className="text-4xl font-bold tracking-tight mb-8">{t.common.tags}</h1>

      {!selectedTag ? (
        <div className="flex flex-wrap gap-3">
          {allTags.map((tag) => (
            <Link key={tag} to={localizePath(`/tags?tag=${encodeURIComponent(tag)}`, language)} viewTransition>
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 cursor-pointer hover:bg-accent"
              >
                {tag}
              </Badge>
            </Link>
          ))}
          {allTags.length === 0 && (
            <p className="text-muted-foreground">{t.tags.noTags}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-medium">
              <Badge variant="default" className="text-base px-3 py-1">
                {selectedTag}
              </Badge>
            </span>
            <Button variant="ghost" size="sm" onClick={clearTag}>
              {t.tags.allTags}
            </Button>
          </div>

          <PostList
            posts={filteredPosts}
            emptyMessage={t.tags.noPostsWithTag}
          />
        </div>
      )}
    </PageContainer>
  )
}
