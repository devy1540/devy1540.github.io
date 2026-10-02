import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { SearchCommandContext } from "./search-command-context"
import { useSidebar } from "./ui/sidebar"
import { usePostSearchIndex } from "@/hooks/usePostData"
import { searchPosts } from "@/lib/posts"
import { analytics } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { useLanguage } from "@/i18n"
import { postPath } from "@/lib/i18n-routing"

export function SearchCommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { openMobile, setOpenMobile } = useSidebar()
  const previousFocus = useRef<HTMLElement | null>(null)
  const restoreFocus = useRef(true)
  const pendingOpen = useRef<number | undefined>(undefined)

  const openSearch = useCallback(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    restoreFocus.current = true
    window.clearTimeout(pendingOpen.current)
    if (openMobile) {
      setOpenMobile(false)
      pendingOpen.current = window.setTimeout(() => setOpen(true), 250)
    } else {
      setOpen(true)
    }
  }, [openMobile, setOpenMobile])

  useEffect(() => () => window.clearTimeout(pendingOpen.current), [])

  const searchIndex = usePostSearchIndex(open && Boolean(query.trim()), language)
  const results = searchPosts(query, language)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (open) setOpen(false)
        else openSearch()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, openSearch])

  function handleSelect(slug: string) {
    if (query) analytics.search(query, results.length)
    restoreFocus.current = false
    setOpen(false)
    setQuery("")
    navigate(postPath(slug, language))
  }

  return (
    <SearchCommandContext.Provider value={{ open, openSearch }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t.components.searchPosts}
        description={t.components.searchPostsDescription}
        shouldFilter={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          if (!restoreFocus.current) return
          const fallback = Array.from(document.querySelectorAll<HTMLElement>("[data-search-trigger]")).find(el => el.getClientRects().length > 0)
          const target = previousFocus.current?.isConnected ? previousFocus.current : fallback
          target?.focus({ preventScroll: true })
        }}
      >
        <CommandInput
          placeholder={t.components.searchPlaceholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {searchIndex.loading ? <p role="status" className="p-3 text-sm text-muted-foreground">{t.common.searchLoading}</p> : searchIndex.error ? <div role="alert" className="p-3 text-sm"><p>{t.common.searchLoadError}</p><Button variant="outline" size="sm" onClick={() => window.location.reload()}>{t.common.retry}</Button></div> : <CommandEmpty>{t.components.noResults}</CommandEmpty>}
          <CommandGroup heading={t.components.postsGroup}>
            {results.map((post) => (
              <CommandItem
                key={post.slug}
                value={post.slug}
                onSelect={() => handleSelect(post.slug)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{post.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {post.description}
                  </span>
                </div>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {post.date}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SearchCommandContext.Provider>
  )
}
