import { useMemo } from "react"
import { Link } from "react-router-dom"
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts"
import { useMetaTags } from "@/hooks/useMetaTags"
import { usePageViews } from "@/hooks/usePageViews"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye } from "lucide-react"
import { useT } from "@/i18n"

export function HomePage() {
  useMetaTags({ url: "/" })
  const posts = getAllPosts()
  const recentPosts = posts.slice(0, 5)
  const t = useT()
  const series = getAllSeries()
  const tags = getAllTags()
  const { totalViews, allPageViews } = usePageViews()

  const popularPosts = useMemo(() => {
    if (!allPageViews) return []
    return Object.entries(allPageViews)
      .filter(([path]) => path.startsWith("/posts/"))
      .map(([path, views]) => {
        const slug = path.replace("/posts/", "").replace(/\/$/, "")
        const post = posts.find((p) => p.slug === slug)
        return { slug, title: post?.title ?? slug, views }
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [allPageViews, posts])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Devy's Blog
        </h1>
        <p className="text-muted-foreground">
          {t.home.subtitle}
        </p>
        <div className="flex gap-3 mt-4">
          <Button asChild>
            <Link to="/posts" viewTransition>
              {t.home.viewPosts}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about" viewTransition>{t.home.introduction}</Link>
          </Button>
        </div>
      </section>

      {/* Mini Stats */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards [animation-delay:100ms]">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">{posts.length}</span> {t.home.statsPosts}
          {" · "}
          <span className="text-foreground font-medium">{series.length}</span> {t.home.statsSeries}
          {" · "}
          <span className="text-foreground font-medium">{tags.length}</span> {t.home.statsTags}
          {totalViews != null && (
            <>
              {" · "}
              <span className="text-foreground font-medium">{totalViews.toLocaleString()}</span> {t.home.statsViews}
            </>
          )}
        </p>
      </section>

      {/* Recent Posts */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards [animation-delay:200ms]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.common.recentPosts}
          </h2>
          {posts.length > 5 && (
            <Link
              to="/posts"
              viewTransition
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t.common.viewAll}
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
        <PostList posts={recentPosts} />
      </section>

      {/* Popular Posts Top 5 */}
      {popularPosts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards [animation-delay:300ms]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t.home.popularPosts}
            </h2>
            <Link
              to="/analytics"
              viewTransition
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t.common.viewAll}
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {popularPosts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/posts/${post.slug}`}
                viewTransition
                className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors"
              >
                <span className="text-xs font-medium text-muted-foreground w-5 text-right tabular-nums">
                  {i + 1}
                </span>
                <span className="text-sm flex-1 truncate">{post.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
                  <Eye className="size-3" />
                  {post.views.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
