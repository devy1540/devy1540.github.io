import assert from "node:assert/strict"
import test from "node:test"
import vm from "node:vm"
import fs from "node:fs"
import { PageViewsClient, parsePageViews } from "../src/lib/page-views-client.ts"
import { buildDailySeries, getPreviousComparableRange } from "../src/lib/analytics-data.ts"
const data = { totalViews: 8, pages: { "/posts/example": 4 }, daily: [], meta: { cachedAt: "2026-09-30T00:00:00Z" } }
const reply = () => Promise.resolve(new Response(JSON.stringify(data)))
test("fetch is invoked without the analytics client as its receiver", async () => {
  const client = new PageViewsClient("https://example.test", () => undefined, function (url) {
    assert.equal(this, undefined)
    assert.equal(url, "https://example.test")
    return reply()
  })
  const result = await client.load()
  assert.equal(result.isError, false)
  assert.equal(result.data.totalViews, 8)
})
test("storage denial and corrupt caches do not discard a valid API response", async () => {
  for (const storage of [() => { throw new Error("denied") }, () => ({ getItem: () => "{broken", removeItem() {}, setItem() { throw new Error("denied") } })]) {
    const result = await new PageViewsClient("https://example.test", storage, reply).load()
    assert.equal(result.data.totalViews, 8)
    assert.equal(result.isError, false)
  }
})
test("failed refresh preserves the last successful counts", async () => {
  let failed = false
  const client = new PageViewsClient("https://example.test", () => undefined, () => failed ? Promise.resolve(new Response("{}", { status: 503 })) : reply())
  await client.load(); failed = true
  const result = await client.load(true)
  assert.equal(result.data.totalViews, 8)
  assert.equal(result.isError, true)
})
test("analytics failures and invalid counters are rejected", () => {
  assert.throws(() => parsePageViews({ success: false, totalViews: 0, pages: {} }))
  assert.throws(() => parsePageViews({ totalViews: 8, pages: { bad: -1 } }))
  assert.throws(() => parsePageViews({ totalViews: 8, pages: {}, daily: [{ date: "bad", views: 1 }] }))
})
test("comparison uses calendar days, includes zero days, and follows KST", () => {
  const now = new Date("2026-09-29T16:00:00Z")
  assert.equal(buildDailySeries(1, [], now)[0].date, "2026-09-30")
  const previous = getPreviousComparableRange(7, [{ date: "2026-09-01", views: 1 }, { date: "2026-09-22", views: 3 }], now)
  assert.equal(previous.length, 7)
  assert.equal(previous[0].date, "2026-09-17")
  assert.equal(previous.at(-1).date, "2026-09-23")
  assert.equal(previous.find(item => item.date === "2026-09-22").views, 3)
  assert.equal(previous.find(item => item.date === "2026-09-21").views, 0)
  assert.deepEqual(getPreviousComparableRange(30, [{ date: "2026-09-01", views: 1 }], now), [])
})
test("Apps Script never caches a GA failure as zero views", () => {
  let wroteCache = false
  const context = { CacheService: { getScriptCache: () => ({ get: () => null, put: () => { wroteCache = true } }) }, Logger: { log() {} }, AnalyticsData: { newRunReportRequest: () => { throw new Error("unavailable") } }, ContentService: { MimeType: { JSON: "json" }, createTextOutput: text => ({ text, setMimeType() { return this } }) } }
  vm.createContext(context)
  vm.runInContext(fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8"), context)
  const result = JSON.parse(context.doGet().text)
  assert.equal(result.success, false)
  assert.equal(wroteCache, false)
})
