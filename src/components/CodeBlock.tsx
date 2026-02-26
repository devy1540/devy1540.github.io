import { type ComponentPropsWithoutRef, useCallback, useEffect, useId, useRef, useState } from "react"
import { codeToHtml } from "shiki"
import { Copy, Check } from "lucide-react"
import { useT } from "@/i18n"
import { useTheme } from "@/hooks/useTheme"
import mermaid from "mermaid"

function getCssHex(varName: string): string {
  const temp = document.createElement("div")
  temp.style.color = `var(${varName})`
  document.body.appendChild(temp)
  const computed = getComputedStyle(temp).color
  temp.remove()

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return "#" + [rgbMatch[1], rgbMatch[2], rgbMatch[3]]
      .map(n => parseInt(n!).toString(16).padStart(2, "0")).join("")
  }

  // color(srgb r g b) — values 0-1
  const srgbMatch = computed.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (srgbMatch) {
    return "#" + [srgbMatch[1], srgbMatch[2], srgbMatch[3]]
      .map(n => Math.round(parseFloat(n!) * 255).toString(16).padStart(2, "0")).join("")
  }

  // Fallback: draw on canvas to resolve any color format
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = computed
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return "#" + [d[0]!, d[1]!, d[2]!].map(n => n.toString(16).padStart(2, "0")).join("")
}

function blendHex(a: string, b: string, ratio: number): string {
  const parse = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const mix = (i: number) => Math.round(parse(a, i) + (parse(b, i) - parse(a, i)) * ratio)
  return "#" + [0, 1, 2].map(i => mix(i).toString(16).padStart(2, "0")).join("")
}

function buildMermaidTheme(isDark: boolean) {
  const primary = getCssHex("--primary")
  const fg = getCssHex("--foreground")
  const bg = getCssHex("--background")
  const muted = getCssHex("--muted")
  const mutedFg = getCssHex("--muted-foreground")
  const border = getCssHex("--border")

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

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, "_")
  const { resolvedTheme } = useTheme()
  const [colorKey, setColorKey] = useState(0)

  useEffect(() => {
    const observer = new MutationObserver(() => setColorKey(k => k + 1))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-color", "class"] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current || !code) return

    const config = buildMermaidTheme(resolvedTheme === "dark")
    mermaid.initialize({ startOnLoad: false, securityLevel: "loose", ...config })

    const el = containerRef.current
    el.innerHTML = ""

    mermaid.render(`mermaid${id}_${resolvedTheme}`, code).then(({ svg }) => {
      el.innerHTML = svg
      const svgEl = el.querySelector("svg")
      if (svgEl) {
        svgEl.removeAttribute("height")
        svgEl.style.width = "100%"
        svgEl.style.maxWidth = "100%"

        // Rounded corners on all rect nodes
        svgEl.querySelectorAll("rect.basic, rect.label-container, .node rect, .cluster rect").forEach((rect) => {
          rect.setAttribute("rx", "8")
          rect.setAttribute("ry", "8")
        })

        // Thicker edges
        svgEl.querySelectorAll(".edge-pattern-solid, .flowchart-link, path.path").forEach((path) => {
          path.setAttribute("stroke-width", "2")
        })

        // Drop shadow filter
        const defs = svgEl.querySelector("defs") ?? svgEl.insertBefore(document.createElementNS("http://www.w3.org/2000/svg", "defs"), svgEl.firstChild)
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
        filter.setAttribute("id", `shadow_${id}`)
        filter.innerHTML = `<feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08" />`
        defs.appendChild(filter)
        svgEl.querySelectorAll(".node rect, .node polygon, .node circle, .cluster rect").forEach((node) => {
          node.setAttribute("filter", `url(#shadow_${id})`)
        })
      }
    }).catch(() => {
      el.textContent = code
    })
  }, [code, id, resolvedTheme, colorKey])

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-white px-4 py-8 overflow-x-auto shadow-sm dark:bg-zinc-950">
      <div ref={containerRef} className="w-full" />
    </div>
  )
}

function ShikiBlock({ code, language, children, preProps }: { code: string; language: string; children: React.ReactNode; preProps: ComponentPropsWithoutRef<"pre"> }) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const t = useT()

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  useEffect(() => {
    if (!code) return

    codeToHtml(code, {
      lang: language || "text",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    }).then((html) => {
      setHighlightedHtml(html)
    })
  }, [code, language])

  return (
    <div className="not-prose my-5 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {language && (
            <span className="text-xs text-muted-foreground">{language}</span>
          )}
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t.components.copyCode}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
      {highlightedHtml ? (
        <div
          className="[&>pre]:m-0 [&>pre]:rounded-none [&>pre]:border-0 [&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre
          {...preProps}
          className="m-0 rounded-none border-0 bg-secondary text-secondary-foreground overflow-x-auto p-4 text-sm"
        >
          {children}
        </pre>
      )}
    </div>
  )
}

export function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const codeEl = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
  const className = codeEl?.props?.className || ""
  const match = className.match(/language-(\w+)/)
  const language = match?.[1] ?? ""
  const code = (typeof codeEl?.props?.children === "string"
    ? codeEl.props.children
    : ""
  ).replace(/\n$/, "")

  if (language === "mermaid") {
    return <MermaidBlock code={code} />
  }

  return <ShikiBlock code={code} language={language} preProps={props}>{children}</ShikiBlock>
}
