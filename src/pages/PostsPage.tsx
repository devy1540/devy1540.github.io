import { useState } from "react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { LayoutListIcon, LayoutGridIcon } from "lucide-react"
import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"

export function PostsPage() {
  const t = useT()
  useMetaTags({ title: "Posts", description: t.posts.description, url: "/posts" })
  const posts = getAllPosts()
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  return (
    <div className={viewMode === "grid" ? "max-w-4xl mx-auto" : "max-w-2xl mx-auto"}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Posts</h1>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("list")}
            aria-label={t.posts.listView}
          >
            <LayoutListIcon className="size-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("grid")}
            aria-label={t.posts.gridView}
          >
            <LayoutGridIcon className="size-4" />
          </Button>
        </div>
      </div>
      <PostList posts={posts} viewMode={viewMode} />
    </div>
  )
}
