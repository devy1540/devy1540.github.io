import type { MermaidConfig } from "mermaid"
import { createRetryableLoader } from "./async-loader"
import { createRenderQueue } from "./render-queue"
import { getMermaidTheme } from "./mermaid-theme"

const loadMermaid = createRetryableLoader(() => import("mermaid"))
let sequence = 0

const request = createRenderQueue(async ({ code, config }: { code: string; config: MermaidConfig }) => {
  const { default: mermaid } = await loadMermaid()
  mermaid.initialize({ ...config, themeVariables: { ...config.themeVariables }, startOnLoad: false, securityLevel: "strict", flowchart: { htmlLabels: false } })
  const { svg } = await mermaid.render(`mermaid_render_${++sequence}`, code)
  return svg
})

export function requestMermaidRender(code: string, themeKey: string) {
  return request(`${themeKey}\0${code}`, { code, config: getMermaidTheme(themeKey) })
}
