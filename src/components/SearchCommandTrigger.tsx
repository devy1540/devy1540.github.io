import { SearchIcon } from "lucide-react"
import { useLanguage } from "@/i18n"
import { useIsHydrated } from "@/hooks/useHydratedSearchParams"
import { useSearchCommand } from "./search-command-context"
import { Button } from "./ui/button"
import { SidebarMenuButton } from "./ui/sidebar"

export function SearchCommandTrigger({ variant = "icon" }: { variant?: "icon" | "sidebar" }) {
  const { open, openSearch } = useSearchCommand()
  const { t } = useLanguage()
  const hydrated = useIsHydrated()
  const shortcut = hydrated && /Mac|iPhone|iPad/i.test(navigator.platform) ? "⌘K" : "Ctrl K"
  const props = {
    onClick: openSearch,
    disabled: !hydrated,
    "aria-label": t.components.searchPosts,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-keyshortcuts": "Meta+K Control+K",
    "data-search-trigger": variant,
  }

  if (variant === "sidebar") return <SidebarMenuButton {...props} tooltip={t.components.searchPosts}>
    <SearchIcon />
    <span className="sidebar-menu-label min-w-0 truncate">{t.common.search}</span>
    <kbd className="sidebar-menu-shortcut ml-auto hidden text-xs text-muted-foreground md:inline-flex">{shortcut}</kbd>
  </SidebarMenuButton>

  return <Button {...props} variant="ghost" size="icon" className="size-11 text-muted-foreground">
    <SearchIcon className="size-4" />
  </Button>
}
