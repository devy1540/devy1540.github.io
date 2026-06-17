import path from "path"
import fs from "fs"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"

const BASE_URL = "https://devy1540.dev"
const LANGUAGES = ["ko", "en"] as const

type ContentLanguage = typeof LANGUAGES[number]

interface BuildPost {
  slug: string
  language: ContentLanguage
  title: string
  description: string
  date: string
  draft: boolean
  publishDate: string
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {} as Record<string, string>, content: raw }
  const data: Record<string, string> = {}
  for (const line of match[1]!.split("\n")) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    let val = line.slice(idx + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    data[line.slice(0, idx).trim()] = val
  }
  return { data, content: match[2]! }
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function attachXmlStylesheet(xml: string, href: string) {
  return xml.replace("?>\n", `?>\n<?xml-stylesheet type="text/xsl" href="${escapeXml(href)}"?>\n`)
}

function postUrl(post: Pick<BuildPost, "slug" | "language">) {
  return post.language === "en"
    ? `${BASE_URL}/en/posts/${post.slug}/`
    : `${BASE_URL}/posts/${post.slug}/`
}

function staticPageUrl(page: string, language: ContentLanguage) {
  if (language === "ko") return `${BASE_URL}${page}`
  return page === "/" ? `${BASE_URL}/en/` : `${BASE_URL}/en${page}`
}

function readPosts(language: ContentLanguage): BuildPost[] {
  const postsDir = path.resolve(__dirname, "content/posts", language)
  if (!fs.existsSync(postsDir)) return []

  return fs.readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.resolve(postsDir, f), "utf-8")
      const { data } = parseFrontmatter(raw)
      return {
        slug: f.replace(".md", ""),
        language,
        title: data.title || f.replace(".md", ""),
        description: data.description || "",
        date: data.date || "",
        draft: data.draft === "true",
        publishDate: data.publishDate || "",
      }
    })
    .filter((p) => !p.draft && !(p.publishDate && p.publishDate > new Date().toISOString().split("T")[0]!))
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

function rssPlugin(): Plugin {
  return {
    name: "generate-rss",
    closeBundle() {
      function writeFeed(language: ContentLanguage) {
        const posts = readPosts(language)
        const isEnglish = language === "en"

        const items = posts.map((p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${postUrl(p)}</link>
      <guid>${postUrl(p)}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${p.date ? new Date(p.date).toUTCString() : ""}</pubDate>
    </item>`)

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Devy Archive</title>
    <link>${isEnglish ? `${BASE_URL}/en/` : BASE_URL}</link>
    <description>${isEnglish ? "An archive of Devy's development and operations notes, organized around problem solving." : "Devy의 개발과 운영 기록을 문제 해결 중심으로 모아둔 아카이브입니다."}</description>
    <language>${isEnglish ? "en" : "ko"}</language>
    <atom:link href="${isEnglish ? `${BASE_URL}/en/rss.xml` : `${BASE_URL}/rss.xml`}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`

        const outPath = isEnglish ? path.resolve(__dirname, "dist/en/rss.xml") : path.resolve(__dirname, "dist/rss.xml")
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, rss)
      }

      writeFeed("ko")
      writeFeed("en")
    },
  }
}

function sitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    closeBundle() {
      const koPosts = readPosts("ko")
      const enPosts = readPosts("en")
      const enPostSlugs = new Set(enPosts.map((p) => p.slug))
      const staticPages = ["/", "/posts/", "/tags/", "/series/", "/search/", "/analytics/", "/about/"]
      const today = new Date().toISOString().split("T")[0]

      function alternateEntry(hreflang: string, href: string) {
        return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`
      }

      function urlEntry(loc: string, lastmod: string, alternates: { hreflang: string; href: string }[] = []) {
        return [
          "  <url>",
          `    <loc>${escapeXml(loc)}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          ...alternates.map((alt) => alternateEntry(alt.hreflang, alt.href)),
          "  </url>",
        ].join("\n")
      }

      const urls = [
        ...staticPages.flatMap((page) => {
          const alternates = [
            { hreflang: "ko-KR", href: staticPageUrl(page, "ko") },
            { hreflang: "en", href: staticPageUrl(page, "en") },
            { hreflang: "x-default", href: staticPageUrl(page, "ko") },
          ]
          return LANGUAGES.map((language) => urlEntry(staticPageUrl(page, language), today, alternates))
        }),
        ...koPosts.map((p) => {
          const alternates = [
            { hreflang: "ko-KR", href: postUrl(p) },
            ...(enPostSlugs.has(p.slug) ? [{ hreflang: "en", href: `${BASE_URL}/en/posts/${p.slug}/` }] : []),
            { hreflang: "x-default", href: postUrl(p) },
          ]
          return urlEntry(postUrl(p), p.date || today, alternates)
        }),
        ...enPosts.map((p) => {
          const koPost = koPosts.find((candidate) => candidate.slug === p.slug)
          const alternates = [
            ...(koPost ? [{ hreflang: "ko-KR", href: postUrl(koPost) }] : []),
            { hreflang: "en", href: postUrl(p) },
            ...(koPost ? [{ hreflang: "x-default", href: postUrl(koPost) }] : []),
          ]
          return urlEntry(postUrl(p), p.date || today, alternates)
        }),
      ]

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`

      fs.writeFileSync(path.resolve(__dirname, "dist/sitemap.xml"), attachXmlStylesheet(sitemap, "/sitemap.xsl"))
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    ...(!isSsrBuild ? [sitemapPlugin(), rssPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[/\\]node_modules[/\\](react|react-dom|scheduler)[/\\]/.test(id)) {
            return "react"
          }
          if (id.includes("shiki")) {
            return "shiki"
          }
          if (id.includes("react-router")) {
            return "router"
          }
          if (id.includes("radix-ui") || id.includes("@radix")) {
            return "ui"
          }
        },
      },
    },
  },
}))
