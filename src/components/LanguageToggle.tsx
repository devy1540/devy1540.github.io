import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/i18n"
import { analytics } from "@/lib/analytics"
import { localizePath } from "@/lib/i18n-routing"
import { useLocation, useNavigate } from "react-router-dom"
import type { Language } from "@/i18n"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  function changeLanguage(next: Language) {
    setLanguage(next)
    analytics.changeLanguage(next)
    navigate(localizePath(`${location.pathname}${location.search}${location.hash}`, next), { viewTransition: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.components.toggleLanguage}>
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={language === "ko"}
          onCheckedChange={() => changeLanguage("ko")}
        >
          한국어
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={language === "en"}
          onCheckedChange={() => changeLanguage("en")}
        >
          English
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
