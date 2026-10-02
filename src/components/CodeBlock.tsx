import { type ComponentPropsWithoutRef, useEffect, useState } from "react"
import { useT } from "@/i18n"
import { Button } from "@/components/ui/button"
import { CodeBlockFrame, PlainCodeBlock } from "./CodeBlockFrame"
import { readMarkdownCode } from "@/lib/markdown-code"
import { createRetryableLoader } from "@/lib/async-loader"
import { useDeferredModule } from "@/hooks/useDeferredModule"
import { normalizeCodeLanguage } from "@/lib/code-languages"

const loadBenchmark = createRetryableLoader(() => import("@/components/BenchmarkChart"))
const loadMermaid = createRetryableLoader(() => import("@/components/MermaidBlock"))
const loadHighlighter = createRetryableLoader(() => import("@/lib/shiki-highlighter"))

function DeferredMermaid({ code, ...props }: ComponentPropsWithoutRef<"pre"> & { code: string }) {
  const { value: module, error, retry } = useDeferredModule(loadMermaid)
  const t = useT()
  if (module) return <module.MermaidBlock code={code} />
  return <>
    {error && <div role="alert" className="not-prose flex items-center gap-3 text-sm text-muted-foreground"><p>{t.components.codeLoadError}</p><Button variant="outline" size="sm" onClick={retry}>{t.common.retry}</Button></div>}
    <PlainCodeBlock {...props} />
  </>
}

function DeferredBenchmark({ code, children, ...props }: ComponentPropsWithoutRef<"pre"> & { code: string }) {
  const { value: module, error, retry } = useDeferredModule(loadBenchmark)
  const t = useT()
  if (module) return <module.BenchmarkChart data={code} />
  return <>
    {error && <div className="not-prose flex flex-wrap items-center gap-3 text-sm text-muted-foreground" role="alert">
      <p>{t.common.chartLoadError}</p><Button variant="outline" size="sm" onClick={retry}>{t.common.retry}</Button>
    </div>}
    <pre {...props}>{children}</pre>
  </>
}

function ShikiBlock({ code, language, children, preProps }: { code: string; language: string; children: React.ReactNode; preProps: ComponentPropsWithoutRef<"pre"> }) {
  const [result, setResult] = useState<{ code: string; language: string; html: string } | null>(null)
  const normalizedLanguage = normalizeCodeLanguage(language)
  const highlightedHtml = result?.code === code && result.language === normalizedLanguage ? result.html : ""

  useEffect(() => {
    if (!code || !normalizedLanguage) return
    let cancelled = false

    let request: ReturnType<typeof import("@/lib/shiki-highlighter")["requestHighlight"]> | undefined
    loadHighlighter()
      .then(module => {
        if (cancelled) return ""
        request = module.requestHighlight(code, normalizedLanguage)
        return request.promise
      })
      .then(html => { if (!cancelled) setResult({ code, language: normalizedLanguage, html }) })
      .catch(() => { /* 읽을 수 있는 원문을 그대로 표시한다. */ })

    return () => {
      cancelled = true
      request?.cancel()
    }
  }, [code, normalizedLanguage])

  return (
    <CodeBlockFrame code={code} language={language}>
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
    </CodeBlockFrame>
  )
}

export function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const { language, code } = readMarkdownCode(children)
  if (language === "mermaid") return <DeferredMermaid code={code} {...props}>{children}</DeferredMermaid>
  if (language === "benchmark") return <DeferredBenchmark code={code} {...props}>{children}</DeferredBenchmark>
  return <ShikiBlock code={code} language={language} preProps={props}>{children}</ShikiBlock>
}
