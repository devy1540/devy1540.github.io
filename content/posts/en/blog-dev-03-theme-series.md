---
title: "Building a Blog #3 - Color Theme Presets and Post Series"
date: "2026-02-26"
updated: "2026-02-26"
description: "How I created six color presets with shadcn/ui's oklch color system and implemented post series navigation."
tags: ["react", "shadcn-ui", "css", "blog"]
series: "Building a React Blog"
seriesOrder: 3
---

## Color Theme Presets

In addition to dark and light mode, I added color presets that can change the overall tone of the blog. The idea was inspired by shadcn/ui's theme system.

### Six Presets

Neutral, Blue, Green, Rose, Orange, and Violet. Each preset overrides CSS custom properties such as `--primary`, `--ring`, and `--sidebar-primary`.

```css
[data-color="blue"] {
  --primary: 0.546 0.245 262.881;
  --ring: 0.546 0.245 262.881;
  --sidebar-primary: 0.546 0.245 262.881;
}

[data-color="rose"] {
  --primary: 0.645 0.246 16.439;
  --ring: 0.645 0.246 16.439;
  --sidebar-primary: 0.645 0.246 16.439;
}
```

### Implementation

The selected color is applied by setting a `data-color` attribute on `document.documentElement`, and the value is stored in `localStorage`. In the sidebar, the user can choose a preset from a palette icon dropdown.

```tsx
function applyColor(value: string) {
  if (value) {
    document.documentElement.setAttribute("data-color", value)
  } else {
    document.documentElement.removeAttribute("data-color")
  }
}
```

### Preventing FOUC

There is a FOUC issue where the default color briefly appears while the page is loading. To avoid that, I added an inline script to `index.html` so the theme is applied before `<body>` renders.

```html
<script>
  (function(){
    var t = localStorage.getItem("theme");
    if (t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme:dark)").matches))
      document.documentElement.classList.add("dark");
    var c = localStorage.getItem("color-theme");
    if (c) document.documentElement.setAttribute("data-color", c);
  })();
</script>
```

### Handling Collapsed Sidebar State

When the sidebar was collapsed, the theme toggle and color selector icons were laid out horizontally and overflowed. I fixed this by switching them to a vertical layout with `group-data-[state=collapsed]:flex-col`.

---

## Post Series

This feature groups related posts into a series and lets readers move through them in order. The post you are reading belongs to the "Building a React Blog" series.

### Frontmatter

```yaml
---
title: "Building a Blog #1 - Project Overview"
series: "Building a React Blog"
seriesOrder: 1
---
```

`series` is the series name, and `seriesOrder` is the order inside the series. Posts with the same `series` value are grouped automatically.

### Series Navigator

A collapsible series list appears near the top of each post. The current post is highlighted, and clicking another post navigates to it.

```tsx
export function SeriesNavigator({ series, currentSlug }) {
  const posts = getSeriesPosts(series)
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug)
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-lg border bg-card p-4 mb-8">
      <button onClick={() => setOpen(!open)}>
        <span>{series}</span>
        <span>{currentIndex + 1} / {posts.length}</span>
      </button>
      {/* Collapsible list */}
    </div>
  )
}
```

### Detour: TOC Did Not Refresh

When clicking another post in the same series, the URL changes from `/posts/slug-a` to `/posts/slug-b`, but React does not remount the component because the route pattern is still the same: `/posts/:slug`.

As a result, the Table of Contents showed headings from the previous post. I fixed it by forcing a remount whenever the slug changes with a `key` prop.

```tsx
<TableOfContents key={slug} />
```

---

The next post covers the advanced search page and SEO optimization.
