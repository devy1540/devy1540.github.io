import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ListOrderedIcon } from "lucide-react"
import { getSeriesPosts } from "@/lib/posts"
import type { PostMeta } from "@/types/post"

interface SeriesNavigatorProps {
  series: string
  currentSlug: string
}

export function SeriesNavigator({ series, currentSlug }: SeriesNavigatorProps) {
  const posts = getSeriesPosts(series)
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug)
  const [open, setOpen] = useState(true)

  if (posts.length < 2) return null

  return (
    <div className="rounded-lg border bg-card p-4 mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full"
      >
        <ChevronRight
          className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
        <ListOrderedIcon className="size-4 text-primary" />
        <span className="text-sm font-medium">{series}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {currentIndex + 1} / {posts.length}
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <ol className="space-y-1 mt-3">
            {posts.map((post: PostMeta, i: number) => (
              <li key={post.slug}>
                {post.slug === currentSlug ? (
                  <span className="flex items-center gap-2 text-sm py-1 px-2 rounded-md bg-accent text-accent-foreground font-medium">
                    <span className="text-xs text-primary">{i + 1}.</span>
                    {post.title}
                  </span>
                ) : (
                  <Link
                    to={`/posts/${post.slug}`}
                    viewTransition
                    className="flex items-center gap-2 text-sm py-1 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-xs">{i + 1}.</span>
                    {post.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
