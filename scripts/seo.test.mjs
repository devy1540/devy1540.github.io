import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { selectRelatedPosts } from "../src/lib/related-posts.ts"
import { collectionFilterHash, collectionFilterPath, isCollectionFilterHash, readCollectionFilters } from "../src/lib/collection-filters.ts"

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

test("collection fragments preserve encoded filters and remain distinct from article anchors", () => {
  const params = new URLSearchParams({ tag: "C++", name: "서비스 & 롤백", q: "a#b" })
  const hash = collectionFilterHash(params)
  assert.deepEqual([...readCollectionFilters("?tag=legacy", hash)], [...params])
  assert.equal(collectionFilterPath("/tags", params, "en"), `/en/tags/${hash}`)
  assert.equal(readCollectionFilters("?tag=java", "#main-content").get("tag"), "java")
  assert.equal(collectionFilterHash(new URLSearchParams()), "")
  assert.equal(isCollectionFilterHash("/en/tags/", hash), true)
  assert.equal(isCollectionFilterHash("/posts/example/", hash), false)
  assert.equal(isCollectionFilterHash("/tags/", "#main-content"), false)
})

test("initial HTML exposes collection filters as fragments without new query URLs", () => {
  let filterLinks = 0
  for (const [source, html] of pages) {
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const destination = new URL(href.replace(/&amp;/g, "&"), source)
      if (destination.origin !== origin || !/^\/(en\/)?(posts|tags|series)\/$/.test(destination.pathname)) continue
      assert.equal(destination.search, "", `crawlable query link on ${source}: ${href}`)
      if (destination.hash.startsWith("#filters:")) {
        filterLinks++
        assert.ok(pages.has(`${origin}${destination.pathname}`), href)
      }
    }
  }
  assert.ok(filterLinks > 0)
})

test("robots rules restrict legacy collection queries while allowing every sitemap document", () => {
  const robots = fs.readFileSync(path.join(dist, "robots.txt"), "utf8")
  const blockedPrefixes = [...robots.matchAll(/^Disallow:\s*(\S+)$/gm)].map(match => match[1])
  // These rules deliberately use literal URL prefixes; '?' is not a wildcard in robots.txt.
  for (const prefix of blockedPrefixes) assert.ok(!/[*$]/.test(prefix), "extend this prefix-policy check before adding wildcard rules")
  const blocked = url => {
    const parsed = new URL(url, origin)
    return blockedPrefixes.some(prefix => `${parsed.pathname}${parsed.search}`.startsWith(prefix))
  }
  for (const url of urls) assert.equal(blocked(url), false, `blocked sitemap URL: ${url}`)
  for (const prefix of ["", "/en"]) {
    for (const route of ["posts", "tags", "series"]) {
      for (const slash of ["", "/"]) assert.equal(blocked(`${prefix}/${route}${slash}?tag=java`), true)
    }
    assert.equal(blocked(`${prefix}/posts/example/?utm_source=share`), false)
    assert.equal(blocked(`${prefix}/tags/#filters:tag=java`), false)
  }
})

test("localized home reading guides link directly to published articles in initial HTML", () => {
  for (const prefix of ["", "/en"]) {
    const html = pages.get(`${origin}${prefix}/`)
    const section = html.match(/<section aria-labelledby="reading-guides-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1]
    assert.ok(section, `missing reading guides: ${prefix}`)
    const links = [...section.matchAll(/href="([^"]+)"/g)].map(match => match[1])
    assert.equal(links.length, 12)
    assert.equal(new Set(links).size, links.length)
    for (const href of links) {
      assert.ok(href.startsWith(`${prefix}/posts/`), href)
      assert.ok(pages.has(`${origin}${href}`), `missing or unpublished guide target: ${href}`)
    }
    assert.ok(links.includes(`${prefix}/posts/i18n-03-rollout-killswitch/`))
    assert.ok(links.includes(`${prefix}/posts/gitops-argocd-n8n-deployment/`))
  }
})

test("related article selection keeps focused topics and excludes unavailable or duplicate destinations", () => {
  const post = (slug, overrides = {}) => ({ slug, language: "ko", availableLanguages: ["ko"], title: slug, date: "2026-01-01", updated: "2026-01-01", description: "", tags: ["java", "spring-boot", "authentication"], ...overrides })
  const current = post("current", { series: "Login" })
  const candidates = [
    current,
    post("same-series", { series: "Login" }),
    post("draft", { draft: true }),
    post("scheduled", { publishDate: "9999-01-01" }),
    post("translation", { language: "en" }),
    post("adjacent"),
    post("framework-only", { tags: ["java", "spring-boot", "payment"] }),
    post("jwt", { tags: ["authentication", "jwt"] }),
    post("jwt", { tags: ["authentication", "jwt"] }),
  ]
  assert.deepEqual(selectRelatedPosts(current, candidates, ["adjacent"]).map((entry) => entry.slug), ["jwt"])
  assert.deepEqual(selectRelatedPosts(current, [post("framework-only", { tags: ["java", "spring-boot"] })]), [])
})

test("initial article HTML includes crawlable related links to published pages in the same language", () => {
  let sections = 0
  for (const [url, html] of pages) {
    const section = html.match(/<section aria-labelledby="related-posts-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1]
    if (!section) continue
    sections++
    const hrefs = [...section.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1])
    assert.ok(hrefs.length > 0 && hrefs.length <= 3, url)
    assert.equal(new Set(hrefs).size, hrefs.length, `duplicate related links: ${url}`)
    for (const href of hrefs) {
      assert.match(href, /^\/(en\/)?posts\/[^/]+\/$/, url)
      const destination = new URL(href, origin).href
      assert.notEqual(destination, url, `self link: ${url}`)
      assert.ok(pages.has(destination), `unpublished or missing related article: ${destination}`)
      assert.equal(href.startsWith("/en/"), new URL(url).pathname.startsWith("/en/"), `related link changes language: ${url}`)
      assert.equal(schemas(pages.get(destination))[0]?.["@type"], "BlogPosting", destination)
    }
  }
  assert.ok(sections > 0, "related links must exist in the initial HTML")
})

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

test("localized homes identify one website while preserving each blog's canonical URL", () => {
  const homes = [...pages].filter(([url]) => /^\/(en\/)?$/.test(new URL(url).pathname))
  assert.equal(homes.length, 2)
  let websiteIdentity

  for (const [url, html] of homes) {
    const documents = schemas(html)
    assert.equal(documents.length, 2, url)
    const websites = documents.filter((document) => document["@type"] === "WebSite")
    const blogs = documents.filter((document) => document["@type"] === "Blog")
    assert.equal(websites.length, 1, url)
    assert.equal(blogs.length, 1, url)

    const website = websites[0]
    assert.equal(website.url, `${origin}/`, `localized path incorrectly identifies a separate website: ${url}`)
    assert.equal(website["@id"], `${origin}/#website`, url)
    assert.equal(website.name, "Devy Archive", url)
    assert.equal(website.name, text(html.match(/<meta property="og:site_name" content="([^"]+)"/)?.[1] ?? ""), `site name and Open Graph disagree: ${url}`)
    const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? ""
    const visibleContent = text(body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ""))
    assert.ok(visibleContent.includes(website.name), `preferred site name is missing from the visible home: ${url}`)
    assert.ok(Array.isArray(website.alternateName), url)
    for (const name of ["Devy 블로그", "Devy 기술 블로그", "Devy Blog", "dev.devy.dev"]) {
      assert.ok(website.alternateName.includes(name), `missing recognizable site name ${name}: ${url}`)
    }
    if (websiteIdentity) assert.deepEqual(website, websiteIdentity, `language variants identify different websites: ${url}`)
    else websiteIdentity = website

    assert.equal(blogs[0].url, url)
    assert.equal(blogs[0].inLanguage, new URL(url).pathname.startsWith("/en/") ? "en" : "ko-KR", url)
    assert.ok(!schemas(html.split("</head>")[0]).length, `unmanaged head schema: ${url}`)
  }
})

test("collection and project metadata is rendered by the active React page", () => {
  for (const [url, html] of pages) {
    const pathname = new URL(url).pathname
    const expected = /^\/(en\/)?posts\/$/.test(pathname) ? "CollectionPage"
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
