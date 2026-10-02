import { test, expect } from "@playwright/test"
import fs from "node:fs"
const post = "/posts/odin-ax-transformation/"
const anchor = "app-server와는-양방향-json-rpc로-통신했다"

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
})

for (const url of ["/posts/?q=JSON-RPC", "/tags/?tag=java", "/series/?q=인증", "/posts/missing-post/", "/en/missing-page/"]) {
  test(`direct URL hydrates without errors: ${url}`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("console", message => { if (/hydration|React error #418/i.test(message.text())) errors.push(message.text()) })
    const response = await page.goto(url)
    await expect(page.locator("main h1")).toBeVisible()
    await page.getByRole("button", { name: "글 검색" }).or(page.getByRole("button", { name: /Search Posts/i })).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    expect(errors).toEqual([])
    if (url.includes("missing")) expect(response?.status()).toBe(404)
  })
}

test("shared article anchor and TOC preserve the target URL", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${post}#${encodeURIComponent(anchor)}`)
  const heading = page.locator(`[id="${anchor}"]`)
  await expect(heading).toBeInViewport()
  await expect(page.locator(".post-toc-panel")).toBeVisible()
  expect(await page.locator("article").evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(800)
  const link = page.locator(".post-toc-panel a").first()
  await link.click()
  const href = await link.getAttribute("href")
  await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe("#" + decodeURIComponent(href!.split("#")[1]!))
  const id = decodeURIComponent(new URL(page.url()).hash.slice(1))
  await expect(page.locator(`[id="${id}"]`)).toBeInViewport()
})

test("mobile TOC and article images reserve their size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(post)
  const toggle = page.getByRole("button", { name: "목차", exact: true })
  await expect(toggle).toBeVisible()
  await toggle.click()
  const link = page.locator(".post-toc-panel a").first()
  await expect(link).toBeVisible()
  await link.click()
  await expect(toggle).toHaveAttribute("aria-expanded", "false")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const images = await page.locator("article img").evaluateAll(elements => elements.map(el => ({ src: el.getAttribute("src"), loading: el.getAttribute("loading"), width: el.getAttribute("width"), height: el.getAttribute("height"), srcset: el.getAttribute("srcset") })))
  expect(images.length).toBeGreaterThan(0)
  for (const image of images) {
    expect(image.src).toMatch(/\.webp$/)
    expect(image.loading).toBe("lazy")
    expect(Number(image.width)).toBeGreaterThan(0)
    expect(Number(image.height)).toBeGreaterThan(0)
    expect(image.srcset).toContain("w")
  }
})

test("TOC moves through intermediate positions and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto(post)
  const link = page.locator(".post-toc-panel a").filter({ hasText: "App Server와는 양방향" })
  await expect(link).toBeVisible()
  await page.evaluate(() => {
    const state = window as unknown as Window & { scrollSamples: number[] }
    state.scrollSamples = []
    window.addEventListener("scroll", () => state.scrollSamples.push(window.scrollY), { passive: true })
  })
  await link.click()
  const target = page.locator(`[id="${anchor}"]`)
  await expect.poll(() => target.evaluate(el => Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop)))).toBeLessThan(5)
  const samples = await page.evaluate(() => (window as unknown as Window & { scrollSamples: number[] }).scrollSamples)
  expect(new Set(samples.map(value => Math.round(value))).size).toBeGreaterThan(3)
  await page.emulateMedia({ reducedMotion: "reduce" })
  const first = page.locator(".post-toc-panel a").first()
  await first.click()
  const id = decodeURIComponent(new URL(page.url()).hash.slice(1))
  await expect(page.locator(`[id="${id}"]`)).toBeInViewport()
})

test("diagram enlargement works with keyboard and restores focus", async ({ page }) => {
  await page.goto(post)
  const trigger = page.getByRole("button", { name: "다이어그램 확대" }).first()
  await expect(trigger).toBeEnabled({ timeout: 20000 })
  await trigger.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(trigger).toBeFocused()
})

test("blocked storage and invalid analytics keep the blog usable", async ({ page }) => {
  await page.route("https://script.google.com/**", route => route.fulfill({ json: { success: false, error: "unavailable" } }))
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { get() { throw new DOMException("Blocked", "SecurityError") } })
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError") } })
  })
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto("/posts/")
  await expect(page.locator("main h1")).toHaveText("글 목록")
  await page.getByRole("textbox", { name: "제목, 설명, 태그, 본문 검색" }).fill("JSON-RPC")
  await expect(page).toHaveURL(/q=JSON-RPC/)
  await expect(page.locator("main h3")).toHaveCount(1)
  await page.goto("/analytics/")
  await expect(page.getByRole("alert")).toContainText("조회수 데이터를 불러올 수 없습니다")
  await expect(page.getByRole("status").filter({ hasText: "데이터" })).toBeVisible()
  expect(errors).toEqual([])
})

test("browser Back restores the article reading position", async ({ page }) => {
  await page.goto(post)
  await expect(page.getByRole("button", { name: "글 검색", exact: true })).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, 1600))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1500)
  await page.getByRole("link", { name: "글 목록", exact: true }).first().click()
  await expect(page).toHaveURL(/\/posts\/$/)
  await page.goBack()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1500)
})

test("missing article returns the prerendered 404 HTML", () => {
  expect(fs.readFileSync("dist/404.html", "utf8")).toContain('data-prerender-route="/404/"')
})

test("desktop search and collapse stay in the sidebar with one search dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(post)
  await expect(page.locator("[data-mobile-header]")).toBeHidden()
  const sidebar = page.locator('[data-slot="sidebar"]').first()
  const search = page.getByRole("button", { name: "글 검색", exact: true })
  await expect(search).toBeVisible()
  await expect(sidebar.getByRole("button", { name: "글 검색", exact: true })).toBeVisible()
  await expect(search.locator("kbd")).toBeVisible()
  await page.getByRole("button", { name: "사이드바 접기", exact: true }).click()
  await expect(sidebar).toHaveAttribute("data-state", "collapsed")
  await expect(search).toBeVisible()
  await expect(search.locator("kbd")).toBeHidden()
  await search.click()
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await page.keyboard.press("Escape")
  await expect(search).toBeFocused()
  await page.keyboard.press("Control+k")
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await page.keyboard.press("Control+k")
  await expect(page.getByRole("dialog")).toBeHidden()
  await page.getByRole("button", { name: "사이드바 펼치기", exact: true }).click()
  await expect(sidebar).toHaveAttribute("data-state", "expanded")
})

test("mobile menu closes before the shared search opens and target headings stay visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(post)
  const header = page.locator("[data-mobile-header]")
  await expect(header).toBeVisible()
  expect(await header.evaluate(el => el.getBoundingClientRect().height)).toBe(48)
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click()
  const drawer = page.getByRole("dialog")
  await expect(drawer).toBeVisible()
  await drawer.getByRole("button", { name: "글 검색", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await expect(page.getByRole("dialog").locator('[data-slot="command-input"]')).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(header.getByRole("button", { name: "글 검색", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "목차", exact: true }).click()
  await page.locator(".post-toc-panel a").filter({ hasText: "App Server와는 양방향" }).click()
  const heading = page.locator(`[id="${anchor}"]`)
  await expect.poll(() => heading.evaluate(el => Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop)))).toBeLessThan(5)
  expect(await heading.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(90)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
