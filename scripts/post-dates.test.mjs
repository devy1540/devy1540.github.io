import assert from "node:assert/strict"
import test from "node:test"

import {
  assertValidPostDates,
  getPostModifiedDate,
  hasDistinctUpdatedDate,
} from "../src/lib/post-dates.ts"

test("uses the publication date when updated is absent", () => {
  assert.equal(getPostModifiedDate({ date: "2026-07-01" }), "2026-07-01")
  assert.equal(hasDistinctUpdatedDate({ date: "2026-07-01" }), false)
})

test("uses and exposes a distinct updated date", () => {
  const dates = { date: "2026-07-01", updated: "2026-07-10" }

  assert.equal(getPostModifiedDate(dates), "2026-07-10")
  assert.equal(hasDistinctUpdatedDate(dates), true)
})

test("treats an updated date equal to the publication date as unchanged", () => {
  const dates = { date: "2026-07-01", updated: "2026-07-01" }

  assert.equal(getPostModifiedDate(dates), "2026-07-01")
  assert.equal(hasDistinctUpdatedDate(dates), false)
})

test("rejects invalid calendar dates", () => {
  assert.throws(
    () => assertValidPostDates({ date: "2026-02-30" }, "2026-07-19"),
    /publication date.*YYYY-MM-DD/,
  )
})

test("rejects an updated date before publication", () => {
  assert.throws(
    () => assertValidPostDates({ date: "2026-07-10", updated: "2026-07-09" }, "2026-07-19"),
    /before publication date/,
  )
})

test("rejects a future updated date", () => {
  assert.throws(
    () => assertValidPostDates({ date: "2026-07-10", updated: "2026-07-20" }, "2026-07-19"),
    /future/,
  )
})
