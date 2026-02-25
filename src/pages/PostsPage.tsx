import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/PostList"

export function PostsPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Posts</h1>
      <PostList posts={posts} />
    </div>
  )
}
