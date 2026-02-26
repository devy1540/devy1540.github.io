import { Link, useSearchParams } from "react-router-dom"
import { useMetaTags } from "@/hooks/useMetaTags"
import { getAllPosts } from "@/lib/posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PostList } from "@/components/PostList"

export function TagsPage() {
  useMetaTags({ title: "Tags", description: "태그별 블로그 글 목록", url: "/tags" })
  const posts = getAllPosts()
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Tags</h1>

      {!selectedTag ? (
        <div className="flex flex-wrap gap-3">
          {allTags.map((tag) => (
            <Link key={tag} to={`/tags?tag=${encodeURIComponent(tag)}`} viewTransition>
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 cursor-pointer hover:bg-accent"
              >
                {tag}
              </Badge>
            </Link>
          ))}
          {allTags.length === 0 && (
            <p className="text-muted-foreground">태그가 없습니다.</p>
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
              All tags
            </Button>
          </div>

          <PostList
            posts={filteredPosts}
            emptyMessage="해당 태그의 글이 없습니다."
          />
        </div>
      )}
    </div>
  )
}
