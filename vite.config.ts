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
            publishDate: data.publishDate || "",
          }
        })
        .filter((p) => !p.draft && !(p.publishDate && p.publishDate > new Date().toISOString().split("T")[0]!))
        .sort((a, b) => (a.date > b.date ? -1 : 1))

      const items = posts.map((p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${BASE_URL}/posts/${p.slug}/</link>
      <guid>${BASE_URL}/posts/${p.slug}/</guid>
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
      const posts = fs.readdirSync(postsDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const raw = fs.readFileSync(path.resolve(postsDir, f), "utf-8")
          const { data } = parseFrontmatter(raw)
          return {
            slug: f.replace(".md", ""),
            date: data.date || "",
            draft: data.draft === "true",
            publishDate: data.publishDate || "",
          }
        })
        .filter((p) => !p.draft && !(p.publishDate && p.publishDate > new Date().toISOString().split("T")[0]!))

      const staticPages = ["/", "/posts/", "/tags/", "/series/", "/about/"]
      const today = new Date().toISOString().split("T")[0]

      function urlEntry(loc: string, lastmod: string) {
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
      }

      const urls = [
        ...staticPages.map((p) => urlEntry(`${BASE_URL}${p}`, today)),
        ...posts.map((p) => urlEntry(`${BASE_URL}/posts/${p.slug}/`, p.date || today)),
      ]

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`

      fs.writeFileSync(path.resolve(__dirname, "dist/sitemap.xml"), sitemap)
    },
  }
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function prerenderPlugin(): Plugin {
  return {
    name: "prerender-pages",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist")
      const template = fs.readFileSync(path.resolve(distDir, "index.html"), "utf-8")
      const postsDir = path.resolve(__dirname, "content/posts")

      function renderPage(opts: {
        title: string
        description: string
        url: string
        type?: string
        date?: string
        outputPath: string
      }) {
        const fullTitle = `${opts.title} | Devy's Blog`
        const desc = opts.description || "개발하며 배운 것들을 정리하고 공유합니다."
        const fullUrl = `${BASE_URL}${opts.url}`
        const ogType = opts.type || "website"

        let html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/,  `$1${escapeAttr(desc)}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${escapeAttr(fullTitle)}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${escapeAttr(desc)}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/,  `$1${fullUrl}$2`)
          .replace(/(<meta property="og:type" content=")[^"]*(")/,  `$1${ogType}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/,  `$1${fullUrl}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/,  `$1${escapeAttr(fullTitle)}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/,  `$1${escapeAttr(desc)}$2`)

        if (opts.type === "article" && opts.date) {
          const jsonLd = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: opts.title,
            description: desc,
            datePublished: opts.date,
            url: fullUrl,
            image: `${BASE_URL}/og-image.png`,
            author: { "@type": "Person", name: "Devy" },
            publisher: { "@type": "Organization", name: "Devy's Blog" },
          })
          html = html.replace("</head>", `    <script type="application/ld+json">${jsonLd}</script>\n  </head>`)
        }

        const outPath = path.resolve(distDir, opts.outputPath)
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, html)
      }

      // Pre-render blog posts
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
            publishDate: data.publishDate || "",
          }
        })
        .filter((p) => !p.draft && !(p.publishDate && p.publishDate > new Date().toISOString().split("T")[0]!))

      for (const post of posts) {
        renderPage({
          title: post.title,
          description: post.description,
          url: `/posts/${post.slug}/`,
          type: "article",
          date: post.date,
          outputPath: `posts/${post.slug}/index.html`,
        })
      }

      // Pre-render static pages
      const staticPages = [
        { path: "posts", title: "글 목록", description: "개발하며 배운 것들을 정리한 글 목록입니다." },
        { path: "tags", title: "태그", description: "태그별로 분류된 블로그 글 목록입니다." },
        { path: "series", title: "시리즈", description: "시리즈별로 분류된 블로그 글 목록입니다." },
        { path: "about", title: "소개", description: "개발자 Devy의 소개 페이지입니다." },
      ]

      for (const page of staticPages) {
        renderPage({
          title: page.title,
          description: page.description,
          url: `/${page.path}/`,
          outputPath: `${page.path}/index.html`,
        })
      }

      console.log(`  [prerender] Generated ${posts.length} post pages + ${staticPages.length} static pages`)
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
  plugins: [react(), sitemapPlugin(), rssPlugin(), spa404Plugin(), prerenderPlugin()],
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
