---
title: "블로그 만들기 #3 — 컬러 테마 프리셋 & 포스트 시리즈"
date: "2026-02-26"
description: "shadcn/ui의 oklch 색상 시스템으로 6가지 컬러 프리셋을 만들고, 포스트 시리즈 기능을 구현한 과정입니다."
tags: ["react", "shadcn-ui", "css", "blog"]
series: "React 블로그 만들기"
seriesOrder: 3
---

## 컬러 테마 프리셋

다크/라이트 모드 외에 블로그 전체 색감을 바꿀 수 있는 컬러 프리셋을 추가했습니다. shadcn/ui의 테마 시스템에서 영감을 받았습니다.

### 6가지 프리셋

Neutral, Blue, Green, Rose, Orange, Violet — 각 프리셋은 `--primary`, `--ring`, `--sidebar-primary` 등의 CSS 커스텀 속성을 오버라이드합니다.

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

### 구현 방식

`document.documentElement`에 `data-color` 속성을 설정하고, `localStorage`에 저장합니다. 사이드바에 팔레트 아이콘 드롭다운으로 선택할 수 있습니다.

```tsx
function applyColor(value: string) {
  if (value) {
    document.documentElement.setAttribute("data-color", value)
  } else {
    document.documentElement.removeAttribute("data-color")
  }
}
```

### FOUC 방지

페이지 로드 시 기본 색상이 잠깐 보이는 FOUC(Flash of Unstyled Content) 문제가 있습니다. `index.html`에 인라인 스크립트를 추가해 `<body>` 렌더링 전에 테마를 적용합니다.

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

### 사이드바 접힘 상태 대응

사이드바가 접혔을 때 테마 토글과 컬러 선택 아이콘이 가로로 나열되면 넘침 현상이 발생했습니다. `group-data-[state=collapsed]:flex-col`로 세로 배치하여 해결했습니다.

---

## 포스트 시리즈 기능

연관된 포스트를 시리즈로 묶어 순서대로 탐색할 수 있는 기능입니다. 지금 읽고 있는 이 글도 "React 블로그 만들기" 시리즈의 일부입니다.

### frontmatter 설정

```yaml
---
title: "블로그 만들기 #1 — 프로젝트 소개"
series: "React 블로그 만들기"
seriesOrder: 1
---
```

`series`는 시리즈 이름, `seriesOrder`는 시리즈 내 순서입니다. 같은 `series` 값을 가진 포스트들이 자동으로 그룹핑됩니다.

### 시리즈 네비게이터

포스트 상단에 접었다 펼 수 있는 시리즈 목록이 표시됩니다. 현재 글이 하이라이트되고, 다른 글을 클릭하면 이동합니다.

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
      {/* 접었다 펼 수 있는 목록 */}
    </div>
  )
}
```

### 삽질: 목차(TOC)가 갱신되지 않는 문제

시리즈 내 다른 글을 클릭하면 URL이 `/posts/slug-a`에서 `/posts/slug-b`로 바뀌지만, 같은 라우트 패턴(`/posts/:slug`)이라 React가 컴포넌트를 리마운트하지 않습니다.

이로 인해 목차(TableOfContents)가 이전 글의 헤딩을 보여주는 문제가 있었습니다. `key` prop으로 slug가 바뀔 때마다 강제 리마운트하여 해결했습니다.

```tsx
<TableOfContents key={slug} />
```

---

다음 글에서는 고급 검색 페이지와 SEO 최적화를 다룹니다.
