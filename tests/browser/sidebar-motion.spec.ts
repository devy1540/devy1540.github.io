import { test, expect, type Page } from "@playwright/test"

interface SidebarFrame {
  width: number
  triggerRightOffset: number
  searchTop: number
  contentOpacity: number
  footerLeft: number
  footerRight: number
}

declare global {
  interface Window {
    sidebarFrames: SidebarFrame[]
    sidebarCaptureDone: boolean
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
})

async function captureToggle(page: Page, name: string) {
  await page.evaluate(() => {
    window.sidebarFrames = []
    window.sidebarCaptureDone = false
    document.addEventListener("click", () => {
      const start = performance.now()
      const sample = () => {
        const panel = document.querySelector('[data-slot="sidebar-container"]')!.getBoundingClientRect()
        const trigger = document.querySelector('[data-slot="sidebar-header"] button')!.getBoundingClientRect()
        const search = document.querySelector('[data-search-trigger="sidebar"]')!.getBoundingClientRect()
        const footer = Array.from(document.querySelectorAll('[data-slot="sidebar-footer"] button')).map(el => el.getBoundingClientRect())
        window.sidebarFrames.push({
          width: panel.width,
          triggerRightOffset: panel.right - trigger.right,
          searchTop: search.top,
          contentOpacity: Number(getComputedStyle(document.querySelector(".page-transition")!).opacity),
          footerLeft: Math.min(...footer.map(rect => rect.left)),
          footerRight: Math.max(...footer.map(rect => rect.right)) - panel.right,
        })
        if (performance.now() - start < 350) requestAnimationFrame(sample)
        else window.sidebarCaptureDone = true
      }
      sample()
    }, { once: true, capture: true })
  })
  await page.getByRole("button", { name, exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.sidebarCaptureDone)).toBe(true)
  return page.evaluate(() => window.sidebarFrames)
}

for (const path of ["/", "/posts/odin-ax-transformation/"]) {
  test(`sidebar controls stay aligned throughout collapse and expansion: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto(path)
    await expect(page.getByRole("button", { name: "사이드바 접기", exact: true })).toBeEnabled()
    await expect.poll(() => page.locator(".page-transition").evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1)
    const close = await captureToggle(page, "사이드바 접기")
    await expect(page.getByRole("link", { name: "Devy", exact: true })).toBeHidden()
    const open = await captureToggle(page, "사이드바 펼치기")
    await expect(page.getByRole("link", { name: "Devy", exact: true })).toBeVisible()
    for (const frames of [close, open]) {
      expect(new Set(frames.map(frame => Math.round(frame.width))).size).toBeGreaterThan(3)
      const tops = frames.map(frame => frame.searchTop)
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1)
      for (const frame of frames) {
        expect(frame.triggerRightOffset).toBeGreaterThanOrEqual(7)
        expect(frame.triggerRightOffset).toBeLessThanOrEqual(10)
        expect(frame.footerLeft).toBeGreaterThanOrEqual(0)
        expect(frame.footerRight).toBeLessThanOrEqual(1.5)
        expect(frame.contentOpacity).toBe(1)
      }
    }
  })
}

test("rapid keyboard toggles settle in the requested state", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "사이드바 접기", exact: true })).toBeEnabled()
  await page.keyboard.press("Control+b")
  await expect(page.getByRole("button", { name: "사이드바 펼치기", exact: true })).toBeVisible()
  await page.keyboard.press("Control+b")
  await expect(page.getByRole("button", { name: "사이드바 접기", exact: true })).toBeVisible()
  await expect.poll(() => page.locator('[data-slot="sidebar-container"]').evaluate(el => el.getBoundingClientRect().width)).toBe(256)
  await expect(page.getByRole("link", { name: "Devy", exact: true })).toBeVisible()
})

test("reduced motion collapses directly and keeps controls keyboard accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page.getByRole("button", { name: "사이드바 접기", exact: true }).click()
  await expect.poll(() => page.locator('[data-slot="sidebar-container"]').evaluate(el => el.getBoundingClientRect().width)).toBe(48)
  await expect(page.getByRole("link", { name: "Devy", exact: true })).toBeHidden()
  await page.getByRole("button", { name: "사이드바 펼치기", exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("button", { name: "사이드바 접기", exact: true })).toBeFocused()
})
