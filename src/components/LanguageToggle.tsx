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

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

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
          onCheckedChange={() => { setLanguage("ko"); analytics.changeLanguage("ko") }}
        >
          한국어
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={language === "en"}
          onCheckedChange={() => { setLanguage("en"); analytics.changeLanguage("en") }}
        >
          English
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
