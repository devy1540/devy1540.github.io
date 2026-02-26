import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ containerSelector = ".prose" }: { containerSelector?: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [open, setOpen] = useState(true)

  // DOM에서 실제 헤딩 요소를 읽어옴
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

  // 스크롤 기반 현재 섹션 추적
  useEffect(() => {
    if (headings.length === 0) return

    function onScroll() {
      const offset = 80
      let current = headings[0]?.id ?? ""
      for (const heading of headings) {
        const el = document.getElementById(heading.id)
        if (el && el.getBoundingClientRect().top <= offset) {
          current = heading.id
        }
      }
      setActiveId(current)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="hidden xl:block" aria-label="Table of contents">
      <div className="sticky top-20">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-3 hover:text-foreground/80 transition-colors"
        >
          <ChevronRight
            className={`size-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
          목차
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-in-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <ul className="space-y-1.5 text-sm border-l">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className={`block py-0.5 transition-colors hover:text-foreground ${
                      heading.level === 3 ? "pl-6" : "pl-3"
                    } ${
                      activeId === heading.id
                        ? "text-primary font-medium border-l-2 border-primary -ml-px"
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
