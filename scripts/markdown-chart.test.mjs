import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import { createElement } from "react"
import { parseMarkdownChart, formatChartValue } from "../src/lib/markdown-chart.ts"
import { readMarkdownCode } from "../src/lib/markdown-code.ts"

const fixture = () => ({
  type: "bar", title: "Response time", categoryLabel: "Period", unit: "min", decimals: 1,
  series: [{ key: "minutes", label: "Median" }],
  data: [{ label: "Before", minutes: 35.404, note: "29/34 observed" }, { label: "After", minutes: 0, partial: true }],
})
const parse = (value) => parseMarkdownChart(JSON.stringify(value))

test("preserves values, zero, sample notes and partial-period markers", () => {
  const result = parse(fixture())
  assert.equal(result.rows[0].values.minutes, 35.404)
  assert.equal(result.rows[0].note, "29/34 observed")
  assert.equal(result.rows[1].values.minutes, 0)
  assert.equal(result.rows[1].partial, true)
  assert.equal(formatChartValue(result.rows[0].values.minutes, result.decimals), "35.4")
  assert.equal(formatChartValue(0, 1), "0")
})

test("rejects missing, nonnumeric, negative and nonfinite observations instead of replacing them with zero", () => {
  for (const value of [undefined, null, "3.4", -1, [], {}]) {
    const spec = fixture(); spec.data[0].minutes = value
    assert.equal(parse(spec), null)
  }
  assert.equal(parseMarkdownChart(JSON.stringify(fixture()).replace("35.404", "1e400")), null)
})

test("rejects duplicate categories, series, reserved keys and CSS injection", () => {
  const duplicate = fixture(); duplicate.data[1].label = "Before"
  assert.equal(parse(duplicate), null)
  const duplicateSeries = fixture(); duplicateSeries.series.push(duplicateSeries.series[0])
  assert.equal(parse(duplicateSeries), null)
  for (const key of ["__proto__", "constructor", "label", "total", "x;body{color:red}"]) {
    const spec = fixture(); spec.series[0].key = key
    assert.equal(parse(spec), null)
  }
  const style = fixture(); style.series[0].color = "red;}body{display:none}"
  assert.equal(parse(style), null)
})

test("handles invalid configuration without throwing or accepting excessive payloads", () => {
  for (const value of [null, [], {}, { ...fixture(), type: "pie" }, { ...fixture(), decimals: 1.5 }, { ...fixture(), data: [] }]) assert.equal(parse(value), null)
  assert.equal(parseMarkdownChart("not JSON"), null)
  assert.equal(parseMarkdownChart(" ".repeat(60_001)), null)
})

test("Markdown code extraction retains Mermaid line breaks and distinguishes chart blocks", () => {
  const code = createElement("code", { className: "language-mermaid" }, ["A[one", createElement("br", { key: "br" }), "two]\n"])
  assert.deepEqual(readMarkdownCode(code), { language: "mermaid", code: "A[one<br/>two]" })
  assert.deepEqual(readMarkdownCode(createElement("code", { className: "language-chart" }, "{}\n")), { language: "chart", code: "{}" })
})

test("Odin's interactive charts retain the published cohort counts and observation conditions", () => {
  const post = fs.readFileSync(new URL("../content/posts/ko/odin-ax-transformation.md", import.meta.url), "utf8")
  const specs = [...post.matchAll(/```chart\n([\s\S]*?)\n```/g)].map((m) => parseMarkdownChart(m[1]))
  assert.equal(specs.length, 2)
  const [routing, reply] = specs
  assert.ok(routing && reply)
  assert.deepEqual(routing.rows.map((r) => Object.values(r.values).reduce((a, b) => a + b, 0)), [25, 9, 45, 45, 32, 43, 18])
  assert.equal(routing.rows[4].values.odin + routing.rows[5].values.odin, 50)
  assert.equal(routing.rows.filter((r) => r.partial).length, 1)
  assert.match(routing.rows[6].note, /9\/22 22:01 KST/)
  assert.deepEqual(reply.rows.map((r) => formatChartValue(r.values.minutes, reply.decimals)), ["35.4", "3.4"])
  assert.match(reply.rows[0].note, /29\/34/)
  assert.match(reply.rows[1].note, /70\/75/)
  assert.ok(!post.includes("-metrics.png"))
})
