import { test, expect } from "@playwright/test"

const footerLabels = ["테마 변경", "색상 테마 변경", "언어 변경", "블로그 정보 더보기"]

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
})

for (const collapsed of [false, true]) {
  test(`all icon buttons show tooltips on hover: ${collapsed ? "collapsed" : "expanded"}`, async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("button", { name: "사이드바 접기", exact: true })).toBeEnabled()
    if (collapsed) {
      await page.getByRole("button", { name: "사이드바 접기", exact: true }).click()
      await expect.poll(() => page.locator('[data-slot="sidebar-container"]').evaluate(el => el.getBoundingClientRect().width)).toBe(48)
    }

    const labels = [collapsed ? "사이드바 펼치기" : "사이드바 접기", ...footerLabels]
    for (const label of labels) {
      await page.getByRole("button", { name: label, exact: true }).hover()
      const tooltip = page.getByRole("tooltip", { name: label, exact: true })
      await expect(tooltip).toHaveText(label)
      await expect(page.locator('[data-slot="tooltip-content"]').filter({ has: tooltip })).toHaveAttribute("data-side", label.startsWith("사이드바") || collapsed ? "right" : "top")
      await page.mouse.move(900, 300, { steps: 8 })
      await expect(tooltip).toBeHidden()
    }

    await page.getByRole("link", { name: "홈", exact: true }).hover()
    if (collapsed) await expect(page.getByRole("tooltip")).toHaveText("홈")
    else await expect(page.getByRole("tooltip")).toBeHidden()
  })
}

test("tooltip composition preserves menu triggers and returns keyboard focus", async ({ page }) => {
  await page.goto("/")
  for (const label of footerLabels) {
    const trigger = page.getByRole("button", { name: label, exact: true })
    await trigger.focus()
    const tooltip = page.getByRole("tooltip", { name: label, exact: true })
    await expect(tooltip).toHaveText(label)
    await page.keyboard.press("Enter")
    const popup = page.getByRole("menu")
    await expect(popup).toBeVisible()
    await expect(tooltip).toBeHidden()
    await page.keyboard.press("Escape")
    await expect(popup).toBeHidden()
    await expect(trigger).toBeFocused()
  }
})
