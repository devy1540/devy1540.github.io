import assert from "node:assert/strict"
import test from "node:test"
import { canonicalUrl, renderSeoHead, resolveSeo } from "../src/lib/seo.ts"

test("canonical addresses normalize paths, retain legacy queries, and discard document fragments", () => {
  assert.equal(canonicalUrl(), "https://dev.devy.dev/")
  assert.equal(canonicalUrl("/en/topics/spring-ai#section"), "https://dev.devy.dev/en/topics/spring-ai/")
  assert.equal(canonicalUrl("/tags?tag=C%2B%2B#filters:tag=java"), "https://dev.devy.dev/tags/?tag=C%2B%2B")
  assert.throws(() => canonicalUrl("https://example.com/post"), /must belong/)
})

test("metadata escapes text and attribute values without corrupting literal replacement tokens", () => {
  const html = renderSeoHead({ title: 'A & B <script> $& $1', description: '" onload="oops < &', url: "/topics/test" }, "ko")
  assert.ok(html.includes("A &amp; B &lt;script&gt; $&amp; $1 | Devy Archive"))
  assert.ok(html.includes('content="&quot; onload=&quot;oops &lt; &amp;"'))
  assert.ok(!html.includes("<script>"))
})

test("only explicit translations and indexable article dates are emitted", () => {
  const options = { type: "article", datePublished: "2026-01-01", dateModified: "2026-02-01", alternateUrls: { ko: "/posts/ko-only" } }
  const seo = resolveSeo(options, "ko")
  assert.deepEqual(seo.alternates.map(alt => alt.hreflang), ["ko-KR", "x-default"])
  assert.equal(seo.meta.filter(tag => tag.name.startsWith("article:")).length, 2)
  assert.equal(resolveSeo({ ...options, noindex: true }, "ko").meta.filter(tag => tag.name.startsWith("article:")).length, 0)
  assert.equal(resolveSeo({ ...options, type: "website" }, "en").meta.filter(tag => tag.name.startsWith("article:")).length, 0)
  assert.equal(resolveSeo({}, "en").feedUrl, "https://dev.devy.dev/en/rss.xml")
})
