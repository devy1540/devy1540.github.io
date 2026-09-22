import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const dist = fileURLToPath(new URL("../dist/", import.meta.url))
const origin = "https://dev.devy.dev"
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8")
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const pages = new Map(urls.map((url) => [url, fs.readFileSync(path.join(dist, new URL(url).pathname, "index.html"), "utf8")]))

function schemas(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
}

function alternates(html) {
  return [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map((match) => ({ language: match[1], url: match[2] }))
}

function text(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").trim()
}

test("every sitemap URL has indexable HTML with one matching canonical and language", () => {
  assert.ok(urls.length > 0)
  assert.equal(new Set(urls).size, urls.length)
  for (const [url, html] of pages) {
    const pathname = new URL(url).pathname
    assert.equal(new URL(url).origin, origin)
    assert.ok(pathname.endsWith("/"), url)
    assert.deepEqual([...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]), [url], url)
    assert.match(html, /<meta name="robots" content="index, follow"/, url)
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html), url)
    assert.ok(html.includes(`<html lang="${pathname.startsWith("/en/") ? "en" : "ko"}"`), url)
    assert.match(html, /<h1\b/, url)
    assert.ok(!html.includes('id="S:'), `unfinished Suspense segment: ${url}`)
  }
})

test("language alternatives resolve to reciprocal, indexable pages", () => {
  for (const [url, html] of pages) {
    for (const alternate of alternates(html)) {
      assert.ok(pages.has(alternate.url), `missing alternate ${alternate.url} on ${url}`)
      assert.ok(alternates(pages.get(alternate.url)).some((entry) => entry.url === url), `non-reciprocal alternate ${alternate.url} on ${url}`)
    }
  }
})

test("all published articles include visible content and matching React-owned structured data", () => {
  const articles = [...pages].filter(([url]) => /\/(?:en\/)?posts\/[^/]+\/$/.test(new URL(url).pathname))
  assert.ok(articles.length > 0)
  for (const [url, html] of articles) {
    const documents = schemas(html)
    assert.equal(documents.length, 1, url)
    const article = documents[0]
    assert.equal(article["@type"], "BlogPosting", url)
    assert.equal(article.url, url)
    assert.equal(article.mainEntityOfPage["@id"], url)
    assert.equal(article.image, html.match(/<meta property="og:image" content="([^"]+)"/)?.[1], `article and Open Graph image differ: ${url}`)
    assert.equal(article.inLanguage, new URL(url).pathname.startsWith("/en/") ? "en" : "ko-KR", url)
    assert.equal(article.headline, text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ""), url)
    assert.ok(article.articleBody.trim().length > 0, `empty article schema: ${url}`)
    assert.ok(pages.has(article.author.url), `missing author page: ${url}`)
    assert.ok(!schemas(html.split("</head>")[0]).length, `unmanaged head schema: ${url}`)
    assert.match(html, /<div class="prose[^\"]*">\s*<(?:p|h[1-6]|blockquote|ul|ol)/, `missing rendered article body: ${url}`)
    assert.match(html, /id="post-hydration-data"/, url)
    assert.ok(!html.includes("본문을 불러오는 중"), url)
  }
})

test("home, collection, and project metadata is rendered by the active React page", () => {
  for (const [url, html] of pages) {
    const pathname = new URL(url).pathname
    const expected = /^\/(en\/)?$/.test(pathname) ? "Blog"
      : /^\/(en\/)?posts\/$/.test(pathname) ? "CollectionPage"
        : pathname.includes("/about/projects/") ? "WebPage" : null
    if (!expected) continue
    const documents = schemas(html)
    assert.equal(documents.length, 1, url)
    assert.equal(documents[0]["@type"], expected, url)
    assert.equal(documents[0].url, url)
    assert.equal(documents[0].inLanguage, pathname.startsWith("/en/") ? "en" : "ko-KR", url)
    assert.ok(!schemas(html.split("</head>")[0]).length, `unmanaged head schema: ${url}`)
  }
})

test("non-indexable prerendered routes do not publish article structured data", () => {
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(file)
      else if (entry.name.endsWith(".html")) {
        const html = fs.readFileSync(file, "utf8")
        if (/<meta name="robots" content="[^"]*noindex/.test(html)) {
          assert.ok(!schemas(html).some((schema) => schema["@type"] === "BlogPosting"), file)
        }
      }
    }
  }
  visit(dist)
  assert.match(fs.readFileSync(path.join(dist, "404.html"), "utf8"), /<meta name="robots" content="noindex, nofollow"/)
})
