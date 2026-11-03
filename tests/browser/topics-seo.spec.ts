import { expect, test } from "@playwright/test"

const origin = "https://dev.devy.dev"
test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
})

const staticPaths = ["", "posts/", "tags/", "series/", "analytics/", "about/", "privacy/"]
const topicPaths = ["topics/", "topics/authentication/", "topics/spring-ai/", "topics/cloud-migration/"]
const detailPaths = ["posts/backend-owned-login-flow/", "about/projects/payment-system/"]
const paths = ["", "/en"].flatMap(prefix => [...staticPaths, ...topicPaths, ...detailPaths].map(path => `${prefix}/${path}`))
paths.push("/en/posts/aws-to-gcp-migration/", "/en/posts/odin-ax-transformation/")

for (const path of paths) {
  test(`initial metadata survives hydration: ${path}`, async ({ page, request }) => {
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("console", message => { if (message.type() === "error" && /hydration|did not match|server rendered/i.test(message.text())) errors.push(message.text()) })
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    const raw = await response.text()
    await page.goto(path)
    await expect(page.getByRole("button", { name: /글 검색|Search Posts/, exact: true })).toBeEnabled()
    const metadata = await page.evaluate(html => {
      const initial = new DOMParser().parseFromString(html, "text/html")
      function snapshot(doc: Document) {
        return {
          title: doc.title,
          lang: doc.documentElement.lang,
          canonical: Array.from(doc.querySelectorAll('link[rel="canonical"]')).map(node => node.getAttribute("href")),
          meta: Array.from(doc.querySelectorAll('meta[data-seo="true"]')).map(node => [node.getAttribute("name") || node.getAttribute("property"), node.getAttribute("content")]).sort(),
          alternates: Array.from(doc.querySelectorAll('link[hreflang]')).map(node => [node.getAttribute("hreflang"), node.getAttribute("href")]).sort(),
          feed: doc.querySelector('link[type="application/rss+xml"]')?.getAttribute("href"),
        }
      }
      return { initial: snapshot(initial), hydrated: snapshot(document) }
    }, raw)
    expect(metadata.hydrated).toEqual(metadata.initial)
    const canonicalPath = /\/en\/posts\/(aws-to-gcp-migration|odin-ax-transformation)\//.test(path) ? path.slice(3) : path
    expect(metadata.hydrated.canonical).toEqual([`${origin}${canonicalPath}`])
    expect(errors).toEqual([])
  })
}

test("home, topic, article, language switch, and Back retain one current set of metadata", async ({ page }) => {
  await page.goto("/")
  await page.locator('main a[href="/topics/authentication/"]').first().click()
  await expect(page).toHaveURL(/\/topics\/authentication\/$/)
  await page.locator('main a[href="/posts/backend-owned-login-flow/"]').first().click()
  await expect(page).toHaveURL(/\/posts\/backend-owned-login-flow\/$/)
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `${origin}/posts/backend-owned-login-flow/`)
  await expect(page.locator('head meta[property="article:published_time"]')).toHaveCount(1)
  await page.goBack()
  await expect(page.locator('head meta[property="article:published_time"]')).toHaveCount(0)
  await page.getByRole("button", { name: "언어 변경", exact: true }).click()
  await page.getByRole("menuitemcheckbox", { name: "English", exact: true }).click()
  await expect(page).toHaveURL(/\/en\/topics\/authentication\/$/)
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `${origin}/en/topics/authentication/`)
  await expect(page.locator('head link[hreflang]')).toHaveCount(3)
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.locator('main a[href="/en/posts/backend-owned-login-flow/"]')).toBeVisible()
})

test("topic guides reflow on a narrow screen and unknown topics stay excluded from search", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/topics/spring-ai/")
  await expect(page.getByRole("heading", { name: "Spring AI 적용과 운영", exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const response = await page.goto("/topics/missing-topic/")
  expect(response?.status()).toBe(404)
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
  expect(await page.locator('script[type="application/ld+json"]').count()).toBe(0)
})
