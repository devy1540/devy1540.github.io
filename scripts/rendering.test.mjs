import assert from "node:assert/strict"
import test from "node:test"
import { RenderCache } from "../src/lib/render-cache.ts"
import { createRenderQueue, RenderCancelledError } from "../src/lib/render-queue.ts"
import { normalizeCodeLanguage } from "../src/lib/code-languages.ts"

test("render cache evicts least recently read values and enforces its memory bound", () => {
  const cache = new RenderCache(2, 10)
  cache.set("a", "first", 4)
  cache.set("b", "second", 4)
  assert.equal(cache.get("a"), "first")
  cache.set("c", "third", 4)
  assert.equal(cache.get("b"), undefined)
  cache.set("a", "replacement", 8)
  assert.equal(cache.get("c"), undefined)
  assert.equal(cache.get("a"), "replacement")
  cache.set("huge", "not cached", 20)
  assert.equal(cache.get("huge"), undefined)
})

test("simultaneous subscribers share rendering and later readers reuse the cached output", async () => {
  let calls = 0
  const request = createRenderQueue(async value => { calls++; return `svg:${value}` })
  const first = request("same", "diagram")
  const second = request("same", "diagram")
  assert.equal(await first.promise, "svg:diagram")
  assert.equal(await second.promise, "svg:diagram")
  assert.equal(await request("same", "diagram").promise, "svg:diagram")
  assert.equal(calls, 1)
})

test("cancelled obsolete work is skipped without cancelling another subscriber", async () => {
  const rendered = []
  const request = createRenderQueue(async value => { rendered.push(value); return value })
  const obsolete = request("light", "light")
  const discarded = assert.rejects(obsolete.promise, RenderCancelledError)
  obsolete.cancel()
  const first = request("dark", "dark")
  const second = request("dark", "dark")
  const removed = assert.rejects(first.promise, RenderCancelledError)
  first.cancel()
  await Promise.all([discarded, removed])
  assert.equal(await second.promise, "dark")
  assert.deepEqual(rendered, ["dark"])
})

test("rendering jobs run serially and a failure does not block retry or the next job", async () => {
  let active = 0
  let maximum = 0
  let failed = false
  const request = createRenderQueue(async value => {
    active++; maximum = Math.max(maximum, active)
    await new Promise(resolve => setTimeout(resolve, 5))
    active--
    if (value === "first" && !failed) { failed = true; throw new Error("failed") }
    return value
  })
  const first = request("first", "first")
  const second = request("second", "second")
  await assert.rejects(first.promise, /failed/)
  assert.equal(await second.promise, "second")
  assert.equal(await request("first", "first").promise, "first")
  assert.equal(maximum, 1)
})

test("language aliases share highlighting while plain and unsupported code stays readable", () => {
  assert.equal(normalizeCodeLanguage("TS"), "typescript")
  assert.equal(normalizeCodeLanguage("javascript"), normalizeCodeLanguage("js"))
  assert.equal(normalizeCodeLanguage("plaintext"), undefined)
  assert.equal(normalizeCodeLanguage("mermaid"), undefined)
  assert.equal(normalizeCodeLanguage("constructor"), undefined)
})
