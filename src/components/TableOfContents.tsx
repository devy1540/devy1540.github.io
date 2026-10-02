import { useEffect, useId, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"

interface TocItem { id: string; text: string; level: number }

export function TableOfContents({ containerSelector = ".prose" }: { containerSelector?: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState("")
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const location = useLocation()
  const t = useT()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = document.querySelector(containerSelector)
      setHeadings(Array.from(container?.querySelectorAll("h2[id], h3[id]") ?? []).map(el => ({
        id: el.id, text: el.textContent ?? "", level: Number(el.tagName[1]),
      })))
    })
    return () => cancelAnimationFrame(frame)
  }, [containerSelector])

  useEffect(() => {
    if (!headings.length) return
    let frame = 0
    const measure = () => {
      frame = 0
      const firstHeading = document.getElementById(headings[0]!.id)
      const offset = (firstHeading ? parseFloat(getComputedStyle(firstHeading).scrollMarginTop) || 0 : 0) + 20
      let current = ""
      for (const heading of headings) {
        if ((document.getElementById(heading.id)?.getBoundingClientRect().top ?? Infinity) <= offset) current = heading.id
      }
      setActiveId(current)
      const rect = document.querySelector(containerSelector)?.getBoundingClientRect()
      if (rect) setProgress(rect.height <= window.innerHeight ? 1 : Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 1))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [headings, containerSelector])

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-current="location"]')
    const list = listRef.current
    if (!active || !list) return
    const itemRect = active.getBoundingClientRect(), listRect = list.getBoundingClientRect()
    if (itemRect.top < listRect.top) list.scrollTop += itemRect.top - listRect.top
    else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom
  }, [activeId, open])

  if (!headings.length) return null

  return <nav className="post-toc-panel" aria-label={t.components.tableOfContents}>
    <div className="flex items-center gap-3">
      <Button className="post-toc-toggle gap-2" variant="ghost" size="sm" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(value => !value)}>
        {t.components.tableOfContents}<ChevronDown className={`size-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </Button>
      <span className="post-toc-desktop-title text-sm font-medium">{t.components.tableOfContents}</span>
      <div className="ml-auto h-1 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={t.components.readingProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <div className="h-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{Math.round(progress * 100)}%</span>
    </div>
    <ul ref={listRef} id={listId} className="post-toc-list scrollbar-thin" data-open={open}>
      {headings.map(heading => <li key={heading.id}>
        <Link to={{ pathname: location.pathname, search: location.search, hash: `#${heading.id}` }} preventScrollReset
          aria-current={activeId === heading.id ? "location" : undefined}
          onClick={() => { if (!window.matchMedia("(min-width: 1280px)").matches) setOpen(false) }}
          className={`block border-l-2 py-1.5 text-sm break-words transition-colors hover:text-foreground ${heading.level === 3 ? "pl-5" : "pl-3"} ${activeId === heading.id ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"}`}>
          {heading.text}
        </Link>
      </li>)}
    </ul>
  </nav>
}
