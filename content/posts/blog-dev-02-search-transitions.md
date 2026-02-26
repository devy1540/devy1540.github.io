---
title: "블로그 만들기 #2 — Command Palette 검색 & View Transitions"
date: "2026-02-26"
description: "cmdk로 Cmd+K 검색을 구현하고, View Transitions API로 페이지 전환 애니메이션을 적용한 과정입니다."
tags: ["react", "cmdk", "view-transitions", "blog"]
series: "React 블로그 만들기"
seriesOrder: 2
---

## Command Palette 검색 (Cmd+K)

VS Code나 Raycast처럼 `Cmd+K`로 빠르게 검색할 수 있는 Command Palette를 구현했습니다.

### 사용한 라이브러리

- `cmdk` — Command Palette 핵심 라이브러리
- shadcn/ui의 `CommandDialog`, `CommandInput`, `CommandList` 컴포넌트

### 검색 로직

`searchPosts()` 함수에서 제목, 설명, 태그, 본문을 대소문자 무시로 검색합니다. 빌드 타임에 이미 메모리에 로드된 데이터를 사용하므로 비동기 처리나 디바운스가 필요 없습니다.

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

### 삽질: cmdk의 내장 필터

처음에는 검색어를 입력해도 결과가 표시되지 않는 문제가 있었습니다. 원인은 cmdk의 내장 필터가 `CommandItem`의 `value` 속성(slug)으로 매칭하기 때문이었습니다.

자체 검색 로직을 사용할 때는 반드시 `shouldFilter={false}`를 설정해야 합니다.

```tsx
<CommandDialog shouldFilter={false}>
```

또한 shadcn의 `CommandDialog` 컴포넌트에 `shouldFilter` prop을 전달하도록 내부 수정이 필요했습니다.

### 키보드 단축키

`useEffect`로 `Cmd+K` / `Ctrl+K` 이벤트를 감지합니다.

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

페이지 전환 시 자연스러운 애니메이션을 위해 View Transitions API를 적용했습니다.

### 데이터 라우터 마이그레이션

React Router의 `<Link viewTransition>` prop은 **데이터 라우터에서만** 동작합니다. 기존 `<BrowserRouter>`에서 `createBrowserRouter`로 마이그레이션이 필요했습니다.

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

### 겹침 현상 해결

기본 View Transition은 old 페이지와 new 페이지가 크로스페이드됩니다. 이때 아주 잠깐 두 페이지가 겹쳐 보이는 현상이 있었습니다.

old 페이지는 즉시 사라지고, new 페이지만 페이드인하도록 수정했습니다.

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

100ms로 설정하니 빠르면서도 전환이 느껴지는 적절한 시간이었습니다.

---

다음 글에서는 컬러 테마 프리셋과 포스트 시리즈 기능을 다룹니다.
