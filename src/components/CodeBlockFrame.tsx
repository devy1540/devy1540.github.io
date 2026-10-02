import { type ComponentPropsWithoutRef, type ReactNode, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { useT } from "@/i18n"
import { Button } from "@/components/ui/button"
import { readMarkdownCode } from "@/lib/markdown-code"

export function CodeBlockFrame({ code, language, children }: { code: string; language: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const t = useT()
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch { setCopied(false) }
  }
  return <div className="not-prose my-5 rounded-lg border border-border overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
      <div className="flex gap-1.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {language && <span className="text-xs text-muted-foreground">{language}</span>}
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={() => { void copy() }} aria-label={t.components.copyCode}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
    {children}
  </div>
}

export function PlainCodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const { language, code } = readMarkdownCode(children)
  if (language === "mermaid" || language === "benchmark") return <pre {...props} className="not-prose my-5 overflow-x-auto rounded-lg border border-border bg-secondary p-4 text-sm text-secondary-foreground">{children}</pre>
  return <CodeBlockFrame code={code} language={language}>
    <pre {...props} className="m-0 rounded-none border-0 bg-secondary text-secondary-foreground overflow-x-auto p-4 text-sm">{children}</pre>
  </CodeBlockFrame>
}
