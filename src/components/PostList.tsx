import { Link } from "react-router-dom"
import { Eye } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageViews } from "@/hooks/usePageViews"
import { useT } from "@/i18n"
import type { PostMeta } from "@/types/post"

interface PostListProps {
  posts: PostMeta[]
  viewMode?: "list" | "grid"
  emptyMessage?: string
}

export function PostList({
  posts,
  viewMode = "list",
  emptyMessage,
}: PostListProps) {
  const { getPostViews } = usePageViews()
  const t = useT()

  if (posts.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage ?? t.components.noPostsYet}</p>
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link key={post.slug} to={`/posts/${post.slug}`} viewTransition className="group">
            <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <time dateTime={post.date}>{post.date}</time>
                  {getPostViews(post.slug) !== null && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {getPostViews(post.slug)!.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                {post.description && (
                  <CardDescription className="line-clamp-2">
                    {post.description}
                  </CardDescription>
                )}
              </CardHeader>
              {post.tags.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, i) => (
        <div key={post.slug}>
          {i > 0 && <Separator />}
          <Link
            to={`/posts/${post.slug}`}
            viewTransition
            className="block rounded-md px-3 py-4 -mx-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {(getPostViews(post.slug) ?? 0).toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg font-medium">{post.title}</h3>
            {post.description && (
              <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                {post.description}
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  )
}
