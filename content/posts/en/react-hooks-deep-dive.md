---
title: "React Hooks Deep Dive"
date: "2026-02-26"
updated: "2026-02-26"
description: "A closer look at how React Hooks work and the practical patterns I use in real projects."
tags: ["react", "hooks", "typescript"]
series: "Mastering React"
seriesOrder: 2
draft: false
---

React Hooks are a core feature that lets function components handle state and side effects. This post looks at how common Hooks work and the patterns that are useful in practice.

## Understanding useState

`useState` is the most basic Hook. It adds state to a component and triggers a re-render when that state changes.

```tsx
const [count, setCount] = useState(0)
```

### Passing a Function as the Initial Value

If calculating the initial value is expensive, pass a function. React will run it only during the initial render.

```tsx
const [data, setData] = useState(() => {
  return expensiveComputation()
})
```

### Functional Updates

When the next state depends on the previous state, use a functional update. This is especially useful for avoiding stale closure problems in asynchronous situations.

```tsx
setCount(prev => prev + 1)
```

## Using useEffect Correctly

`useEffect` handles side effects in a component. API calls, DOM manipulation, and subscriptions are common examples.

```tsx
useEffect(() => {
  const controller = new AbortController()

  fetch("/api/data", { signal: controller.signal })
    .then(res => res.json())
    .then(setData)

  return () => controller.abort()
}, [])
```

### Dependency Array Pitfalls

Putting objects or arrays directly into the dependency array can create a new reference on every render and cause an infinite loop.

```tsx
// Bad example - runs on every render
useEffect(() => {
  fetchData(options)
}, [options]) // options is a new object every time

// Good example - split into individual values
useEffect(() => {
  fetchData({ page, limit })
}, [page, limit])
```

### Why Cleanup Matters

If subscriptions or timers are not cleaned up when a component unmounts, memory leaks can occur. The cleanup function runs before the next effect and when the component unmounts.

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setSeconds(s => s + 1)
  }, 1000)

  return () => clearInterval(timer)
}, [])
```

## useMemo and useCallback

These two Hooks are used for render optimization. They prevent unnecessary recalculation or unnecessary re-renders of child components.

### useMemo - Memoizing Values

`useMemo` caches the result of an expensive calculation. If dependencies do not change, React reuses the previous result.

```tsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name))
}, [items])
```

### useCallback - Memoizing Functions

`useCallback` preserves function reference identity. It is useful when passing callbacks to child components wrapped with `React.memo`.

```tsx
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, [])
```

### When Should You Use Them?

Memoizing every value and function can hurt performance instead of helping. Use them mainly in these cases:

- Expensive calculations such as sorting, filtering, or transforming
- Props passed to children wrapped with `React.memo`
- Values used as dependencies of other Hooks

## useRef Patterns

`useRef` is a container that stores a mutable value in its `.current` property. The key difference from `useState` is that changing a ref does not trigger a re-render.

### DOM Access

The most common use case is direct access to a DOM element.

```tsx
const inputRef = useRef<HTMLInputElement>(null)

function focusInput() {
  inputRef.current?.focus()
}

return <input ref={inputRef} />
```

### Remembering a Previous Value

Refs are useful when you need to track a previous value across renders.

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
```

## Building Custom Hooks

Custom Hooks make logic reusable. They are functions that start with `use`, and they can call other Hooks internally.

### useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

### useDebounce

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

### useMediaQuery

```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    function handler(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [query])

  return matches
}
```

## Closing

React Hooks look simple, but using them correctly requires understanding closures, reference identity, and the rendering cycle. The important part is knowing each Hook's characteristics and using it in the right situation.
