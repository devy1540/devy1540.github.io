---
title: "Building a Modern Blog with React"
slug: "building-modern-blog"
isDraft: false
createdAt: "2024-12-17T09:00:00Z"
updatedAt: "2024-12-17T14:30:00Z"
publishedAt: "2024-12-17T10:00:00Z"
category: "Project"
tags: ["react", "blog", "tutorial", "markdown"]
excerpt: "Step-by-step guide to creating a modern blog with React, TypeScript, and Markdown."
thumbnail: "/images/blog-project.png"
---

# Building a Modern Blog with React

Creating a blog is a great way to learn web development. In this guide, we'll build a modern blog using React, TypeScript, and Markdown.

## Project Setup

First, let's set up our project with Vite:

```bash
npm create vite@latest my-blog -- --template react-ts
cd my-blog
npm install
```

## Installing Dependencies

We'll need several packages for our blog:

```bash
npm install react-router-dom react-markdown gray-matter
npm install -D @types/react-router-dom
```

## Project Structure

Organize your project like this:

```
src/
├── components/
│   ├── Layout.tsx
│   ├── PostList.tsx
│   └── PostDetail.tsx
├── pages/
│   ├── Home.tsx
│   └── Post.tsx
├── content/
│   └── posts/
│       └── *.md
└── utils/
    └── markdown.ts
```

## Creating the Post Component

Here's a simple post component:

```tsx
import ReactMarkdown from 'react-markdown';

function PostDetail({ content }: { content: string }) {
  return (
    <article className="prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
```

## Routing

Set up routing with React Router:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:slug" element={<Post />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Conclusion

With these foundations, you can build a fully functional blog. Add features like categories, tags, and search to make it even better!
