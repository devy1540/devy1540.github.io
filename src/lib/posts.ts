import type { Post, PostMeta } from "@/types/post"
import type { Language } from "@/i18n"
import { assertValidPostDates } from "@/lib/post-dates"

const postFiles = import.meta.glob("/content/posts/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

const supportedLanguages = ["ko", "en"] as const satisfies readonly Language[]

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

function parsePostPath(filePath: string): { language: Language; slug: string } | undefined {
  const match = filePath.match(/^\/content\/posts\/(ko|en)\/(.+)\.md$/)
  if (!match) return undefined
  return { language: match[1] as Language, slug: match[2]! }
}

function getAvailableLanguages(slug: string): Language[] {
  return supportedLanguages.filter((language) => {
    const entry = postFiles[`/content/posts/${language}/${slug}.md`]
    if (!entry) return false
    const { data } = parseFrontmatter(entry)
    return !import.meta.env.PROD || !isHidden({
      draft: data.draft === true || data.draft === "true",
      publishDate: (data.publishDate as string) || undefined,
    })
  })
}

function parsePost(filePath: string, raw: string): Post {
  const parsedPath = parsePostPath(filePath)
  const language = parsedPath?.language ?? "ko"
  const slug = parsedPath?.slug ?? filePath.replace(/^.*\//, "").replace(".md", "")
  const { data, content } = parseFrontmatter(raw)

  const post: Post = {
    slug,
    language,
    availableLanguages: getAvailableLanguages(slug),
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    updated: (data.updated as string) || undefined,
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    series: (data.series as string) || undefined,
    seriesOrder: data.seriesOrder ? Number(data.seriesOrder) : undefined,
    draft: data.draft === true || data.draft === "true",
    publishDate: (data.publishDate as string) || undefined,
    content,
  }

  assertValidPostDates(post)
  return post
}

function isHidden(post: Pick<PostMeta, "draft" | "publishDate">): boolean {
  if (post.draft) return true
  if (post.publishDate && post.publishDate > new Date().toISOString().split("T")[0]!) return true
  return false
}

function toPostMeta(post: Post): PostMeta {
  return {
    slug: post.slug,
    language: post.language,
    availableLanguages: post.availableLanguages,
    title: post.title,
    date: post.date,
    updated: post.updated,
    description: post.description,
    tags: post.tags,
    series: post.series,
    seriesOrder: post.seriesOrder,
    draft: post.draft,
    publishDate: post.publishDate,
  }
}

function getAllParsedPosts(language: Language): Post[] {
  return Object.entries(postFiles)
    .filter(([path]) => parsePostPath(path)?.language === language)
    .map(([path, raw]) => parsePost(path, raw))
    .filter((post) => !import.meta.env.PROD || !isHidden(post))
}

export function getAllPosts(language: Language = "ko"): PostMeta[] {
  return getAllParsedPosts(language)
    .map(toPostMeta)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getAllTags(language: Language = "ko"): string[] {
  const tags = new Set<string>()
  for (const post of getAllParsedPosts(language)) {
    post.tags.forEach((t) => tags.add(t))
  }
  return [...tags].sort()
}

export function getPostsByTag(tag: string, language: Language = "ko"): PostMeta[] {
  return getAllPosts(language).filter((post) => post.tags.includes(tag))
}

export function getPostBySlug(slug: string, language: Language = "ko"): Post | undefined {
  const path = `/content/posts/${language}/${slug}.md`
  const raw = postFiles[path]
  if (!raw) return undefined
  const post = parsePost(path, raw)
  if (import.meta.env.PROD && isHidden(post)) return undefined
  return post
}

export function getPostAvailableLanguages(slug: string): Language[] {
  return getAvailableLanguages(slug)
}

export function searchPosts(query: string, language: Language = "ko"): PostMeta[] {
  if (!query.trim()) return getAllPosts(language)
  const q = query.toLowerCase()
  return getAllParsedPosts(language)
    .filter((post) => {
      return (
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.content.toLowerCase().includes(q)
      )
    })
    .map(toPostMeta)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function advancedSearch(options: {
  query?: string
  dateFrom?: string
  dateTo?: string
  tag?: string
  language?: Language
}): PostMeta[] {
  const { query, dateFrom, dateTo, tag, language = "ko" } = options
  const q = query?.toLowerCase().trim()

  return getAllParsedPosts(language)
    .filter((post) => {
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
    .map(toPostMeta)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export interface SeriesInfo {
  name: string
  postCount: number
  firstDate: string
  latestDate: string
  description: string
  tags: string[]
  posts: PostMeta[]
}

export function getAllSeries(language: Language = "ko"): SeriesInfo[] {
  const posts = getAllPosts(language)
  const seriesMap = new Map<string, { posts: PostMeta[]; firstDate: string; latestDate: string }>()

  for (const post of posts) {
    if (!post.series) continue
    const existing = seriesMap.get(post.series)
    if (existing) {
      existing.posts.push(post)
      if (post.date < existing.firstDate) existing.firstDate = post.date
      if (post.date > existing.latestDate) existing.latestDate = post.date
    } else {
      seriesMap.set(post.series, { posts: [post], firstDate: post.date, latestDate: post.date })
    }
  }

  return [...seriesMap.entries()]
    .map(([name, { posts, firstDate, latestDate }]) => {
      const orderedPosts = sortSeriesPosts(posts)
      const tagCounts = new Map<string, number>()
      for (const post of orderedPosts) {
        for (const tag of post.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
        }
      }

      return {
        name,
        postCount: orderedPosts.length,
        firstDate,
        latestDate,
        description: orderedPosts[0]?.description ?? "",
        tags: [...tagCounts.entries()]
          .sort(([a, aCount], [b, bCount]) => bCount - aCount || a.localeCompare(b))
          .map(([tag]) => tag),
        posts: orderedPosts,
      }
    })
    .sort((a, b) => {
      if (a.latestDate !== b.latestDate) return b.latestDate.localeCompare(a.latestDate)
      return a.name.localeCompare(b.name)
    })
}

export function getSeriesPosts(seriesName: string, language: Language = "ko"): PostMeta[] {
  return sortSeriesPosts(getAllPosts(language).filter((p) => p.series === seriesName))
}

function sortSeriesPosts(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => {
    const aOrder = a.seriesOrder ?? Number.MAX_SAFE_INTEGER
    const bOrder = b.seriesOrder ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    if (a.date !== b.date) return a.date > b.date ? -1 : 1
    return a.title.localeCompare(b.title)
  })
}

export function getAdjacentPosts(slug: string, language: Language = "ko"): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getAllPosts(language)
  const index = posts.findIndex((p) => p.slug === slug)
  if (index === -1) return { prev: null, next: null }

  return {
    prev: index < posts.length - 1 ? posts[index + 1] ?? null : null,
    next: index > 0 ? posts[index - 1] ?? null : null,
  }
}
