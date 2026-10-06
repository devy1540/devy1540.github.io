import { useEffect, useSyncExternalStore, type ComponentProps } from "react"
import { readLocalSetting, writeLocalSetting } from "@/lib/browser-storage"
import { PaletteIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { analytics } from "@/lib/analytics"
import { useT } from "@/i18n"

const colorPresets = [
  { name: "Neutral", value: "", color: "bg-neutral-600" },
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Green", value: "green", color: "bg-green-600" },
  { name: "Rose", value: "rose", color: "bg-rose-500" },
  { name: "Orange", value: "orange", color: "bg-orange-500" },
  { name: "Violet", value: "violet", color: "bg-violet-500" },
] as const

function applyColor(value: string) {
  if (typeof document === "undefined") return
  if (value) {
    document.documentElement.setAttribute("data-color", value)
  } else {
    document.documentElement.removeAttribute("data-color")
  }
}

let currentColor: string | null = null
const listeners = new Set<() => void>()
function subscribe(callback: () => void) { listeners.add(callback); window.addEventListener("storage", callback); return () => { listeners.delete(callback); window.removeEventListener("storage", callback) } }
function setColor(value: string) { currentColor = value; writeLocalSetting("color-theme", value); listeners.forEach(callback => callback()) }
export function ColorThemeSelector(buttonProps: ComponentProps<typeof Button> = {}) {
  const selected = useSyncExternalStore(subscribe, () => currentColor ?? readLocalSetting("color-theme") ?? "", () => "")
  useEffect(() => { applyColor(selected) }, [selected])

  const t = useT()

  function handleSelect(value: string) {
    setColor(value)
    applyColor(value)
    analytics.changeColorTheme(value || "neutral")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button {...buttonProps} variant="ghost" size="icon" aria-label={t.components.colorTheme}>
          <PaletteIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="grid grid-cols-3 gap-1.5 p-2 w-auto">
        {colorPresets.map((preset) => (
          <DropdownMenuItem
            key={preset.name}
            onClick={() => handleSelect(preset.value)}
            className={`flex flex-col items-center gap-1 rounded-md p-2 text-xs cursor-pointer ${selected === preset.value ? "bg-accent" : ""}`}
            aria-label={`${preset.name} theme`}
          >
            <span className={`size-5 rounded-full ${preset.color} ${selected === preset.value ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`} />
            <span className="text-muted-foreground">{preset.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
