---
title: "Building a Blog #2 - Command Palette Search and View Transitions"
date: "2026-02-26"
description: "How I implemented Cmd+K search with cmdk and added page transition animation with the View Transitions API."
tags: ["react", "cmdk", "view-transitions", "blog"]
series: "Building a React Blog"
seriesOrder: 2
---

## Command Palette Search (Cmd+K)

I implemented a Command Palette that lets users search quickly with `Cmd+K`, similar to VS Code or Raycast.

### Libraries Used

- `cmdk` - the core Command Palette library
- shadcn/ui's `CommandDialog`, `CommandInput`, and `CommandList` components

### Search Logic

The `searchPosts()` function searches title, description, tags, and content case-insensitively. Because all post data is already loaded in memory at build time, there is no need for async handling or debouncing.

```tsx
export function searchPosts(query: string): PostMeta[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return getAllPosts().filter(({ title, description, tags, content }) =>
    [title, description, ...tags, content]
      .some((field) => field.toLowerCase().includes(q))
  )
}
```

### Detour: cmdk's Built-in Filter

At first, no results appeared even after typing a search query. The cause was cmdk's built-in filter. It matches against the `value` prop of `CommandItem`, which was the slug.

When using custom search logic, `shouldFilter={false}` must be set.

```tsx
<CommandDialog shouldFilter={false}>
```

I also had to adjust shadcn's `CommandDialog` component so that it forwarded the `shouldFilter` prop internally.

### Keyboard Shortcut

`useEffect` listens for `Cmd+K` / `Ctrl+K`.

```tsx
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
```

---

## View Transitions API

I added the View Transitions API to make page changes feel smoother.

### Migrating to a Data Router

React Router's `<Link viewTransition>` prop works **only with data routers**. The app had to move from the old `<BrowserRouter>` setup to `createBrowserRouter`.

**Before:**

```tsx
// main.tsx
<BrowserRouter>
  <App />
</BrowserRouter>

// App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
</Routes>
```

**After:**

```tsx
// App.tsx
const router = createBrowserRouter([{
  element: <RootLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: "posts/:slug", element: <PostPage /> },
  ],
}])

export function App() {
  return <RouterProvider router={router} />
}
```

### Fixing the Overlap

The default View Transition crossfades the old page and the new page. For a very short moment, both pages appeared on top of each other.

I changed the old page to disappear immediately and only faded in the new page.

```css
::view-transition-old(root) {
  animation: none;
}

::view-transition-new(root) {
  animation: fade-in 100ms ease-in;
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

At 100ms, the transition was quick but still noticeable.

---

The next post covers color theme presets and post series support.
