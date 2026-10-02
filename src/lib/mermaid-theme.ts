import type { MermaidConfig } from "mermaid"
import { RenderCache } from "./render-cache"

const themes = new RenderCache<MermaidConfig>(16)

function readThemeColors() {
  const variables = ["--primary", "--foreground", "--background", "--muted", "--muted-foreground", "--border"]
  const container = document.createElement("div")
  container.style.cssText = "position:absolute;visibility:hidden;pointer-events:none"
  const probes = variables.map(variable => {
    const probe = document.createElement("span")
    probe.style.color = `var(${variable})`
    container.appendChild(probe)
    return probe
  })
  document.body.appendChild(container)
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const context = canvas.getContext("2d")!
  try {
    return Object.fromEntries(variables.map((variable, index) => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = getComputedStyle(probes[index]!).color
      context.fillRect(0, 0, 1, 1)
      const pixel = context.getImageData(0, 0, 1, 1).data
      const hex = Array.from(pixel.slice(0, 3)).map(value => value.toString(16).padStart(2, "0")).join("")
      return [variable, `#${hex}`]
    }))
  } finally { container.remove() }
}

export function getMermaidTheme(key: string): MermaidConfig {
  const saved = themes.get(key)
  if (saved) return saved
  const theme = buildMermaidTheme(key)
  themes.set(key, theme, JSON.stringify(theme).length * 2)
  return theme
}

function blendHex(a: string, b: string, ratio: number): string {
  const parse = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const mix = (i: number) => Math.round(parse(a, i) + (parse(b, i) - parse(a, i)) * ratio)
  return "#" + [0, 1, 2].map(i => mix(i).toString(16).padStart(2, "0")).join("")
}

function buildMermaidTheme(key: string) {
  const isDark = key.startsWith("dark:")
  const colors = readThemeColors()
  const primary = colors["--primary"]!
  const fg = colors["--foreground"]!
  const bg = colors["--background"]!
  const muted = colors["--muted"]!
  const mutedFg = colors["--muted-foreground"]!
  const border = colors["--border"]!

  const nodeBg = isDark ? blendHex(primary, bg, 0.6) : blendHex(primary, bg, 0.85)
  const nodeBorder = primary
  const clusterBg = isDark ? blendHex(bg, primary, 0.05) : blendHex(bg, primary, 0.03)

  return {
    theme: "base" as const,
    themeVariables: {
      primaryColor: nodeBg,
      primaryTextColor: fg,
      primaryBorderColor: nodeBorder,
      secondaryColor: muted,
      secondaryTextColor: fg,
      secondaryBorderColor: border,
      tertiaryColor: isDark ? blendHex(primary, bg, 0.7) : blendHex(primary, bg, 0.9),
      lineColor: mutedFg,
      textColor: fg,
      mainBkg: nodeBg,
      nodeBorder: nodeBorder,
      clusterBkg: clusterBg,
      clusterBorder: border,
      titleColor: fg,
      edgeLabelBackground: bg,
      nodeTextColor: fg,
      actorBkg: nodeBg,
      actorBorder: nodeBorder,
      actorTextColor: fg,
      actorLineColor: mutedFg,
      signalColor: fg,
      signalTextColor: fg,
      noteBkgColor: isDark ? "#422006" : "#fefce8",
      noteTextColor: isDark ? "#fef9c3" : "#713f12",
      noteBorderColor: isDark ? "#854d0e" : "#fde047",
      activationBkgColor: nodeBg,
      activationBorderColor: nodeBorder,
      sequenceNumberColor: bg,
      sectionBkgColor: nodeBg,
      altSectionBkgColor: muted,
      gridColor: border,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: "15px",
    },
  }
}
