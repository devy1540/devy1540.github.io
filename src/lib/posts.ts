import type { Post, PostMeta } from "@/types/post"

const postFiles = import.meta.glob("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>
  content: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const frontmatter = match[1]!
  const content = match[2]!
  const data: Record<string, unknown> = {}

  for (const line of frontmatter.split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Remove surrounding quotes
    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = value.slice(1, -1)
    }

    // Parse YAML-style arrays: ["a", "b"]
    if (typeof value === "string" && value.startsWith("[")) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'))
      } catch {
        // keep as string
      }
    }

    data[key] = value
  }

  return { data, content }
}

function parsePost(filePath: string, raw: string): Post {
  const slug = filePath.replace("/content/posts/", "").replace(".md", "")
  const { data, content } = parseFrontmatter(raw)

  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    series: (data.series as string) || undefined,
    seriesOrder: data.seriesOrder ? Number(data.seriesOrder) : undefined,
    draft: data.draft === true || data.draft === "true",
    content,
  }
}

export function getAllPosts(): PostMeta[] {
  return Object.entries(postFiles)
    .map(([path, raw]) => {
      const { content: _, ...meta } = parsePost(path, raw)
      return meta
    })
    .filter((post) => !import.meta.env.PROD || !post.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const [path, raw] of Object.entries(postFiles)) {
    const post = parsePost(path, raw)
    if (import.meta.env.PROD && post.draft) continue
    post.tags.forEach((t) => tags.add(t))
  }
  return [...tags].sort()
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag))
}

export function getPostBySlug(slug: string): Post | undefined {
  const entry = Object.entries(postFiles).find(([path]) =>
    path.endsWith(`/${slug}.md`)
  )
  if (!entry) return undefined
  const post = parsePost(entry[0], entry[1])
  if (import.meta.env.PROD && post.draft) return undefined
  return post
}

export function searchPosts(query: string): PostMeta[] {
  if (!query.trim()) return getAllPosts()
  const q = query.toLowerCase()
  return Object.entries(postFiles)
    .map(([path, raw]) => parsePost(path, raw))
    .filter((post) => {
      if (import.meta.env.PROD && post.draft) return false
      return (
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.content.toLowerCase().includes(q)
      )
    })
    .map(({ content: _, ...meta }) => meta)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function advancedSearch(options: {
  query?: string
  dateFrom?: string
  dateTo?: string
  tag?: string
}): PostMeta[] {
  const { query, dateFrom, dateTo, tag } = options
  const q = query?.toLowerCase().trim()

  return Object.entries(postFiles)
    .map(([path, raw]) => parsePost(path, raw))
    .filter((post) => {
      if (import.meta.env.PROD && post.draft) return false
      if (q && !(
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.content.toLowerCase().includes(q)
      )) return false
      if (dateFrom && post.date < dateFrom) return false
      if (dateTo && post.date > dateTo) return false
      if (tag && !post.tags.includes(tag)) return false
      return true
    })
    .map(({ content: _, ...meta }) => meta)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export interface SeriesInfo {
  name: string
  postCount: number
  firstDate: string
}

export function getAllSeries(): SeriesInfo[] {
  const posts = getAllPosts()
  const seriesMap = new Map<string, { count: number; firstDate: string }>()

  for (const post of posts) {
    if (!post.series) continue
    const existing = seriesMap.get(post.series)
    if (existing) {
      existing.count++
      if (post.date < existing.firstDate) existing.firstDate = post.date
    } else {
      seriesMap.set(post.series, { count: 1, firstDate: post.date })
    }
  }

  return [...seriesMap.entries()]
    .map(([name, { count, firstDate }]) => ({ name, postCount: count, firstDate }))
    .sort((a, b) => (a.firstDate > b.firstDate ? -1 : 1))
}

export function getSeriesPosts(seriesName: string): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.series === seriesName)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
}

export function getAdjacentPosts(slug: string): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === slug)
  if (index === -1) return { prev: null, next: null }

  return {
    prev: index < posts.length - 1 ? posts[index + 1] ?? null : null,
    next: index > 0 ? posts[index - 1] ?? null : null,
  }
}
