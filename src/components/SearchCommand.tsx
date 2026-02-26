import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon } from "lucide-react"
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
import { useT } from "@/i18n"

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const t = useT()

  const results = searchPosts(query)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function handleSelect(slug: string) {
    if (query) analytics.search(query, results.length)
    setOpen(false)
    setQuery("")
    navigate(`/posts/${slug}`)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t.components.searchPosts}
        description={t.components.searchPostsDescription}
        shouldFilter={false}
      >
        <CommandInput
          placeholder={t.components.searchPlaceholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t.components.noResults}</CommandEmpty>
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
    </>
  )
}
