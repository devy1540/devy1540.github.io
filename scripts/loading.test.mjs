import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import { isPublished, postMetadataSource } from "./post-assets.ts"
import { parseFrontmatter } from "../src/lib/post-frontmatter.ts"

test("metadata keeps headers and reading time without article content", () => {
  const body = "본문에만있는검색어 ".repeat(450)
  const raw = `---\ntitle: "A title"\ndate: "2026-09-01"\nupdated: "2026-09-02"\ntags: ["a"]\n---\n${body}`
  const metadata = postMetadataSource(raw)
  const parsed = parseFrontmatter(metadata)
  assert.equal(parsed.data.title, "A title")
  assert.deepEqual(parsed.data.tags, ["a"])
  assert.equal(parsed.data.readingMinutes, "3")
  assert.equal(parsed.content, "")
  assert.ok(!metadata.includes("본문에만있는검색어"))
})

test("production indices exclude drafts and future posts", () => {
  const raw = (extra) => `---\ntitle: "Post"\n${extra}\n---\ncontent`
  assert.equal(isPublished(raw('draft: true'), "2026-09-22"), false)
  assert.equal(isPublished(raw('draft: "true"'), "2026-09-22"), false)
  assert.equal(isPublished(raw('publishDate: "2026-09-23"'), "2026-09-22"), false)
  assert.equal(isPublished(raw('publishDate: "2026-09-22"'), "2026-09-22"), true)
  assert.equal(isPublished(raw('draft: false'), "2026-09-22"), true)
})

const manifest = JSON.parse(fs.readFileSync(new URL("../dist/.vite/manifest.json", import.meta.url), "utf8"))
function staticImports(key, visited = new Set()) {
  if (visited.has(key)) return visited
  assert.ok(manifest[key], `Missing build manifest entry: ${key}`)
  visited.add(key)
  for (const dependency of manifest[key].imports ?? []) staticImports(dependency, visited)
  return visited
}

test("initial page and analytics shell do not wait for chart or body/search chunks", () => {
  for (const entry of ["index.html", "src/pages/AnalyticsPage.tsx"]) {
    const imports = [...staticImports(entry)]
    assert.deepEqual(imports.filter((key) => /AnalyticsCharts|post-body|post-search|_chart-/.test(key)), [])
  }
  assert.ok(manifest["src/components/AnalyticsCharts.tsx"]?.isDynamicEntry)
  assert.ok(manifest["virtual:post-search/ko"]?.isDynamicEntry)
  assert.ok(manifest["virtual:post-search/en"]?.isDynamicEntry)
})

test("prerendered article keeps its body while analytics has stable chart placeholders", () => {
  const article = fs.readFileSync(new URL("../dist/posts/spring-ai-cs-automation/index.html", import.meta.url), "utf8")
  assert.match(article, /<h1/)
  assert.match(article, /class="prose/)
  assert.match(article, /배경과 운영 경계/)
  assert.match(article, /id="post-hydration-data"/)
  assert.ok(!article.includes("본문을 불러오는 중"))
  const analytics = fs.readFileSync(new URL("../dist/analytics/index.html", import.meta.url), "utf8")
  assert.match(analytics, /차트를 불러오는 중/)
  assert.ok(!analytics.includes('id="S:'))
})

test("Markdown charts are server-rendered as data tables and their renderer stays out of the initial import graph", () => {
  for (const entry of ["index.html", "src/pages/PostPage.tsx", "src/components/CodeBlock.tsx"]) {
    assert.deepEqual([...staticImports(entry)].filter((key) => /MarkdownChartPlot|BenchmarkChart|_chart-/.test(key)), [])
  }
  assert.ok(manifest["src/components/MarkdownChartPlot.tsx"]?.isDynamicEntry)
  assert.ok(manifest["src/components/BenchmarkChart.tsx"]?.isDynamicEntry)
  const article = fs.readFileSync(new URL("../dist/posts/odin-ax-transformation/index.html", import.meta.url), "utf8")
  const figures = [...article.matchAll(/<figure\b[^>]*data-markdown-chart[^>]*>([\s\S]*?)<\/figure>/g)]
  assert.equal(figures.length, 2)
  for (const figure of figures) {
    assert.match(figure[1], /<table/)
    assert.ok(!figure[1].includes("<pre"))
    assert.ok(!figure[1].includes("<svg"))
  }
  assert.match(figures[0][1], /22:01 KST/)
  assert.match(figures[1][1], /35\.4/)
  assert.match(figures[1][1], /29\/34/)
  assert.match(figures[1][1], /70\/75/)
})
