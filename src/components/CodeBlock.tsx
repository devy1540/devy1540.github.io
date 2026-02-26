import { type ComponentPropsWithoutRef, useCallback, useEffect, useId, useRef, useState } from "react"
import { codeToHtml } from "shiki"
import { Copy, Check } from "lucide-react"
import { useT } from "@/i18n"
import { useTheme } from "@/hooks/useTheme"
import mermaid from "mermaid"

const MERMAID_LIGHT = {
  theme: "base" as const,
  themeVariables: {
    primaryColor: "#f4f4f5",
    primaryTextColor: "#18181b",
    primaryBorderColor: "#d4d4d8",
    secondaryColor: "#fafafa",
    secondaryTextColor: "#3f3f46",
    secondaryBorderColor: "#e4e4e7",
    tertiaryColor: "#f4f4f5",
    lineColor: "#a1a1aa",
    textColor: "#27272a",
    mainBkg: "#f4f4f5",
    nodeBorder: "#d4d4d8",
    clusterBkg: "#fafafa",
    clusterBorder: "#e4e4e7",
    titleColor: "#18181b",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#18181b",
    actorBkg: "#f4f4f5",
    actorBorder: "#d4d4d8",
    actorTextColor: "#18181b",
    actorLineColor: "#a1a1aa",
    signalColor: "#18181b",
    signalTextColor: "#18181b",
    noteBkgColor: "#fef9c3",
    noteTextColor: "#713f12",
    noteBorderColor: "#fde047",
    activationBkgColor: "#e4e4e7",
    activationBorderColor: "#a1a1aa",
    sequenceNumberColor: "#ffffff",
    sectionBkgColor: "#f4f4f5",
    altSectionBkgColor: "#fafafa",
    gridColor: "#e4e4e7",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
  },
}

const MERMAID_DARK = {
  theme: "base" as const,
  themeVariables: {
    primaryColor: "#27272a",
    primaryTextColor: "#fafafa",
    primaryBorderColor: "#3f3f46",
    secondaryColor: "#1c1c1e",
    secondaryTextColor: "#d4d4d8",
    secondaryBorderColor: "#3f3f46",
    tertiaryColor: "#27272a",
    lineColor: "#71717a",
    textColor: "#e4e4e7",
    mainBkg: "#27272a",
    nodeBorder: "#3f3f46",
    clusterBkg: "#1c1c1e",
    clusterBorder: "#3f3f46",
    titleColor: "#fafafa",
    edgeLabelBackground: "#18181b",
    nodeTextColor: "#fafafa",
    actorBkg: "#27272a",
    actorBorder: "#3f3f46",
    actorTextColor: "#fafafa",
    actorLineColor: "#71717a",
    signalColor: "#fafafa",
    signalTextColor: "#fafafa",
    noteBkgColor: "#422006",
    noteTextColor: "#fef9c3",
    noteBorderColor: "#854d0e",
    activationBkgColor: "#3f3f46",
    activationBorderColor: "#71717a",
    sequenceNumberColor: "#18181b",
    sectionBkgColor: "#27272a",
    altSectionBkgColor: "#1c1c1e",
    gridColor: "#3f3f46",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
  },
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, "_")
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!containerRef.current || !code) return

    const config = resolvedTheme === "dark" ? MERMAID_DARK : MERMAID_LIGHT
    mermaid.initialize({ startOnLoad: false, securityLevel: "loose", ...config })

    const el = containerRef.current
    el.innerHTML = ""

    mermaid.render(`mermaid${id}_${resolvedTheme}`, code).then(({ svg }) => {
      el.innerHTML = svg
    }).catch(() => {
      el.textContent = code
    })
  }, [code, id, resolvedTheme])

  return (
    <div className="not-prose my-6 flex justify-center rounded-xl border border-border bg-white px-4 py-8 overflow-x-auto shadow-sm dark:bg-zinc-950">
      <div ref={containerRef} className="[&>svg]:max-w-full" />
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
