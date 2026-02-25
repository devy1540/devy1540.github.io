---
title: "React Hooks 딥다이브"
date: "2026-02-26"
description: "React Hooks의 동작 원리와 실전 패턴을 깊이 있게 살펴봅니다."
tags: ["react", "hooks", "typescript"]
---

# React Hooks 딥다이브

React Hooks는 함수형 컴포넌트에서 상태 관리와 사이드 이펙트를 처리할 수 있게 해주는 핵심 기능입니다. 이 글에서는 각 Hook의 동작 원리와 실전에서 자주 쓰이는 패턴을 살펴봅니다.

## useState 완벽 이해

`useState`는 가장 기본적인 Hook입니다. 컴포넌트에 상태를 추가하고, 상태가 변경되면 리렌더링을 트리거합니다.

```tsx
const [count, setCount] = useState(0)
```

### 초기값으로 함수 전달하기

초기값 계산이 비용이 큰 경우, 함수를 전달하면 최초 렌더링에서만 실행됩니다.

```tsx
const [data, setData] = useState(() => {
  return expensiveComputation()
})
```

### 함수형 업데이트

이전 상태를 기반으로 업데이트할 때는 함수형 업데이트를 사용해야 합니다. 특히 비동기 상황에서 stale closure 문제를 방지할 수 있습니다.

```tsx
setCount(prev => prev + 1)
```

## useEffect 제대로 사용하기

`useEffect`는 컴포넌트의 사이드 이펙트를 처리합니다. API 호출, DOM 조작, 구독 설정 등이 대표적인 사용 사례입니다.

```tsx
useEffect(() => {
  const controller = new AbortController()

  fetch("/api/data", { signal: controller.signal })
    .then(res => res.json())
    .then(setData)

  return () => controller.abort()
}, [])
```

### 의존성 배열의 함정

의존성 배열에 객체나 배열을 넣으면 매 렌더링마다 새 참조가 생성되어 무한 루프가 발생할 수 있습니다.

```tsx
// 나쁜 예시 - 매 렌더링마다 실행됨
useEffect(() => {
  fetchData(options)
}, [options]) // options가 매번 새 객체

// 좋은 예시 - 개별 값으로 분리
useEffect(() => {
  fetchData({ page, limit })
}, [page, limit])
```

### cleanup 함수의 중요성

컴포넌트 언마운트 시 구독이나 타이머를 정리하지 않으면 메모리 누수가 발생합니다. cleanup 함수는 다음 effect 실행 전과 언마운트 시 호출됩니다.

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setSeconds(s => s + 1)
  }, 1000)

  return () => clearInterval(timer)
}, [])
```

## useMemo와 useCallback

렌더링 최적화를 위한 두 Hook입니다. 불필요한 재계산이나 자식 컴포넌트의 불필요한 리렌더링을 방지합니다.

### useMemo - 값 메모이제이션

비용이 큰 계산의 결과를 캐싱합니다. 의존성이 변경되지 않으면 이전 결과를 재사용합니다.

```tsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name))
}, [items])
```

### useCallback - 함수 메모이제이션

함수의 참조 동일성을 유지합니다. `React.memo`로 감싼 자식 컴포넌트에 콜백을 전달할 때 유용합니다.

```tsx
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, [])
```

### 언제 사용해야 할까?

모든 값과 함수를 메모이제이션하는 것은 오히려 성능에 해로울 수 있습니다. 다음 경우에만 사용하세요:

- 비용이 큰 계산 (정렬, 필터링, 변환)
- `React.memo`로 감싼 자식에게 전달하는 props
- 다른 Hook의 의존성으로 사용되는 값

## useRef 활용 패턴

`useRef`는 `.current` 프로퍼티에 변경 가능한 값을 보관하는 컨테이너입니다. 리렌더링을 트리거하지 않는다는 점이 `useState`와의 핵심 차이입니다.

### DOM 접근

가장 흔한 사용 사례는 DOM 요소에 직접 접근하는 것입니다.

```tsx
const inputRef = useRef<HTMLInputElement>(null)

function focusInput() {
  inputRef.current?.focus()
}

return <input ref={inputRef} />
```

### 이전 값 기억하기

렌더링 간에 이전 값을 추적할 때 유용합니다.

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
```

## 커스텀 Hook 만들기

커스텀 Hook은 로직의 재사용을 가능하게 합니다. `use`로 시작하는 함수로, 내부에서 다른 Hook을 호출할 수 있습니다.

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

## 마치며

React Hooks는 단순해 보이지만, 올바르게 사용하려면 클로저, 참조 동일성, 렌더링 사이클에 대한 이해가 필요합니다. 각 Hook의 특성을 정확히 파악하고 적절한 상황에서 사용하는 것이 중요합니다.
