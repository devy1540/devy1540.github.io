import { useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"
import { advancedSearch, getAllTags } from "@/lib/posts"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/DatePicker"
import { useMetaTags } from "@/hooks/useMetaTags"
import { useT } from "@/i18n"

export function SearchPage() {
  const t = useT()
  useMetaTags({ title: "Search", description: t.search.description, url: "/search" })

  const [query, setQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedTag, setSelectedTag] = useState("")

  const allTags = getAllTags()
  const hasFilters = query || dateFrom || dateTo || selectedTag

  const results = hasFilters
    ? advancedSearch({ query, dateFrom, dateTo, tag: selectedTag })
    : []

  function clearFilters() {
    setQuery("")
    setDateFrom("")
    setDateTo("")
    setSelectedTag("")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Search</h1>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">{t.search.dateFrom}</label>
            <DatePicker value={dateFrom} onChange={setDateFrom} placeholder={t.search.dateFrom} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">{t.search.dateTo}</label>
            <DatePicker value={dateTo} onChange={setDateTo} placeholder={t.search.dateTo} />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">{t.search.tagFilter}</label>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t.search.resultCount(results.length)}
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XIcon className="size-3 mr-1" />
              {t.search.reset}
            </Button>
          </div>
        )}
      </div>

      {hasFilters ? (
        <PostList posts={results} emptyMessage={t.search.noResults} />
      ) : (
        <p className="text-muted-foreground text-sm">{t.search.searchGuide}</p>
      )}
    </div>
  )
}
