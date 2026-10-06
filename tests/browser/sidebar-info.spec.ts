import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
})

for (const scenario of [
  { path: "/", collapsed: false, collapse: "사이드바 접기", more: "블로그 정보 더보기", policy: "개인정보처리방침", destination: "/privacy/" },
  { path: "/en/", collapsed: true, collapse: "Collapse sidebar", more: "More blog information", policy: "Privacy Policy", destination: "/en/privacy/" },
]) {
  test(`information menu supports keyboard, focus return and policy navigation: ${scenario.path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(scenario.path)
    await expect(page.getByRole("button", { name: scenario.collapse, exact: true })).toBeEnabled()
    if (scenario.collapsed) {
      await page.getByRole("button", { name: scenario.collapse, exact: true }).click()
      await expect.poll(() => page.locator('[data-slot="sidebar-container"]').evaluate(el => el.getBoundingClientRect().width)).toBe(48)
    }
    const trigger = page.getByRole("button", { name: scenario.more, exact: true })
    await trigger.focus()
    await page.keyboard.press("Enter")
    const menu = page.getByRole("menu", { name: scenario.more, exact: true })
    await expect(menu).toBeVisible()
    await expect(menu).toContainText("Devy")
    const policy = menu.getByRole("menuitem", { name: scenario.policy, exact: true })
    await expect(policy).toHaveAttribute("href", scenario.destination)
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
    await page.keyboard.press("Enter")
    await page.keyboard.press("ArrowDown")
    await expect(policy).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(new RegExp(`${scenario.destination}$`))
    await expect(page.locator("main h1")).toHaveText(scenario.policy)
    await expect(menu).toBeHidden()
    await expect(page.getByRole("contentinfo")).toHaveCount(0)
  })
}

test("mobile information menu has a touch target, preserves the drawer on Escape and closes it on navigation", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto("/")
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click()
  const drawer = page.getByRole("dialog")
  const trigger = drawer.getByRole("button", { name: "블로그 정보 더보기", exact: true })
  const box = await trigger.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
  await trigger.click()
  const menu = page.getByRole("menu", { name: "블로그 정보 더보기", exact: true })
  await expect(menu).toBeVisible()
  await expect(menu).toContainText("Devy")
  await page.keyboard.press("Escape")
  await expect(menu).toBeHidden()
  await expect(drawer).toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await menu.getByRole("menuitem", { name: "개인정보처리방침", exact: true }).click()
  await expect(page).toHaveURL(/\/privacy\/$/)
  await expect(drawer).toBeHidden()
  await expect(menu).toBeHidden()
  await expect(page.locator("main h1")).toHaveText("개인정보처리방침")
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})
