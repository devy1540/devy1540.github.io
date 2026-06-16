import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getPrerenderRoutes, render } from "../dist-ssr/entry-server.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const distDir = path.resolve(rootDir, "dist")
const template = fs.readFileSync(path.resolve(distDir, "index.html"), "utf-8")
const baseUrl = "https://devy1540.dev"

function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function toFullTitle(title) {
  return title ? `${title} | Devy Archive` : "Devy Archive"
}

function toCanonicalPath(routePath) {
  if (routePath === "/") return "/"
  return routePath.endsWith("/") ? routePath : `${routePath}/`
}

function toAbsoluteUrl(routePath) {
  return `${baseUrl}${toCanonicalPath(routePath)}`
}

function safeJsonLd(jsonLd) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c")
}

function outputPathFor(routePath) {
  if (routePath === "/") return path.resolve(distDir, "index.html")
  return path.resolve(distDir, routePath.replace(/^\//, ""), "index.html")
}

function withHead(templateHtml, route) {
  const fullTitle = toFullTitle(route.title)
  const description = route.description || "Devy의 개발과 운영 기록을 문제 해결 중심으로 모아둔 아카이브입니다."
  const previewTitle = route.ogTitle || fullTitle
  const previewDescription = route.ogDescription || description
  const canonicalPath = route.canonicalPath || route.path
  const fullUrl = toAbsoluteUrl(canonicalPath)
  const ogType = route.type || "website"
  const htmlLang = route.language === "en" ? "en" : "ko"

  let html = templateHtml
    .replace(/<html lang="[^"]*"/, `<html lang="${htmlLang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeAttr(description)}$2`)
    .replace(/(<meta name="robots" content=")[^"]*(")/, `$1${route.noindex ? "noindex, nofollow" : "index, follow"}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(previewTitle)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttr(previewDescription)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escapeAttr(fullUrl)}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${escapeAttr(ogType)}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${route.language === "en" ? "en_US" : "ko_KR"}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeAttr(fullUrl)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeAttr(previewTitle)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeAttr(previewDescription)}$2`)

  if (!html.includes('meta name="robots"')) {
    html = html.replace(
      /(<meta name="description" content="[^"]*" \/>)/,
      `$1\n    <meta name="robots" content="${route.noindex ? "noindex, nofollow" : "index, follow"}" />`
    )
  }

  if (route.alternates) {
    const alternates = [
      route.alternates.ko ? `    <link rel="alternate" hreflang="ko-KR" href="${escapeAttr(toAbsoluteUrl(route.alternates.ko))}">` : "",
      route.alternates.en ? `    <link rel="alternate" hreflang="en" href="${escapeAttr(toAbsoluteUrl(route.alternates.en))}">` : "",
      route.alternates.ko ? `    <link rel="alternate" hreflang="x-default" href="${escapeAttr(toAbsoluteUrl(route.alternates.ko))}">` : "",
    ].filter(Boolean).join("\n")
    if (alternates) {
      html = html.replace("</head>", `${alternates}\n  </head>`)
    }
  }

  if (route.jsonLd) {
    html = html.replace("</head>", `    <script type="application/ld+json">${safeJsonLd(route.jsonLd)}</script>\n  </head>`)
  }

  return html
}

function injectAppHtml(templateHtml, appHtml) {
  return templateHtml.replace(
    /<div id="root"([^>]*)><\/div>/,
    `<div id="root"$1>${appHtml}</div>`
  )
}

const routes = getPrerenderRoutes()

for (const route of routes) {
  const appHtml = await render(route.path)
  const html = injectAppHtml(withHead(template, route), appHtml)
  const outPath = outputPathFor(route.path)

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, html)
}

const notFoundRoute = {
  path: "/404/",
  title: "404",
  description: "요청한 페이지를 찾을 수 없습니다.",
}
const notFoundHtml = injectAppHtml(withHead(template, notFoundRoute), await render(notFoundRoute.path))
fs.writeFileSync(path.resolve(distDir, "404.html"), notFoundHtml)
console.log(`  [ssg] Hydrated prerender generated ${routes.length} pages`)
