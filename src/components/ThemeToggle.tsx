import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/hooks/useTheme"
import { analytics } from "@/lib/analytics"
import { useT } from "@/i18n"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const t = useT()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.components.toggleTheme}>
          {resolvedTheme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={theme === "light"}
          onCheckedChange={() => { setTheme("light"); analytics.changeTheme("light") }}
        >
          <Sun className="size-4 mr-2" />
          {t.components.themeLight}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "dark"}
          onCheckedChange={() => { setTheme("dark"); analytics.changeTheme("dark") }}
        >
          <Moon className="size-4 mr-2" />
          {t.components.themeDark}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "system"}
          onCheckedChange={() => { setTheme("system"); analytics.changeTheme("system") }}
        >
          <Monitor className="size-4 mr-2" />
          {t.components.themeSystem}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
