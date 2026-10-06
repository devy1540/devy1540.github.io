import { createContext, useContext } from "react"

export const KeyboardShortcutsContext = createContext<{ openShortcuts: () => void } | null>(null)

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) throw new Error("Keyboard shortcuts must be used inside KeyboardShortcutsProvider")
  return context
}
