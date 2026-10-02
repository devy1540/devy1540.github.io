import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useT } from "@/i18n"
import { getDiagramThemeKey, getServerDiagramThemeKey, subscribeDiagramTheme } from "@/lib/diagram-theme"
import { requestMermaidRender } from "@/lib/mermaid-renderer"
import { createMermaidSvg } from "@/lib/mermaid-svg"

export function MermaidBlock({ code }: { code: string }) {
  const id = `diagram-${useId().replace(/[^\w-]/g, "")}`
  const themeKey = useSyncExternalStore(subscribeDiagramTheme, getDiagramThemeKey, getServerDiagramThemeKey)
  const [result, setResult] = useState<{ code: string; svg: string } | null>(null)
  const [renderError, setRenderError] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const t = useT()
  useEffect(() => {
    let active = true
    const request = requestMermaidRender(code, themeKey)
    request.promise.then(svg => {
      if (!active) return
      setResult({ code, svg })
      setRenderError(false)
    }, () => { if (active) setRenderError(true) })
    return () => { active = false; request.cancel() }
  }, [code, themeKey])
  const source = result?.code === code ? result.svg : ""
  const svg = useMemo(() => source ? createMermaidSvg(source, id) : "", [source, id])
  const enlarged = useMemo(() => expanded && source ? createMermaidSvg(source, `${id}-dialog`) : "", [expanded, source, id])
  if (renderError && !svg) return <pre className="not-prose my-5 overflow-x-auto rounded-lg border bg-secondary p-4"><code>{code}</code></pre>
  return <Dialog open={expanded} onOpenChange={setExpanded}>
    <div className="not-prose my-6 rounded-xl border border-border bg-background p-4 shadow-sm">
      <DialogTrigger asChild>
        <button type="button" className="block w-full overflow-x-auto rounded-md py-4 text-left cursor-zoom-in focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4" aria-label={t.components.expandDiagram} disabled={!svg}>
          {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <pre className="m-0 whitespace-pre-wrap text-sm"><code>{code}</code></pre>}
        </button>
      </DialogTrigger>
    </div>
    <DialogContent className="!w-[95vw] !max-w-[95vw] max-h-[90vh] overflow-auto p-8">
      <DialogTitle className="sr-only">{t.components.diagramTitle}</DialogTitle>
      <DialogDescription className="sr-only">{t.components.diagramDescription}</DialogDescription>
      <div dangerouslySetInnerHTML={{ __html: enlarged }} className="[&_svg]:!w-full [&_svg]:!max-w-none [&_svg]:h-auto" />
    </DialogContent>
  </Dialog>
}
