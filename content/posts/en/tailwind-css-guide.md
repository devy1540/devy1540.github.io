---
title: "Getting Started with Tailwind CSS"
date: "2026-02-15"
description: "A quick look at the core ideas and common usage patterns of Tailwind CSS."
tags: ["css", "tailwind"]
draft: true
---

Tailwind CSS is a utility-first CSS framework. Instead of writing separate CSS files, you compose predefined classes to build UI quickly.

## What Is Utility-first CSS?

Traditional CSS often starts by naming semantic classes and assigning styles to them. Tailwind takes a different approach. It applies small single-purpose classes such as `flex`, `pt-4`, `text-center`, and `text-blue-500` directly in HTML.

```html
<!-- Traditional approach -->
<button class="submit-button">Submit</button>

<!-- Tailwind approach -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
  Submit
</button>
```

## Common Class Patterns

Here is a card layout built with Tailwind.

```tsx
function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
```

## Dark Mode Support

Tailwind makes dark mode styles easy with the `dark:` prefix. If `darkMode: 'class'` is set in `tailwind.config.js`, dark mode is controlled by whether the root HTML element has the `dark` class.

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  Content that supports dark mode
</div>
```

When first using Tailwind, the number of classes can feel noisy. But once you get used to it, styles become easier to scan, and component-level styling is naturally encapsulated, which makes maintenance simpler.
