import { test, expect } from "@playwright/test"

declare global {
  interface Window { observedMermaidIds: string[]; persistedSidebarWidths: number[] }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ colorScheme: "light" })
  await page.route("**/*", route => {
    const url = new URL(route.request().url())
    if (url.hostname === "127.0.0.1") return route.continue()
    if (url.hostname === "script.google.com") return route.fulfill({ json: { totalViews: 8, pages: {}, daily: [] } })
    return route.abort()
  })
  await page.addInitScript(() => {
    if (window.top !== window) return
    localStorage.setItem("theme", "light")
    window.observedMermaidIds = []
    const seen = new Set<string>()
    new MutationObserver(records => {
      for (const record of records) for (const node of Array.from(record.addedNodes)) {
        if (!(node instanceof Element)) continue
        const svgs = node.matches('svg[id^="mermaid_render_"]') ? [node] : Array.from(node.querySelectorAll('svg[id^="mermaid_render_"]'))
        for (const svg of svgs) if (!seen.has(svg.id)) { seen.add(svg.id); window.observedMermaidIds.push(svg.id) }
      }
    }).observe(document, { childList: true, subtree: true })
  })
})

test("each diagram renders once per theme and cached SVGs retain unique working references", async ({ page }) => {
  await page.goto("/posts/ecs-to-eks-migration/")
  const diagrams = page.getByRole("button", { name: "다이어그램 확대", exact: true })
  await expect(diagrams).toHaveCount(7)
  await expect.poll(() => diagrams.locator("svg").count()).toBe(7)
  expect(await page.evaluate(() => window.observedMermaidIds.length)).toBe(7)
  await page.getByRole("button", { name: "테마 변경", exact: true }).click()
  await page.getByRole("menuitemcheckbox", { name: "다크", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect.poll(() => page.evaluate(() => window.observedMermaidIds.length)).toBe(14)
  await expect.poll(() => page.locator('body > [id^="dmermaid_render_"]').count()).toBe(0)
  await page.getByRole("button", { name: "테마 변경", exact: true }).click()
  await page.getByRole("menuitemcheckbox", { name: "라이트", exact: true }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  await expect.poll(() => diagrams.locator("svg").count()).toBe(7)
  await diagrams.first().click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.locator('svg[id^="diagram-"]')).toBeVisible()
  const validity = await page.locator('svg[id^="diagram-"]').evaluateAll(svgs => {
    const globalIds = svgs.flatMap(svg => [svg.id, ...Array.from(svg.querySelectorAll("[id]")).map(el => el.id)])
    const invalid: string[] = []
    for (const svg of svgs) {
      const ids = new Set([svg.id, ...Array.from(svg.querySelectorAll("[id]")).map(el => el.id)])
      for (const element of [svg, ...Array.from(svg.querySelectorAll("*"))]) for (const attr of Array.from(element.attributes)) {
        for (const match of attr.value.matchAll(/url\(#([^)]*)\)/g)) if (!ids.has(match[1]!)) invalid.push(match[1]!)
      }
    }
    return { unique: new Set(globalIds).size === globalIds.length, invalid }
  })
  expect(validity).toEqual({ unique: true, invalid: [] })
  expect(await page.evaluate(() => window.observedMermaidIds.length)).toBe(14)
  await page.keyboard.press("Escape")
  await expect(diagrams.first()).toBeFocused()
})

test("code remains readable while only nearby blocks are highlighted and Mermaid stays unloaded", async ({ page }) => {
  const scripts: string[] = []
  page.on("request", request => { if (request.resourceType() === "script") scripts.push(request.url()) })
  await page.goto("/posts/react-hooks-deep-dive/")
  const blocks = page.locator("article pre")
  await expect(blocks).toHaveCount(13)
  await expect(page.getByRole("button", { name: "코드 복사", exact: true })).toHaveCount(13)
  await expect.poll(() => page.locator("article .shiki").count()).toBeGreaterThan(0)
  expect(await page.locator("article .shiki").count()).toBeLessThan(13)
  expect(scripts.some(url => /MermaidBlock|mermaid-renderer/.test(url))).toBe(false)
  await blocks.last().scrollIntoViewIfNeeded()
  await expect(blocks.last()).toHaveClass(/shiki/)
})

test("saved collapsed state is visible from the first styled frame and hydrates without errors", async ({ page, context }) => {
  await context.addCookies([{ name: "sidebar_state", value: "false", url: "http://127.0.0.1:4173/" }])
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  page.on("console", message => { if (/hydration|React error #418/i.test(message.text())) errors.push(message.text()) })
  await page.addInitScript(() => {
    window.persistedSidebarWidths = []
    const start = performance.now()
    const sample = () => {
      const panel = document.querySelector('[data-slot="sidebar-container"]')
      if (panel && getComputedStyle(panel).position === "fixed") window.persistedSidebarWidths.push(panel.getBoundingClientRect().width)
      if (performance.now() - start < 1200) requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  await page.goto("/posts/odin-ax-transformation/")
  await expect(page.getByRole("button", { name: "사이드바 펼치기", exact: true })).toBeEnabled()
  await expect.poll(() => page.evaluate(() => window.persistedSidebarWidths.length)).toBeGreaterThan(3)
  expect(await page.evaluate(() => Math.max(...window.persistedSidebarWidths))).toBeLessThanOrEqual(49)
  await page.reload()
  await expect(page.getByRole("button", { name: "사이드바 펼치기", exact: true })).toBeEnabled()
  await page.getByRole("button", { name: "사이드바 펼치기", exact: true }).click()
  await page.reload()
  await expect(page.getByRole("button", { name: "사이드바 접기", exact: true })).toBeEnabled()
  expect(errors).toEqual([])
})

test("comments update theme without recreating the iframe and follow the next article", async ({ page }) => {
  let iframeLoads = 0
  await page.route("https://giscus.app/**", route => {
    iframeLoads++
    return route.fulfill({ contentType: "text/html", body: '<div id="config"></div><script>addEventListener("message",function(e){if(e.data.giscus&&e.data.giscus.setConfig){document.getElementById("config").setAttribute("data-theme",e.data.giscus.setConfig.theme)}})</script>' })
  })
  await page.goto("/posts/odin-ax-transformation/")
  const widget = page.locator("giscus-widget")
  await expect(widget).toBeAttached()
  await widget.scrollIntoViewIfNeeded()
  const iframe = widget.locator("iframe")
  await expect(iframe).toBeAttached()
  await expect.poll(() => iframeLoads).toBe(1)
  await iframe.evaluate(el => el.setAttribute("data-persistent-frame", "yes"))
  await page.getByRole("button", { name: "테마 변경", exact: true }).click()
  await page.getByRole("menuitemcheckbox", { name: "다크", exact: true }).click()
  await expect.poll(() => widget.evaluate(el => (el as HTMLElement & { theme: string }).theme)).toBe("dark")
  await expect(iframe).toHaveAttribute("data-persistent-frame", "yes")
  await expect(page.frameLocator("giscus-widget iframe").locator("#config")).toHaveAttribute("data-theme", "dark")
  expect(iframeLoads).toBe(1)
  await page.getByRole("link", { name: "홈", exact: true }).click()
  await page.locator('main a[href="/posts/spring-ai-cs-automation/"]').click()
  await expect(widget).toBeAttached()
  await widget.scrollIntoViewIfNeeded()
  await expect(widget.locator("iframe")).not.toHaveAttribute("data-persistent-frame", "yes")
  await expect.poll(async () => new URL((await widget.locator("iframe").getAttribute("src"))!).searchParams.get("term")).toBe("posts/spring-ai-cs-automation/")
})
