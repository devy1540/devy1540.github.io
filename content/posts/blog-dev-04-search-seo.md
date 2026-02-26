---
title: "블로그 만들기 #4 — 고급 검색 & SEO 최적화"
date: "2026-02-26"
description: "날짜/태그 필터가 포함된 검색 페이지를 만들고, 메타 태그, sitemap, RSS 피드로 SEO를 최적화한 과정입니다."
tags: ["react", "seo", "shadcn-ui", "blog"]
series: "React 블로그 만들기"
seriesOrder: 4
---

## 고급 검색 페이지

Cmd+K Command Palette 외에 별도 검색 페이지를 추가했습니다. 키워드뿐 아니라 날짜 범위와 태그 필터를 조합해서 검색할 수 있습니다.

### 검색 필터 구성

- **키워드** — 제목, 설명, 본문에서 검색
- **날짜 범위** — 시작일 ~ 종료일 (DatePicker)
- **태그 필터** — 전체 태그 목록에서 토글 선택

### DatePicker 구현

shadcn/ui의 `Calendar` + `Popover` 컴포넌트를 조합해 DatePicker를 만들었습니다. 처음에는 기본 `<input type="date">`를 사용했지만, 디자인 일관성을 위해 shadcn 컴포넌트로 교체했습니다.

```tsx
export function DatePicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value + "T00:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "yyyy-MM-dd") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
```

### advancedSearch 함수

모든 필터를 조합하는 검색 함수입니다. 각 필터는 선택사항이며, 입력된 필터만 적용됩니다.

```tsx
export function advancedSearch({ query, dateFrom, dateTo, tag }) {
  return getAllPosts().filter((post) => {
    if (query) {
      const q = query.toLowerCase()
      const match = [post.title, post.description, post.content]
        .some((f) => f.toLowerCase().includes(q))
      if (!match) return false
    }
    if (dateFrom && post.date < dateFrom) return false
    if (dateTo && post.date > dateTo) return false
    if (tag && !post.tags.includes(tag)) return false
    return true
  })
}
```

---

## SEO 최적화

정적 사이트지만 검색 엔진 최적화를 위해 여러 가지를 적용했습니다.

### 동적 메타 태그

`useMetaTags` 커스텀 훅으로 페이지별 `<title>`, `<meta description>`, OG 태그를 동적으로 설정합니다.

```tsx
export function useMetaTags({ title, description, url, type = "website" }) {
  useEffect(() => {
    document.title = title
      ? `${title} | Devy's Blog`
      : "Devy's Blog"

    setMeta("description", description || "개발하며 배운 것들을 정리하고 공유합니다.")
    setMeta("og:title", title || "Devy's Blog")
    setMeta("og:url", `https://devy1540.github.io${url || "/"}`)
    // ...
  }, [title, description, url, type])
}
```

모든 6개 페이지(Home, Posts, Post, Search, Tags, About)에 적용했습니다.

### sitemap.xml

Vite 플러그인으로 빌드 시 자동 생성합니다. `content/posts/*.md` 파일과 정적 페이지들의 URL을 포함합니다.

```tsx
// vite.config.ts
function sitemapPlugin() {
  return {
    name: "sitemap",
    closeBundle() {
      const posts = glob.sync("content/posts/*.md")
      const urls = [
        { loc: "/", priority: "1.0" },
        { loc: "/posts", priority: "0.8" },
        ...posts.map((f) => ({
          loc: `/posts/${path.basename(f, ".md")}`,
          priority: "0.6",
        })),
      ]
      // XML 생성 후 dist/sitemap.xml에 저장
    },
  }
}
```

### RSS 피드

마찬가지로 Vite 플러그인으로 빌드 시 `rss.xml`을 생성합니다. 각 포스트의 frontmatter를 파싱해서 제목, 설명, 날짜, 링크를 포함합니다. `index.html`에 RSS alternate 링크도 추가했습니다.

```html
<link rel="alternate" type="application/rss+xml"
  title="Devy's Blog RSS"
  href="https://devy1540.github.io/rss.xml" />
```

---

다음 글에서는 Google Analytics 연동과 방문자 수 표시를 다룹니다.
