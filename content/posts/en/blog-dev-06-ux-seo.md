---
title: "Building a Blog #6 - UX Improvements and Final SEO Polish"
date: "2026-02-26"
description: "Year-based post grouping, mobile sidebar UX improvements, robots.txt, OG image setup, and other small refinements that make the blog feel more complete."
tags: ["react", "seo", "ux", "blog"]
series: "Building a React Blog"
seriesOrder: 6
---

After the main features were mostly done, I improved the rough edges I noticed while actually using the blog. This post is a collection of **small refinements that improve completeness**, rather than large feature additions.

## 1. Grouping Posts by Year

### Problem

As the number of posts increased, the full list on PostsPage became long. It was sorted by date, but it was still hard to scan visually and understand when each post was written.

### Solution

I grouped posts by year and displayed a header for each group.

```tsx
const groupedByYear = useMemo(() => {
  const groups = new Map<string, PostMeta[]>()
  for (const post of posts) {
    const year = post.date.slice(0, 4)
    const list = groups.get(year)
    if (list) {
      list.push(post)
    } else {
      groups.set(year, [post])
    }
  }
  return groups
}, [posts])
```

This uses `useMemo` for caching and relies on the fact that `Map` preserves insertion order. Since the data is already sorted by date, the year groups naturally remain in descending order.

Rendering simply repeats the existing `PostList` component by year.

```tsx
{[...groupedByYear.entries()].map(([year, yearPosts]) => (
  <div key={year} className="mb-8">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
      {year}
    </h2>
    <PostList posts={yearPosts} viewMode={viewMode} />
  </div>
))}
```

I did not modify the existing `PostList` component. It works the same way in both list and grid views.

### Why I Removed the Tag Filter

At first, I added tag chips at the top for filtering. But the blog already had **SearchPage** for combined keyword/date/tag search and **TagsPage** for tag-based browsing. Those features already covered the same role, so I removed the filter.

When features overlap, users start wondering where they are supposed to do the task.

## 2. Auto-closing the Mobile Sidebar

### Problem

On mobile, after opening the hamburger menu and selecting a menu item, the page changed but the sidebar stayed open. It had to be closed manually every time.

### Cause

shadcn/ui's `Sidebar` component renders as a `Sheet` overlay on mobile. It controls the `openMobile` state through `setOpenMobile`, but there was no code to close it when a navigation link was clicked.

### Solution

In `Sidebar.tsx`, I imported the `useSidebar` hook and added close logic to the `NavLink` `onClick`.

```tsx
const { isMobile, setOpenMobile } = useSidebar()

// Add onClick to NavLink
<NavLink
  to={item.to}
  viewTransition
  onClick={() => isMobile && setOpenMobile(false)}
>
```

The `isMobile` check keeps desktop behavior unchanged. Three lines of code made the mobile navigation experience noticeably better.

## 3. Adding robots.txt

### Why It Matters

In the [previous post](/posts/blog-dev-04-search-seo), I generated `sitemap.xml` automatically at build time. But it is still a good idea to tell crawlers where the sitemap lives through `robots.txt`.

### Implementation

Add one file: `public/robots.txt`. Vite copies files under `public/` directly into the build output.

```text
User-agent: *
Allow: /
Sitemap: https://devy1540.dev/sitemap-gsc.xml
```

- `User-agent: *` - applies to all crawlers
- `Allow: /` - allows crawling the whole site
- `Sitemap` - tells crawlers where the sitemap is

### Registering in Google Search Console

After preparing robots.txt and sitemap, register the site in [Google Search Console](https://search.google.com/search-console).

1. Register `https://devy1540.dev` with either URL prefix or domain property.
2. Complete ownership verification.
3. Submit `https://devy1540.dev/sitemap-gsc.xml` from the Sitemaps menu.

It can take days or weeks for Google to index the site, so it is normal if it does not appear in search results immediately.

## 4. Adding an OG Image

### Problem

When sharing blog URLs on KakaoTalk or Slack, only the title and description appeared. There was **no thumbnail image**.

### Cause

The `useMetaTags` hook set values like `og:title` and `og:description`, but `og:image` was missing.

### Solution

I added a 1200x630px representative image at `public/og-image.png` and set the `og:image` meta tag in `useMetaTags`.

```tsx
setMeta("og:image", `${BASE_URL}/og-image.png`)
setMeta("og:image:width", "1200")
setMeta("og:image:height", "630")
```

### Notes

- OG images should be **PNG or JPG**. Most platforms do not recognize SVG as a preview image.
- The recommended size is **1200x630px**. Smaller images can appear as smaller thumbnails on some platforms.
- KakaoTalk caches aggressively. If the old image still appears after a change, clear the cache with the [Kakao sharing debugger](https://developers.kakao.com/tool/debugger/sharing).

## Things I Considered but Skipped

I considered several improvements to make the blog feel more complete, but some were too much for the current scale.

| Item | Decision | Reason |
|------|----------|--------|
| Code splitting for shiki | Deferred | gzip size around 1.6MB, no noticeable UX issue |
| PWA for offline reading | Skipped | Overengineering for a personal blog |
| Search index optimization | Skipped | Unnecessary at the scale of dozens to hundreds of posts |
| Image optimization | Deferred | Mostly text-based blog, limited effect |
| Sidebar category tree | Skipped | Tags and series are enough as classification |
| Post card thumbnails | Deferred | Preparing images for every post is extra maintenance |

For a personal project, the right rule is not "do it because it may be needed later," but **"do it when it actually becomes painful."**

## Closing

The improvements in this post are small in code size, but together they make the user experience noticeably better.

- Year-based grouping improves post list readability.
- Auto-closing mobile sidebar improves navigation UX.
- robots.txt helps search engine crawlers.
- OG image gives shared links a visual preview.

There is a stage where polishing existing features matters more than adding more features. This blog now feels like it has entered that stage.

---

> The source code for this blog is available on [GitHub](https://github.com/devy1540/devy1540.github.io).
