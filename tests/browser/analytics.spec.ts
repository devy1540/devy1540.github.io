import { test, expect } from "@playwright/test"

test("analytics uses the browser fetch and updates counts after refresh", async ({ page }) => {
  let apiRequests = 0
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") {
      apiRequests++
      return route.fulfill({ json: {
        success: true,
        totalViews: apiRequests === 1 ? 6071 : 6072,
        pages: { "/posts/odin-ax-transformation": 95 },
        daily: [],
        meta: { cachedAt: "2026-10-06T06:54:29Z", source: "ga4" },
      } })
    }
    return route.abort()
  })

  await page.goto("/analytics/")
  await expect(page.getByText("6,071", { exact: true })).toBeVisible()
  await expect(page.getByText("조회수 데이터를 불러올 수 없습니다", { exact: true })).toBeHidden()
  expect(apiRequests).toBe(1)

  await page.getByRole("button", { name: "새로고침", exact: true }).click()
  await expect(page.getByText("6,072", { exact: true })).toBeVisible()
  await expect(page.getByText("조회수 데이터를 불러올 수 없습니다", { exact: true })).toBeHidden()
  expect(apiRequests).toBe(2)
})
