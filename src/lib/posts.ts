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
    content,
  }
}

export function getAllPosts(): PostMeta[] {
  return Object.entries(postFiles)
    .map(([path, raw]) => {
      const { content: _, ...meta } = parsePost(path, raw)
      return meta
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const [path, raw] of Object.entries(postFiles)) {
    const post = parsePost(path, raw)
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
  return parsePost(entry[0], entry[1])
}
