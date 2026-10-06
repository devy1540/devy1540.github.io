import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/i18n"
import { useSidebar } from "@/components/ui/sidebar"
import { KeyboardShortcutsContext } from "@/components/keyboard-shortcuts-context"

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border bg-muted text-[11px] font-mono font-medium text-muted-foreground">
      {children}
    </kbd>
  )
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { openMobile, setOpenMobile } = useSidebar()
  const previousFocus = useRef<HTMLElement | null>(null)
  const pendingOpen = useRef<number | undefined>(undefined)
  const t = useT()
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC")

  const openShortcuts = useCallback(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.clearTimeout(pendingOpen.current)
    if (openMobile) {
      setOpenMobile(false)
      pendingOpen.current = window.setTimeout(() => setOpen(true), 300)
    } else {
      setOpen(true)
    }
  }, [openMobile, setOpenMobile])

  useEffect(() => () => window.clearTimeout(pendingOpen.current), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return
        e.preventDefault()
        if (open) setOpen(false)
        else openShortcuts()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, openShortcuts])

  const shortcuts = [
    { keys: [isMac ? "\u2318" : "Ctrl", "K"], description: t.components.shortcutSearch },
    { keys: [isMac ? "\u2318" : "Ctrl", "B"], description: t.components.shortcutSidebar },
    { keys: ["Shift", "/"], description: t.components.shortcutHelp },
    { keys: ["?", "?", "?", "?", "?"], description: "???" },
  ]

  return (
    <KeyboardShortcutsContext.Provider value={{ openShortcuts }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" onCloseAutoFocus={event => {
          event.preventDefault()
          const fallback = Array.from(document.querySelectorAll<HTMLElement>("[data-sidebar-info-trigger], [data-mobile-menu-trigger]")).find(element => element.getClientRects().length > 0)
          const target = previousFocus.current?.isConnected && previousFocus.current.getClientRects().length > 0 ? previousFocus.current : fallback
          target?.focus({ preventScroll: true })
        }}>
          <DialogHeader>
            <DialogTitle>{t.components.keyboardShortcuts}</DialogTitle>
            <DialogDescription className="sr-only">
              {t.components.keyboardShortcuts}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
              {t.components.general}
            </p>
            {shortcuts.map((s) => (
              <div key={s.description} className="flex items-center justify-between py-1.5">
                <span className="text-sm">{s.description}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((key, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
                      <Kbd>{key}</Kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </KeyboardShortcutsContext.Provider>
  )
}
