---
title: "Practical React + TypeScript Tips"
date: "2026-02-20"
description: "Practical TypeScript patterns that make React projects safer and easier to maintain."
tags: ["react", "typescript"]
series: "Mastering React"
seriesOrder: 1
draft: true
---

Using React with TypeScript improves both code safety and readability. This post covers TypeScript patterns that are useful in real-world React projects.

## Define Props Explicitly

The first step is to define component props clearly. Using an `interface` gives your editor better autocomplete and lets TypeScript catch invalid prop usage at compile time.

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
}

function Button({ label, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  )
}
```

## Use Generic Components

For components that work with many data shapes, such as a reusable `List`, generics help preserve type safety without duplicating component code.

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

## Type Custom Hook Return Values

When writing custom hooks, explicit return types make the API clearer for callers and improve type inference where the hook is used.

When adopting TypeScript for the first time, avoid `any` and refine types gradually. It is usually more realistic to start with working code and improve the types as the codebase becomes clearer.
