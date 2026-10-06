import { useRef, useState, type ComponentProps, type MouseEvent } from "react"
import { NavLink } from "react-router-dom"
import { Ellipsis, Keyboard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsHydrated } from "@/hooks/useHydratedSearchParams"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts-context"

type SidebarInfoMenuProps = ComponentProps<typeof Button> & {
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, to: string) => void
}

export function SidebarInfoMenu({ onNavigate, ...buttonProps }: SidebarInfoMenuProps) {
  const { language, t } = useLanguage()
  const hydrated = useIsHydrated()
  const privacyPath = localizePath("/privacy", language)
  const { openShortcuts } = useKeyboardShortcuts()
  const [open, setOpen] = useState(false)
  const openingShortcuts = useRef(false)

  function showShortcuts() {
    openingShortcuts.current = true
    setOpen(false)
    openShortcuts()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button {...buttonProps} data-sidebar-info-trigger variant="ghost" size="icon" disabled={!hydrated} aria-label={t.components.blogInfo}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={8} collisionPadding={8} className="w-56" aria-label={t.components.blogInfo}
        onCloseAutoFocus={event => {
          if (!openingShortcuts.current) return
          event.preventDefault()
          openingShortcuts.current = false
        }}
        onKeyDown={event => {
          if (event.key !== "?" || event.metaKey || event.ctrlKey || event.altKey) return
          event.preventDefault()
          event.stopPropagation()
          showShortcuts()
        }}>
        <DropdownMenuItem className="min-h-11" onSelect={showShortcuts}>
          <Keyboard className="size-4" />
          {t.components.keyboardShortcuts}
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-11">
          <NavLink to={privacyPath} onClick={event => onNavigate(event, privacyPath)}>
            <ShieldCheck className="size-4" />
            {t.common.privacy}
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Devy</p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
