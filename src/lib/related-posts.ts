import type { PostMeta } from "@/types/post"

// A shared language or framework alone does not make two articles related.
const generalTags = new Set([
  "java", "kotlin", "typescript", "javascript", "spring", "spring-boot",
  "react", "nextjs", "css", "shadcn-ui", "backend", "frontend", "devops", "migration",
])

export function selectRelatedPosts(
  current: PostMeta,
  posts: PostMeta[],
  excludedSlugs: string[] = [],
  limit = 3,
): PostMeta[] {
  const excluded = new Set([current.slug, ...excludedSlugs])
  const tags = new Set(current.tags)
  const today = new Date().toISOString().split("T")[0]!

  return posts
    .filter((post) => {
      if (post.language !== current.language || excluded.has(post.slug)) return false
      if (post.draft || (post.publishDate && post.publishDate > today)) return false
      if (current.series && post.series === current.series) return false
      excluded.add(post.slug)
      return true
    })
    .map((post) => {
      const shared = post.tags.filter((tag) => tags.has(tag))
      const topics = shared.filter((tag) => !generalTags.has(tag)).length
      return { post, score: topics ? topics * 3 + shared.length : 0 }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug))
    .slice(0, limit)
    .map(({ post }) => post)
}
