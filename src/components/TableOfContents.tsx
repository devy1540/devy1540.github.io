import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ containerSelector = ".prose" }: { containerSelector?: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [open, setOpen] = useState(true)
  const [progress, setProgress] = useState(0)
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false })
  const listRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)
  const ulRef = useRef<HTMLUListElement>(null)
  const t = useT()

  useEffect(() => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const elements = container.querySelectorAll("h2, h3")
    const items: TocItem[] = Array.from(elements)
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: parseInt(el.tagName.charAt(1)),
      }))

    setHeadings(items)
  }, [containerSelector])

  useEffect(() => {
    if (headings.length === 0) return

    function onScroll() {
      const offset = 100
      let current = ""
      for (const heading of headings) {
        const el = document.getElementById(heading.id)
        if (el && el.getBoundingClientRect().top <= offset) {
          current = heading.id
        }
      }
      setActiveId(current)

      // Reading progress
      const prose = document.querySelector(containerSelector)
      if (prose) {
        const rect = prose.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        if (total > 0) {
          const scrolled = Math.min(Math.max(-rect.top / total, 0), 1)
          setProgress(scrolled)
        }
      }
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [headings])

  useEffect(() => {
    const container = listRef.current
    const active = activeRef.current
    const ul = ulRef.current
    if (!container || !active || !ul) {
      setIndicator((prev) => ({ ...prev, visible: false }))
      return
    }

    const containerRect = container.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()

    // Auto-scroll TOC list
    if (activeRect.top < containerRect.top) {
      container.scrollTop += activeRect.top - containerRect.top - 8
    } else if (activeRect.bottom > containerRect.bottom) {
      container.scrollTop += activeRect.bottom - containerRect.bottom + 8
    }

    // Update indicator position relative to ul
    const ulRect = ul.getBoundingClientRect()
    setIndicator({
      top: activeRect.top - ulRect.top,
      height: activeRect.height,
      visible: true,
    })
  }, [activeId])

  if (headings.length === 0) return null

  return (
    <nav className="hidden xl:block" aria-label="Table of contents">
      <div className="sticky top-20">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 shrink-0"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={t.components.tableOfContents}
          >
            <ChevronRight
              className={`size-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            />
            {t.components.tableOfContents}
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-1 rounded-full bg-muted flex-1 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-150 ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-in-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div ref={listRef} className="overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-thin">
            <ul ref={ulRef} className="relative space-y-1.5 text-sm border-l">
              <span
                className="absolute left-0 w-0.5 bg-primary rounded-full transition-all duration-200 ease-out"
                style={{
                  top: indicator.top,
                  height: indicator.height,
                  opacity: indicator.visible ? 1 : 0,
                }}
              />
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    ref={activeId === heading.id ? activeRef : undefined}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className={`block py-0.5 transition-colors hover:text-foreground ${
                      heading.level === 3 ? "pl-6" : "pl-3"
                    } ${
                      activeId === heading.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
