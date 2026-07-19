---
title: "Building a Blog #4 - Advanced Search and SEO Optimization"
date: "2026-02-26"
updated: "2026-02-26"
description: "How I built a search page with date and tag filters, then improved SEO with meta tags, sitemap, and RSS feed generation."
tags: ["react", "seo", "shadcn-ui", "blog"]
series: "Building a React Blog"
seriesOrder: 4
---

## Advanced Search Page

In addition to the Cmd+K Command Palette, I added a dedicated search page. It can combine keyword search with date range and tag filters.

### Search Filters

- **Keyword** - searches title, description, and content
- **Date range** - start date to end date with a DatePicker
- **Tag filter** - toggle from the full tag list

### DatePicker Implementation

I built the DatePicker by combining shadcn/ui's `Calendar` and `Popover` components. At first, I used a plain `<input type="date">`, but replaced it with shadcn components for visual consistency.

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

### advancedSearch Function

This function combines all filters. Each filter is optional, and only the provided filters are applied.

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

## SEO Optimization

Even though this is a static site, I added several SEO improvements.

### Dynamic Meta Tags

The `useMetaTags` custom hook updates the page-specific `<title>`, `<meta description>`, and Open Graph tags.

```tsx
export function useMetaTags({ title, description, url, type = "website" }) {
  useEffect(() => {
    document.title = title
      ? `${title} | Devy's Blog`
      : "Devy's Blog"

    setMeta("description", description || "Notes from development work.")
    setMeta("og:title", title || "Devy's Blog")
    setMeta("og:url", `https://devy1540.dev${url || "/"}`)
    // ...
  }, [title, description, url, type])
}
```

I applied it to all six pages: Home, Posts, Post, Search, Tags, and About.

### sitemap.xml

A Vite plugin generates it automatically during build. It includes URLs for static pages and Markdown posts.

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
      // Generate XML and write it to dist/sitemap.xml
    },
  }
}
```

### RSS Feed

The same Vite plugin generates `rss.xml` at build time. It parses each post's frontmatter and includes title, description, date, and link. I also added an RSS alternate link to `index.html`.

```html
<link rel="alternate" type="application/rss+xml"
  title="Devy's Blog RSS"
  href="https://devy1540.dev/rss.xml" />
```

---

The next post covers Google Analytics integration and displaying visitor counts.
