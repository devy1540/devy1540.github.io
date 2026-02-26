import { useEffect, useState } from "react"
import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/i18n"

const isMac = navigator.platform.toUpperCase().includes("MAC")

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border bg-muted text-[11px] font-mono font-medium text-muted-foreground">
      {children}
    </kbd>
  )
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const t = useT()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const shortcuts = [
    { keys: [isMac ? "\u2318" : "Ctrl", "K"], description: t.components.shortcutSearch },
    { keys: [isMac ? "\u2318" : "Ctrl", "B"], description: t.components.shortcutSidebar },
    { keys: ["Shift", "/"], description: t.components.shortcutHelp },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setOpen(true)}
        aria-label={t.components.keyboardShortcuts}
      >
        <Keyboard className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
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
    </>
  )
}
