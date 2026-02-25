import { Link } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import type { PostMeta } from "@/types/post"

interface PostListProps {
  posts: PostMeta[]
  emptyMessage?: string
}

export function PostList({
  posts,
  emptyMessage = "아직 작성된 글이 없습니다.",
}: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, i) => (
        <div key={post.slug}>
          {i > 0 && <Separator />}
          <Link
            to={`/posts/${post.slug}`}
            className="block rounded-md px-3 py-4 -mx-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <time dateTime={post.date}>{post.date}</time>
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
