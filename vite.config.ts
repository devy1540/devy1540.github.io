import path from "path"
import fs from "fs"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"

const BASE_URL = "https://devy1540.github.io"

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

function rssPlugin(): Plugin {
  return {
    name: "generate-rss",
    closeBundle() {
      const postsDir = path.resolve(__dirname, "content/posts")
      const posts = fs.readdirSync(postsDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const raw = fs.readFileSync(path.resolve(postsDir, f), "utf-8")
          const { data } = parseFrontmatter(raw)
          return {
            slug: f.replace(".md", ""),
            title: data.title || f.replace(".md", ""),
            description: data.description || "",
            date: data.date || "",
            draft: data.draft === "true",
          }
        })
        .filter((p) => !p.draft)
        .sort((a, b) => (a.date > b.date ? -1 : 1))

      const items = posts.map((p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${BASE_URL}/posts/${p.slug}</link>
      <guid>${BASE_URL}/posts/${p.slug}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${p.date ? new Date(p.date).toUTCString() : ""}</pubDate>
    </item>`)

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Devy's Blog</title>
    <link>${BASE_URL}</link>
    <description>개발하며 배운 것들을 정리하고 공유합니다.</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`

      fs.writeFileSync(path.resolve(__dirname, "dist/rss.xml"), rss)
    },
  }
}

function sitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    closeBundle() {
      const postsDir = path.resolve(__dirname, "content/posts")
      const slugs = fs.readdirSync(postsDir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => {
          const raw = fs.readFileSync(path.resolve(postsDir, f), "utf-8")
          const { data } = parseFrontmatter(raw)
          return data.draft !== "true"
        })
        .map((f) => f.replace(".md", ""))

      const staticPages = ["/", "/posts", "/tags", "/series", "/search", "/about"]
      const today = new Date().toISOString().split("T")[0]

      const urls = [
        ...staticPages.map((p) => `  <url><loc>${BASE_URL}${p}</loc><lastmod>${today}</lastmod></url>`),
        ...slugs.map((s) => `  <url><loc>${BASE_URL}/posts/${s}</loc><lastmod>${today}</lastmod></url>`),
      ]

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`

      fs.writeFileSync(path.resolve(__dirname, "dist/sitemap.xml"), sitemap)
    },
  }
}

function spa404Plugin(): Plugin {
  return {
    name: "copy-index-to-404",
    closeBundle() {
      const indexPath = path.resolve(__dirname, "dist/index.html")
      const notFoundPath = path.resolve(__dirname, "dist/404.html")
      fs.copyFileSync(indexPath, notFoundPath)
    },
  }
}

export default defineConfig({
  plugins: [react(), sitemapPlugin(), rssPlugin(), spa404Plugin()],
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
          if (id.includes("shiki")) {
            return "shiki"
          }
          if (id.includes("react-markdown") || id.includes("remark") || id.includes("rehype") || id.includes("unified") || id.includes("mdast") || id.includes("hast") || id.includes("micromark")) {
            return "markdown"
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
})
