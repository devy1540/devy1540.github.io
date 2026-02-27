import { Link } from "react-router-dom"
import { ChevronDown, ListOrderedIcon } from "lucide-react"
import { getSeriesPosts } from "@/lib/posts"
import { analytics } from "@/lib/analytics"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import type { PostMeta } from "@/types/post"

interface SeriesNavigatorProps {
  series: string
  currentSlug: string
}

export function SeriesNavigator({ series, currentSlug }: SeriesNavigatorProps) {
  const posts = getSeriesPosts(series)
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug)

  if (posts.length < 2) return null

  return (
    <Collapsible defaultOpen className="group/series rounded-lg border bg-card p-4 mb-8">
      <CollapsibleTrigger className="flex items-center gap-2 w-full cursor-pointer">
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform duration-300 -rotate-90 group-data-[state=open]/series:rotate-0"
        />
        <ListOrderedIcon className="size-4 text-primary" />
        <span className="text-sm font-medium">{series}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {currentIndex + 1} / {posts.length}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
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
                  onClick={() => analytics.clickSeriesNav(series, post.slug)}
                  className="flex items-center gap-2 text-sm py-1 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <span className="text-xs">{i + 1}.</span>
                  {post.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  )
}
