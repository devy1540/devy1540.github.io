import { useEffect, useState } from "react"
import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const t = useT()

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <Button
      variant="outline"
      size="icon"
      className={`fixed bottom-6 right-6 z-50 rounded-full shadow-md transition-opacity duration-300 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t.components.scrollToTop}
    >
      <ArrowUpIcon className="size-4" />
    </Button>
  )
}
