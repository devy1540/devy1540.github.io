import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const baseUrl = "https://devy1540.dev"
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
  }))
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

test("post JSON-LD uses date for publication and updated for modification", () => {
  for (const post of posts) {
    const jsonLd = readBlogPostingJsonLd(post)
    assert.ok(jsonLd, `missing BlogPosting JSON-LD for ${postUrl(post)}`)
    assert.equal(jsonLd.datePublished, post.date, `wrong datePublished for ${postUrl(post)}`)
    assert.ok(post.updated, `missing updated frontmatter for ${postUrl(post)}`)
    assert.equal(jsonLd.dateModified, post.updated, `wrong dateModified for ${postUrl(post)}`)
  }
})
