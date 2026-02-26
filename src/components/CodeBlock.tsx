import { type ComponentPropsWithoutRef, useCallback, useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { Copy, Check } from "lucide-react"
import { useT } from "@/i18n"

export function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const codeEl = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
  const className = codeEl?.props?.className || ""
  const match = className.match(/language-(\w+)/)
  const language = match ? match[1] : ""
  const code = (typeof codeEl?.props?.children === "string"
    ? codeEl.props.children
    : ""
  ).replace(/\n$/, "")

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
          {...props}
          className="m-0 rounded-none border-0 bg-secondary text-secondary-foreground overflow-x-auto p-4 text-sm"
        >
          {children}
        </pre>
      )}
    </div>
  )
}
