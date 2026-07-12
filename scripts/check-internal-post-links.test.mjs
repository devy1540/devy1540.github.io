import assert from "node:assert/strict"
import test from "node:test"
import { findMissingPostLinks } from "./check-internal-post-links.mjs"

test("존재하지 않는 게시글 slug를 내부 링크 오류로 보고한다", () => {
  const missing = findMissingPostLinks([
    {
      path: "content/posts/existing.md",
      content: "[누락 글](/posts/not-published)",
    },
    {
      path: "content/posts/other.md",
      content: "[존재 글](/posts/existing)",
    },
  ])

  assert.deepEqual(missing, [
    {
      path: "content/posts/existing.md",
      href: "/posts/not-published",
      slug: "not-published",
    },
  ])
})
