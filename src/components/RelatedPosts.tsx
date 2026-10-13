import { Link } from "react-router-dom"
import { useT } from "@/i18n"
import { postPath } from "@/lib/i18n-routing"
import { Separator } from "@/components/ui/separator"
import type { PostMeta } from "@/types/post"

export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  const t = useT()
  if (!posts.length) return null

  return (
    <section aria-labelledby="related-posts-heading" className="mt-10">
      <Separator className="mb-6" />
      <h2 id="related-posts-heading" className="text-lg font-semibold mb-3">{t.post.relatedPosts}</h2>
      <ul className="space-y-1">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={postPath(post.slug, post.language)}
              className="group block rounded-md px-3 py-3 -mx-3 transition-colors hover:bg-accent/50"
            >
              <span className="text-sm font-medium group-hover:text-primary transition-colors">{post.title}</span>
              {post.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
