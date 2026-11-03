import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getPrerenderRoutes, render, preparePostContentForPrerender, getPostHydrationData, renderSeoHead, siteConfig as SITE, getFeedPosts, resolveSeo, escapeMarkup } from "../dist-ssr/entry-server.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const distDir = path.resolve(rootDir, "dist")
const template = fs.readFileSync(path.resolve(distDir, "index.html"), "utf-8")
const baseUrl = SITE.url

function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function safeJsonLd(jsonLd) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c")
}

function outputPathFor(routePath) {
  if (routePath === "/") return path.resolve(distDir, "index.html")
  return path.resolve(distDir, routePath.replace(/^\//, ""), "index.html")
}

function withHead(templateHtml, route) {
  const head = renderSeoHead({ ...route, url: route.path, alternateUrls: route.alternates }, route.language || "ko")
  if (!templateHtml.includes("<!-- seo:start -->")) throw new Error("Missing SEO head boundary")
  return templateHtml
    .replace(/<html lang="[^"]*"/, `<html lang="${route.language || "ko"}"`)
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => `<!-- seo:start -->\n    ${head}\n    <!-- seo:end -->`)
}

function writeDiscoveryFiles(routes) {
  const entries = routes.filter(route => !route.noindex).map(route => {
    const seo = resolveSeo({ ...route, url: route.path, alternateUrls: route.alternates }, route.language || "ko")
    if (new URL(seo.url).pathname !== route.path) throw new Error(`Non-canonical sitemap route: ${route.path}`)
    return [
      "  <url>",
      `    <loc>${escapeMarkup(seo.url)}</loc>`,
      ...(route.lastmod ? [`    <lastmod>${escapeMarkup(route.lastmod)}</lastmod>`] : []),
      ...seo.alternates.map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeMarkup(alt.href)}"/>`),
      "  </url>",
    ].join("\n")
  })
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`
  fs.writeFileSync(path.resolve(distDir, "sitemap.xml"), sitemap)
  for (const language of ["ko", "en"]) {
    const homePath = language === "en" ? "/en/" : "/"
    const home = routes.find(route => route.path === homePath)
    const seo = resolveSeo({ ...home, url: homePath }, language)
    const items = getFeedPosts(language).map(post => {
      const url = `${baseUrl}${language === "en" ? "/en" : ""}/posts/${post.slug}/`
      if (!routes.some(route => route.path === new URL(url).pathname && !route.noindex)) throw new Error(`RSS target is not indexable: ${url}`)
      return `    <item>
      <title>${escapeMarkup(post.title)}</title>
      <link>${escapeMarkup(url)}</link>
      <guid>${escapeMarkup(url)}</guid>
      <description>${escapeMarkup(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    })
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeMarkup(SITE.name)}</title>
    <link>${baseUrl}${homePath}</link>
    <description>${escapeMarkup(home.description)}</description>
    <language>${language}</language>
    <atom:link href="${seo.feedUrl}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>
`
    const feedPath = path.resolve(distDir, language === "en" ? "en/rss.xml" : "rss.xml")
    fs.mkdirSync(path.dirname(feedPath), { recursive: true })
    fs.writeFileSync(feedPath, rss)
  }
}

function injectAppHtml(templateHtml, appHtml, routePath) {
  return templateHtml.replace(
    /<div id="root"([^>]*)><\/div>/,
    `<div id="root"$1 data-prerender-route="${escapeAttr(routePath)}">${appHtml}</div>`
  )
}

await preparePostContentForPrerender()
const routes = getPrerenderRoutes()

for (const route of routes) {
  const appHtml = await render(route.path)
  let html = injectAppHtml(withHead(template, route), appHtml, route.path)
  const postData = getPostHydrationData(route.path)
  if (postData) {
    html = html.replace("</body>", `<script id="post-hydration-data" type="application/json">${safeJsonLd(postData)}</script>\n</body>`)
  }
  const outPath = outputPathFor(route.path)

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, html)
}

writeDiscoveryFiles(routes)

const notFoundRoute = {
  path: "/404/",
  title: "404",
  description: "요청한 페이지를 찾을 수 없습니다.",
  noindex: true,
}
const notFoundHtml = injectAppHtml(withHead(template, notFoundRoute), await render(notFoundRoute.path), notFoundRoute.path)
fs.writeFileSync(path.resolve(distDir, "404.html"), notFoundHtml)
console.log(`  [ssg] Hydrated prerender generated ${routes.length} pages`)
