import assert from "node:assert/strict"
import test from "node:test"
import { createRetryableLoader } from "../src/lib/async-loader.ts"

test("prefetch and navigation share one request and reuse the result", async () => {
  let calls = 0
  let resolve
  const load = createRetryableLoader(() => {
    calls++
    return new Promise((done) => { resolve = done })
  })
  const prefetch = load()
  const navigation = load()
  assert.equal(prefetch, navigation)
  await Promise.resolve()
  resolve("ready")
  assert.equal(await navigation, "ready")
  assert.equal(await load(), "ready")
  assert.equal(calls, 1)
})

test("a rejected loader promise is cleared before retry", async () => {
  let calls = 0
  const load = createRetryableLoader(async () => {
    if (++calls === 1) throw new Error("offline")
    return "recovered"
  })
  await assert.rejects(load(), /offline/)
  assert.equal(await load(), "recovered")
})

test("a stalled request times out and can be retried", async () => {
  let calls = 0
  const load = createRetryableLoader(() => ++calls === 1 ? new Promise(() => {}) : Promise.resolve("ready"), 20)
  await assert.rejects(load(), /timed out/)
  assert.equal(await load(), "ready")
})
