---
title: "Building a Blog #1 - Project Overview and Tech Stack"
date: "2026-02-26"
updated: "2026-02-26"
description: "Why I rebuilt my personal blog with React 19, Vite 7, and shadcn/ui, and how the project is structured."
tags: ["react", "vite", "shadcn-ui", "blog"]
series: "Building a React Blog"
seriesOrder: 1
---

## Why I Rebuilt It

I had been running my blog with Hugo. Hugo is fast and convenient, but customization had limits. Modifying a theme requires knowing Go template syntax, and adding the interactions I wanted was not straightforward.

I decided that building the blog directly with React would let me implement the features I wanted freely, while also making the blog a useful frontend practice project.

## Tech Stack

| Category | Technology | Why I Chose It |
|----------|------------|----------------|
| Framework | **React 19** | Familiar ecosystem, access to recent features |
| Build | **Vite 7** | Fast HMR, simple configuration |
| Routing | **React Router v7** | Data router and View Transitions support |
| UI | **shadcn/ui** (new-york) | Copyable components with full customization |
| Styling | **Tailwind CSS v4** | oklch color system and utility classes |
| Deployment | **GitHub Pages** | Free and integrates well with GitHub Actions |

## Project Structure

```text
src/
├── components/     # UI components
│   └── ui/         # shadcn/ui components
├── hooks/          # custom hooks
├── layouts/        # RootLayout (sidebar + header)
├── lib/            # utilities (posts, analytics, etc.)
├── pages/          # page components
└── types/          # TypeScript types
content/
└── posts/          # markdown post files
```

## Post System

Posts are managed as Markdown files under `content/posts/{language}/`. Vite's `import.meta.glob` loads all posts at build time.

```tsx
const modules = import.meta.glob("/content/posts/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
})
```

Each post's frontmatter is parsed to extract title, date, description, tags, and series metadata. This lets the blog run entirely from Markdown files without a separate CMS or database.

## Sidebar Layout

I used the shadcn/ui `Sidebar` component to build a collapsible sidebar. The menu includes Home, Posts, Search, Tags, and About. The footer includes a dark mode toggle and a color theme selector.

---

The next post covers Command Palette search and the View Transitions API implementation.
