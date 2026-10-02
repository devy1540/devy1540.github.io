import { createContext, useContext } from "react"

export const SearchCommandContext = createContext<{ open: boolean; openSearch: () => void } | null>(null)

export function useSearchCommand() {
  const value = useContext(SearchCommandContext)
  if (!value) throw new Error("Search triggers must be inside SearchCommandProvider")
  return value
}
