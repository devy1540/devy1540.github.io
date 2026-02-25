import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/PostList"

export function HomePage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-2xl mx-auto">
      <section className="py-12 md:py-20">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Devy's Blog
        </h1>
        <p className="text-muted-foreground text-lg mt-4">
          개발 이야기를 기록합니다.
        </p>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Recent Posts
        </h2>
        <PostList posts={posts} />
      </section>
    </div>
  )
}
