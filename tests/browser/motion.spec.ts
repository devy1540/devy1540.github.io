import { test, expect, type Page } from "@playwright/test"

interface MotionRecord {
  path: string
  duration: number
  easing: string
  samples: number[]
  finished: boolean
}

declare global {
  interface Window {
    motionRecords: MotionRecord[]
    topScrollSamples: number[]
  }
}

const post = "/posts/odin-ax-transformation/"

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
  await page.addInitScript(() => {
    // 네이티브 View Transition이 없는 브라우저도 동일한 화면 전환을 제공한다.
    Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true })
    window.motionRecords = []
    document.addEventListener("animationstart", event => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(".page-transition")) return
      const style = getComputedStyle(target)
      const record: MotionRecord = {
        path: location.pathname,
        duration: parseFloat(style.animationDuration),
        easing: style.animationTimingFunction,
        samples: [],
        finished: false,
      }
      window.motionRecords.push(record)
      const sample = () => {
        record.samples.push(Number(getComputedStyle(target).opacity))
        if (target.isConnected && target.getAnimations().length) requestAnimationFrame(sample)
        else record.finished = true
      }
      requestAnimationFrame(sample)
    })
  })
})

async function expectFade(page: Page, navigate: () => Promise<unknown>) {
  const before = await page.evaluate(() => window.motionRecords.length)
  await navigate()
  await expect.poll(() => page.evaluate(count => {
    const latest = window.motionRecords.slice(count).at(-1)
    return Boolean(latest?.finished && latest.path === location.pathname)
  }, before)).toBe(true)
  const record = await page.evaluate(count => window.motionRecords.slice(count).at(-1)!, before)
  expect(record.duration).toBeGreaterThan(0)
  expect(record.duration).toBeLessThanOrEqual(0.25)
  expect(record.samples.length).toBeGreaterThan(2)
  expect(Math.min(...record.samples)).toBeLessThan(0.8)
  expect(record.samples.at(-1)).toBe(1)
  return record
}

test("sidebar, cards, search results and Back share the same visible fade", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  await expect(page.getByRole("button", { name: "글 검색", exact: true })).toBeEnabled()
  const navigation = page.locator('[data-slot="sidebar-content"]')
  const records: MotionRecord[] = []
  for (const name of ["글 목록", "시리즈", "태그", "분석", "소개", "홈"]) {
    records.push(await expectFade(page, () => navigation.getByRole("link", { name, exact: true }).click()))
    await expect(page.locator("main h1")).toBeVisible()
  }
  records.push(await expectFade(page, () => page.locator(`main a[href="${post}"]`).first().click()))
  records.push(await expectFade(page, () => page.goBack()))
  await page.getByRole("button", { name: "글 검색", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.locator('[data-slot="command-input"]').fill("업무 병목")
  const result = dialog.getByRole("option").filter({ hasText: "팀의 업무 병목을 줄이기 위한 AX 전환" })
  await expect(result).toBeVisible()
  records.push(await expectFade(page, () => result.click()))
  await expect(page).toHaveURL(new RegExp(post))
  expect(new Set(records.map(record => `${record.duration}/${record.easing}`)).size).toBe(1)
})

test("filter typing keeps focus and TOC navigation does not replay the page fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/posts/")
  await expect.poll(() => page.evaluate(() => window.motionRecords.at(-1)?.finished)).toBe(true)
  const before = await page.evaluate(() => window.motionRecords.length)
  const input = page.getByRole("textbox", { name: "제목, 설명, 태그, 본문 검색" })
  await input.fill("JSON-RPC")
  await expect(page).toHaveURL(/q=JSON-RPC/)
  await expect(input).toBeFocused()
  expect(await page.evaluate(() => window.motionRecords.length)).toBe(before)

  await page.goto(post)
  await expect.poll(() => page.evaluate(() => window.motionRecords.at(-1)?.finished)).toBe(true)
  const articleBefore = await page.evaluate(() => window.motionRecords.length)
  await page.locator(".post-toc-panel a").filter({ hasText: "App Server와는 양방향" }).click()
  await expect(page).toHaveURL(/#/)
  expect(await page.evaluate(() => window.motionRecords.length)).toBe(articleBefore)
})

test("reduced motion disables page fades and the back-to-top smooth scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page.getByRole("link", { name: "글 목록", exact: true }).click()
  await expect(page.locator("main h1")).toHaveText("글 목록")
  await page.locator(`main a[href="${post}"]`).first().click()
  await expect(page.locator("article .prose h2").first()).toBeVisible()
  expect(await page.evaluate(() => window.motionRecords.length)).toBe(0)
  await page.evaluate(() => {
    window.scrollTo(0, 1600)
    window.topScrollSamples = []
    window.addEventListener("scroll", () => window.topScrollSamples.push(window.scrollY), { passive: true })
  })
  await expect(page.getByRole("button", { name: "맨 위로", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "맨 위로", exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  const intermediate = await page.evaluate(() => window.topScrollSamples.filter(y => y > 0 && y < 1500))
  expect(intermediate).toEqual([])
})

test("mobile menu navigation uses the same fade as desktop navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click()
  const drawer = page.getByRole("dialog")
  const record = await expectFade(page, () => drawer.getByRole("link", { name: "글 목록", exact: true }).click())
  await expect(drawer).toBeHidden()
  expect(record.duration).toBe(0.2)
  await expect(page.locator("main h1")).toHaveText("글 목록")
})
