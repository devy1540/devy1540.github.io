import { test, expect, type Locator, type Page } from "@playwright/test"

type Language = "ko" | "en"
const languages: Language[] = ["ko", "en"]
const articlePath = "/posts/i18n-01-foundation/"
const localized = (path: string, language: Language) => language === "en" ? `/en${path}` : path

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" })
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
  await page.addInitScript(() => {
    if (window.top !== window) return
    localStorage.setItem("theme", "light")
    localStorage.setItem("language", location.pathname.startsWith("/en/") ? "en" : "ko")
  })
})

async function setSidebar(page: Page, language: Language, collapsed: boolean) {
  const sidebar = page.locator('[data-slot="sidebar"]').first()
  const state = collapsed ? "collapsed" : "expanded"
  if (await sidebar.getAttribute("data-state") !== state) {
    await page.getByRole("button", {
      name: language === "ko" ? collapsed ? "사이드바 접기" : "사이드바 펼치기" : collapsed ? "Collapse sidebar" : "Expand sidebar",
      exact: true,
    }).click()
  }
  await expect(sidebar).toHaveAttribute("data-state", state)
  await expect.poll(() => page.locator('[data-slot="sidebar-container"]').evaluate(el => el.getBoundingClientRect().width)).toBe(collapsed ? 48 : 256)
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

async function expectInside(container: Locator, children: Locator) {
  const bounds = await container.boundingBox()
  expect(bounds).not.toBeNull()
  const items = await children.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { text: element.textContent?.trim(), x: rect.x, right: rect.right, width: rect.width }
  }))
  expect(items.length).toBeGreaterThan(0)
  for (const item of items) {
    expect(item.width, item.text).toBeGreaterThan(0)
    expect(item.x, item.text).toBeGreaterThanOrEqual(bounds!.x - 1)
    expect(item.right, item.text).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1)
  }
}

for (const language of languages) {
  test(`desktop reader keeps its center while expanding to 912px: ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 1792, height: 1000 })
    await page.goto(localized(articlePath, language))
    await expect(page.locator(".post-toc-panel")).toBeVisible()
    for (const collapsed of [false, true]) {
      await setSidebar(page, language, collapsed)
      const { layout, article, toc, sidebar } = await page.evaluate(() => {
        const rect = (selector: string) => {
          const bounds = document.querySelector(selector)!.getBoundingClientRect()
          return { x: bounds.x, width: bounds.width }
        }
        return { layout: rect(".post-page-layout"), article: rect("article"), toc: rect(".post-toc-layer"), sidebar: rect('[data-slot="sidebar-container"]') }
      })
      expect(layout!.width).toBeCloseTo(1152, 0)
      expect(article!.width).toBeCloseTo(912, 0)
      expect(toc!.width).toBeCloseTo(208, 0)
      expect(toc!.x - article!.x - article!.width).toBeCloseTo(32, 0)
      expect(sidebar!.width).toBe(collapsed ? 48 : 256)
      expect(layout!.x + layout!.width / 2).toBeCloseTo(collapsed ? 920 : 1024, 0)
      expect(article!.x + article!.width / 2).toBeCloseTo(collapsed ? 800 : 904, 0)
      await expectNoHorizontalOverflow(page)
    }
  })

  for (const width of [1024, 1100]) {
    test(`tag and series names remain readable beside metadata at ${width}px: ${language}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      for (const path of ["/tags/", "/series/"]) {
        await page.goto(localized(path, language))
        await expect(page.locator("main h1")).toBeVisible()
        for (const collapsed of [false, true]) {
          await setSidebar(page, language, collapsed)
          const rows = page.locator(`main a[href*="${path}"]:has(> time[datetime])`)
          const measurements = await rows.evaluateAll(elements => elements.map(row => {
            const rect = row.getBoundingClientRect()
            const nameColumn = row.children[0]!
            const name = nameColumn.querySelector(".truncate")!
            const nameRect = name.getBoundingClientRect()
            const nameStyle = getComputedStyle(name)
            return {
              name: name.textContent,
              nameColumnWidth: nameColumn.getBoundingClientRect().width,
              nameHeight: nameRect.height,
              fontSize: parseFloat(nameStyle.fontSize),
              lineHeight: parseFloat(nameStyle.lineHeight),
              children: Array.from(row.children).map(child => {
                const bounds = child.getBoundingClientRect()
                return { text: child.textContent?.trim(), left: bounds.left - rect.left, right: bounds.right - rect.right, overflow: child.scrollWidth > child.clientWidth + 1 }
              }),
            }
          }))
          expect(measurements.length).toBeGreaterThan(0)
          for (const row of measurements) {
            expect(row.nameColumnWidth, row.name ?? "name column").toBeGreaterThanOrEqual(80)
            expect(row.nameHeight, row.name ?? "name height").toBeGreaterThanOrEqual(row.fontSize * .8)
            expect(row.nameHeight, row.name ?? "name height").toBeLessThanOrEqual(row.lineHeight + 1)
            for (const child of row.children) {
              expect(child.left, child.text).toBeGreaterThanOrEqual(-1)
              expect(child.right, child.text).toBeLessThanOrEqual(1)
              expect(child.overflow, child.text).toBe(false)
            }
          }
          await expectNoHorizontalOverflow(page)
        }
      }
    })
  }

  test(`tablet profile controls and analytics values stay inside their containers: ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1000 })
    const fixture = {
      totalViews: 9876543,
      pages: Object.fromEntries(languages.flatMap(locale => [
        [localized("/posts/i18n-01-foundation", locale), 1234567],
        [localized("/posts/i18n-04-backend-locale", locale), 765432],
        [localized("/posts/react-hooks-deep-dive", locale), 456789],
      ])),
      daily: Array.from({ length: 35 }, (_, index) => ({ date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10), views: 123456 + index })),
      lastUpdated: new Date().toISOString(),
    }
    await page.route("https://script.google.com/**", route => route.fulfill({ json: fixture }))
    await page.addInitScript(data => {
      if (window.top !== window) return
      sessionStorage.setItem("page-views", JSON.stringify(data))
      sessionStorage.setItem("page-views-ts", String(Date.now()))
    }, fixture)
    for (const collapsed of [false, true]) {
      await page.goto(localized("/about/", language))
      await setSidebar(page, language, collapsed)
      const container = page.locator("main .page-container")
      const profile = container.locator(":scope > div").first()
      await expectInside(container, profile.locator('[data-slot="button"], a[href^="mailto:"], a[href^="tel:"]'))
      await expectNoHorizontalOverflow(page)

      await page.goto(localized("/analytics/", language))
      await expect(page.locator('main [data-slot="card"]').first()).toContainText("9,876,543")
      const cards = page.locator('main [data-slot="card-content"]')
      const violations = await cards.evaluateAll(elements => elements.flatMap(content => {
        const bounds = content.getBoundingClientRect()
        const violations: string[] = []
        for (const element of Array.from(content.querySelectorAll("p, a, span"))) {
          if (element.closest(".recharts-wrapper") || !element.getClientRects().length) continue
          const rect = element.getBoundingClientRect()
          const label = element.textContent?.trim() ?? element.tagName
          if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) violations.push(`element outside card: ${label}`)
          if (getComputedStyle(element).overflowX === "hidden") continue
          for (const node of Array.from(element.childNodes)) {
            if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue
            const range = document.createRange()
            range.selectNode(node)
            for (const textRect of Array.from(range.getClientRects())) if (textRect.left < bounds.left - 1 || textRect.right > bounds.right + 1) violations.push(`text outside card: ${label}`)
          }
        }
        return violations
      }))
      expect(violations).toEqual([])
      await expectNoHorizontalOverflow(page)
    }
  })

  for (const width of [390, 768, 1279]) {
    for (const collapsed of width === 1279 ? [false, true] : [false]) {
      test(`article title is stable from styled SSR through hydration at ${width}px, ${collapsed ? "collapsed" : "expanded"}: ${language}`, async ({ page, context }) => {
        await page.setViewportSize({ width, height: 1000 })
        await context.addCookies([{ name: "sidebar_state", value: String(!collapsed), url: "http://127.0.0.1:4173/" }])
        const errors: string[] = []
        page.on("pageerror", error => errors.push(error.message))
        page.on("console", message => { if (/hydration|React error #418/i.test(message.text())) errors.push(message.text()) })
        let releaseScripts!: () => void
        const scriptsReleased = new Promise<void>(resolve => { releaseScripts = resolve })
        await page.route("**/assets/**", async route => {
          if (route.request().resourceType() === "script") await scriptsReleased
          return route.continue()
        })
        await page.goto(localized(articlePath, language), { waitUntil: "commit" })
        const title = page.locator("article h1")
        await expect(title).toBeVisible()
        await expect.poll(() => page.locator("#main-content").evaluate(el => getComputedStyle(el).paddingTop)).toBe("32px")
        const before = await title.boundingBox()
        const titleText = await title.textContent()
        await page.evaluate(() => {
          const state = window as unknown as Window & { titleFrames: { x: number; y: number; width: number; height: number }[]; stopTitleSampling: boolean }
          state.titleFrames = []
          state.stopTitleSampling = false
          const sample = () => {
            const rect = document.querySelector("article h1")!.getBoundingClientRect()
            state.titleFrames.push({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
            if (!state.stopTitleSampling) requestAnimationFrame(sample)
          }
          sample()
        })
        releaseScripts()
        await expect(page.locator(".post-toc-panel a").first()).toBeAttached()
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
        const frames = await page.evaluate(() => {
          const state = window as unknown as Window & { titleFrames: { x: number; y: number; width: number; height: number }[]; stopTitleSampling: boolean }
          state.stopTitleSampling = true
          return state.titleFrames
        })
        expect(frames.length).toBeGreaterThan(1)
        for (const frame of frames) for (const axis of ["x", "y", "width", "height"] as const) expect(frame[axis], `${axis} during hydration`).toBeCloseTo(before![axis], 0)
        await expect(title).toHaveText(titleText!)
        expect(errors).toEqual([])
        await expectNoHorizontalOverflow(page)
      })
    }
  }
}
