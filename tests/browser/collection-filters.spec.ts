import { test, expect } from "@playwright/test"
import fs from "node:fs"

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
})

for (const prefix of ["", "/en"]) {
  test(`home reading guides remain readable on mobile and desktop: ${prefix || "ko"}`, async ({ page }, testInfo) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${prefix}/`)
      const guides = page.getByRole("region", { name: prefix ? "Read by problem" : "문제별로 읽기", exact: true })
      await expect(guides.getByRole("link")).toHaveCount(12)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await guides.screenshot({ path: testInfo.outputPath(`reading-guides-${width}.png`) })
    }
  })

  test(`fragment tag filters hydrate, reload and navigate Back correctly: ${prefix || "ko"}`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("console", message => { if (/hydration|React error #418/i.test(message.text())) errors.push(message.text()) })
    const path = `${prefix}/tags/`
    await page.goto(`${path}#filters:tag=java`)
    await expect(page.locator("main aside h2")).toHaveText("java")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://dev.devy.dev${path}`)
    const link = page.locator(`main a[href="${path}#filters:tag=react"]`).first()
    await link.scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => scrollY)
    await link.click()
    await expect(page.locator("main aside h2")).toHaveText("react")
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(3)
    await page.goBack()
    await expect(page.locator("main aside h2")).toHaveText("java")
    await page.reload()
    await expect(page.locator("main aside h2")).toHaveText("java")
    expect(errors).toEqual([])
  })

  test(`legacy tag queries remain usable and new navigation uses fragments: ${prefix || "ko"}`, async ({ page }) => {
    await page.goto(`${prefix}/tags/?tag=java`)
    await expect(page.locator("main aside h2")).toHaveText("java")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://dev.devy.dev${prefix}/tags/?tag=java`)
    const viewPosts = page.locator(`main aside a[href="${prefix}/posts/#filters:tag=java"]`)
    await viewPosts.click()
    await expect(page).toHaveURL(new RegExp(`${prefix}/posts/#filters:tag=java$`))
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow")
    const cards = page.locator('main a[href^="' + prefix + '/posts/"]').filter({ has: page.locator("h3") })
    expect(await cards.count()).toBeGreaterThan(0)
    for (const card of await cards.all()) await expect(card).toContainText("java")
  })

  test(`series fragments keep the reading order and article links: ${prefix || "ko"}`, async ({ page }) => {
    const series = prefix ? "Service Internationalization" : "서비스 국제화 적용기"
    await page.goto(`${prefix}/series/#filters:name=${encodeURIComponent(series)}`)
    await expect(page.locator("main aside h2")).toHaveText(series)
    const links = page.locator(`main aside a[href^="${prefix}/posts/"]`)
    await expect(links.first()).toHaveAttribute("href", `${prefix}/posts/i18n-01-foundation/`)
    await links.first().click()
    await expect(page.locator("article h1")).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("lang", prefix ? "en" : "ko")
  })
}

test("language switching preserves tag filter fragments", async ({ page }) => {
  await page.goto("/tags/#filters:tag=java")
  await expect(page.locator("main aside h2")).toHaveText("java")
  await page.getByRole("button", { name: "언어 변경", exact: true }).click()
  await page.getByRole("menuitemcheckbox", { name: "English", exact: true }).click()
  await expect(page).toHaveURL(/\/en\/tags\/#filters:tag=java$/)
  await expect(page.locator("main aside h2")).toHaveText("java")
})

test("legacy search redirects preserve the query as reader state", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  page.on("console", message => { if (/hydration|React error #418/i.test(message.text())) errors.push(message.text()) })
  await page.goto("/search/?q=JSON-RPC")
  await expect(page).toHaveURL(/\/posts\/#filters:q=JSON-RPC$/)
  await expect(page.getByRole("textbox", { name: "제목, 설명, 태그, 본문 검색" })).toHaveValue("JSON-RPC")
  expect(errors).toEqual([])
})

test("article reading avoids unrelated route downloads until navigation intent", async ({ page }) => {
  const manifest = JSON.parse(fs.readFileSync("dist/.vite/manifest.json", "utf8"))
  const unrelatedRoutes = ["PostsPage", "TagsPage", "SeriesPage", "AboutPage", "AnalyticsPage"]
    .map(name => manifest[`src/pages/${name}.tsx`].file as string)
  const requests: string[] = []
  page.on("request", request => requests.push(new URL(request.url()).pathname.slice(1)))
  await page.goto("/posts/react-hooks-deep-dive/")
  await expect(page.locator("article h1")).toBeVisible()
  // The old idle loop started loading these routes after at most two seconds.
  await page.waitForTimeout(3500)
  expect(requests.filter(file => unrelatedRoutes.includes(file))).toEqual([])
  await page.getByRole("link", { name: "소개", exact: true }).hover()
  await expect.poll(() => requests.includes(manifest["src/pages/AboutPage.tsx"].file)).toBe(true)
  await page.getByRole("link", { name: "소개", exact: true }).click()
  await expect(page).toHaveURL(/\/about\/$/)
  await expect(page.locator("main h1")).toBeVisible()
})
