import { useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"
import { advancedSearch, getAllTags } from "@/lib/posts"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/DatePicker"
import { useMetaTags } from "@/hooks/useMetaTags"

export function SearchPage() {
  useMetaTags({ title: "Search", description: "블로그 글 검색", url: "/search" })

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
            placeholder="키워드 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">시작일</label>
            <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="시작일" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">종료일</label>
            <DatePicker value={dateTo} onChange={setDateTo} placeholder="종료일" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">태그 필터</label>
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
              {results.length}개의 결과
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XIcon className="size-3 mr-1" />
              초기화
            </Button>
          </div>
        )}
      </div>

      {hasFilters ? (
        <PostList posts={results} emptyMessage="검색 결과가 없습니다." />
      ) : (
        <p className="text-muted-foreground text-sm">키워드, 날짜, 태그를 선택하여 검색하세요.</p>
      )}
    </div>
  )
}
