import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const baseUrl = "https://dev.devy.dev"
const today = new Date().toISOString().slice(0, 10)

function frontmatterValue(raw, key) {
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ""
  const line = frontmatter.split(/\r?\n/).find((candidate) => candidate.startsWith(`${key}:`))
  return line?.slice(line.indexOf(":") + 1).trim().replace(/^['"]|['"]$/g, "") ?? ""
}

function readPublishedPosts(language) {
  const postsDir = path.join(rootDir, "content/posts", language)

  return fs.readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf8")
      return {
        slug: file.slice(0, -3),
        language,
        date: frontmatterValue(raw, "date"),
        updated: frontmatterValue(raw, "updated"),
        draft: frontmatterValue(raw, "draft") === "true",
        publishDate: frontmatterValue(raw, "publishDate"),
      }
    })
    .filter((post) => !post.draft && !(post.publishDate && post.publishDate > today))
}

function parseSitemapEntries() {
  const sitemap = fs.readFileSync(path.join(rootDir, "dist/sitemap.xml"), "utf8")
  return [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: match[1].match(/<loc>(.*?)<\/loc>/)?.[1],
    lastmod: match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
    alternates: [...match[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)]
      .map((alternate) => ({ hreflang: alternate[1], href: alternate[2] })),
  }))
}

function readPrerenderedProjectSlugs(language) {
  const prefix = language === "en" ? ["en"] : []
  const projectsDir = path.join(rootDir, "dist", ...prefix, "about", "projects")
  return fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(projectsDir, entry.name, "index.html")))
    .map((entry) => entry.name)
    .sort()
}

function projectUrl(slug, language) {
  const prefix = language === "en" ? "/en" : ""
  return `${baseUrl}${prefix}/about/projects/${slug}/`
}

function readPrerenderedProjectHtml(slug, language) {
  const prefix = language === "en" ? ["en"] : []
  return fs.readFileSync(path.join(rootDir, "dist", ...prefix, "about", "projects", slug, "index.html"), "utf8")
}

function htmlText(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function postUrl(post) {
  const prefix = post.language === "en" ? "/en" : ""
  return `${baseUrl}${prefix}/posts/${post.slug}/`
}

function readBlogPostingJsonLd(post) {
  const prefix = post.language === "en" ? ["en"] : []
  const htmlPath = path.join(rootDir, "dist", ...prefix, "posts", post.slug, "index.html")
  const html = fs.readFileSync(htmlPath, "utf8")
  const documents = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
  return documents.find((document) => document["@type"] === "BlogPosting")
}

const posts = [...readPublishedPosts("ko"), ...readPublishedPosts("en")]

test("published posts use explicit updated as sitemap lastmod", () => {
  const entries = new Map(parseSitemapEntries().map((entry) => [entry.loc, entry]))

  for (const post of posts) {
    const entry = entries.get(postUrl(post))
    assert.ok(entry, `missing sitemap entry for ${postUrl(post)}`)
    assert.ok(post.updated, `missing updated frontmatter for ${postUrl(post)}`)
    assert.equal(entry.lastmod, post.updated, `wrong lastmod for ${postUrl(post)}`)
  }
})

test("static and aggregate pages omit unreliable sitemap lastmod", () => {
  const entries = new Map(parseSitemapEntries().map((entry) => [entry.loc, entry]))
  const staticPaths = ["/", "/posts/", "/tags/", "/series/", "/analytics/", "/about/", "/privacy/"]

  for (const staticPath of staticPaths) {
    for (const languagePrefix of ["", "/en"]) {
      const localizedPath = languagePrefix && staticPath === "/" ? "/en/" : `${languagePrefix}${staticPath}`
      const url = `${baseUrl}${localizedPath}`
      assert.ok(entries.has(url), `missing sitemap entry for ${url}`)
      assert.equal(entries.get(url).lastmod, undefined, `unexpected lastmod for ${url}`)
    }
  }
})

test("all localized project pages are linked and included in sitemap with reciprocal alternates", () => {
  const entries = new Map(parseSitemapEntries().map((entry) => [entry.loc, entry]))
  const koSlugs = readPrerenderedProjectSlugs("ko")
  const enSlugs = readPrerenderedProjectSlugs("en")

  assert.ok(koSlugs.length > 0, "missing prerendered Korean project pages")
  assert.deepEqual(enSlugs, koSlugs, "Korean and English project routes differ")

  for (const slug of koSlugs) {
    const koUrl = projectUrl(slug, "ko")
    const enUrl = projectUrl(slug, "en")
    const expectedAlternates = [
      { hreflang: "ko-KR", href: koUrl },
      { hreflang: "en", href: enUrl },
      { hreflang: "x-default", href: koUrl },
    ]

    for (const url of [koUrl, enUrl]) {
      const entry = entries.get(url)
      assert.ok(entry, `missing sitemap entry for ${url}`)
      assert.equal(entry.lastmod, undefined, `unexpected lastmod for ${url}`)
      assert.deepEqual(entry.alternates, expectedAlternates, `wrong alternates for ${url}`)
    }
  }

  for (const language of ["ko", "en"]) {
    const prefix = language === "en" ? ["en"] : []
    const aboutHtml = fs.readFileSync(path.join(rootDir, "dist", ...prefix, "about", "index.html"), "utf8")
    for (const slug of koSlugs) {
      const expectedPath = language === "en"
        ? `/en/about/projects/${slug}/`
        : `/about/projects/${slug}/`
      assert.match(aboutHtml, new RegExp(`href="${expectedPath}"`), `missing About link to ${expectedPath}`)
    }
  }
})

test("localized project HTML has matching language, title, canonical, and alternates", () => {
  for (const language of ["ko", "en"]) {
    for (const slug of readPrerenderedProjectSlugs(language)) {
      const html = readPrerenderedProjectHtml(slug, language)
      const url = projectUrl(slug, language)
      const title = htmlText(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "")
      const heading = htmlText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "")

      assert.match(html, new RegExp(`<html lang="${language}"`), `wrong HTML language for ${url}`)
      assert.ok(heading, `missing project heading for ${url}`)
      assert.equal(title, `${heading} | Devy Archive`, `title and rendered project name differ for ${url}`)
      assert.match(html, /<meta name="robots" content="index, follow"/, `project is not indexable: ${url}`)
      assert.match(html, new RegExp(`<link rel="canonical" href="${url}"`), `wrong canonical for ${url}`)
      assert.match(html, /hreflang="ko-KR"/, `missing Korean alternate for ${url}`)
      assert.match(html, /hreflang="en"/, `missing English alternate for ${url}`)
      assert.match(html, /hreflang="x-default"/, `missing x-default alternate for ${url}`)
    }
  }
})

test("404 fallback is explicitly excluded from indexing", () => {
  const html = fs.readFileSync(path.join(rootDir, "dist", "404.html"), "utf8")
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/)
})

test("post JSON-LD uses date for publication and updated for modification", () => {
  for (const post of posts) {
    const jsonLd = readBlogPostingJsonLd(post)
    assert.ok(jsonLd, `missing BlogPosting JSON-LD for ${postUrl(post)}`)
    assert.equal(jsonLd.datePublished, post.date, `wrong datePublished for ${postUrl(post)}`)
    assert.ok(post.updated, `missing updated frontmatter for ${postUrl(post)}`)
    assert.equal(jsonLd.dateModified, post.updated, `wrong dateModified for ${postUrl(post)}`)
  }
})
