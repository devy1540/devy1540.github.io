import { Link } from "react-router-dom"
import { getAllPosts } from "@/lib/posts"
import { useMetaTags } from "@/hooks/useMetaTags"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { DailyVisitsChart } from "@/components/DailyVisitsChart"
import { useT } from "@/i18n"

export function HomePage() {
  useMetaTags({ url: "/" })
  const posts = getAllPosts()
  const recentPosts = posts.slice(0, 5)
  const t = useT()

  return (
    <div className="max-w-2xl mx-auto">
      <section className="mb-10">
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

      <section className="mb-10">
        <DailyVisitsChart />
      </section>

      <section>
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
    </div>
  )
}
