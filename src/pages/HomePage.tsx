import { Link } from "react-router-dom"
import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HomePage() {
  const posts = getAllPosts()
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="max-w-2xl mx-auto">
      <section className="py-16 md:py-24">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          반갑습니다
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Devy가 만드는
          <br />
          대박 개발 블로그
        </h1>
        <p className="text-muted-foreground text-lg mt-4 max-w-md">
          개발하며 배운 것들을 정리하고 공유합니다.
        </p>
        <div className="flex gap-3 mt-8">
          <Button asChild>
            <Link to="/posts">
              글 목록 보기
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about">소개</Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Posts
          </h2>
          {posts.length > 5 && (
            <Link
              to="/posts"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              전체 보기
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
        <PostList posts={recentPosts} />
      </section>
    </div>
  )
}
