---
title: "블로그 만들기 #6 — UX 개선 & SEO 마무리"
date: "2026-02-26"
description: "글 목록 연도별 그룹핑, 모바일 사이드바 UX 개선, robots.txt, OG 이미지 등 블로그의 완성도를 높이는 작업들을 정리합니다."
tags: ["react", "seo", "ux", "blog"]
series: "React 블로그 만들기"
seriesOrder: 6
---

# 블로그 만들기 #6 — UX 개선 & SEO 마무리

기능 구현이 어느 정도 마무리된 후, 실제로 블로그를 사용하면서 느낀 불편함과 부족한 점을 개선한 내용입니다. 큰 기능 추가보다는 **완성도를 높이는 작은 개선**들의 모음입니다.

## 1. 글 목록 연도별 그룹핑

### 문제

글이 많아지면서 PostsPage의 전체 리스트가 길어졌습니다. 날짜순으로 정렬되어 있긴 하지만, 시각적으로 "이 글이 언제 쓴 건지" 한눈에 파악하기 어려웠습니다.

### 해결

글을 연도별로 묶어서 헤더를 표시하도록 개선했습니다.

```tsx
const groupedByYear = useMemo(() => {
  const groups = new Map<string, PostMeta[]>()
  for (const post of posts) {
    const year = post.date.slice(0, 4)
    const list = groups.get(year)
    if (list) {
      list.push(post)
    } else {
      groups.set(year, [post])
    }
  }
  return groups
}, [posts])
```

`useMemo`로 캐싱하고, `Map`의 삽입 순서가 보장되는 특성을 활용합니다. 이미 날짜순으로 정렬된 데이터이므로 연도도 자연스럽게 내림차순이 됩니다.

렌더링은 기존 `PostList` 컴포넌트를 연도별로 반복 호출하는 방식입니다.

```tsx
{[...groupedByYear.entries()].map(([year, yearPosts]) => (
  <div key={year} className="mb-8">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
      {year}
    </h2>
    <PostList posts={yearPosts} viewMode={viewMode} />
  </div>
))}
```

기존 `PostList` 컴포넌트는 수정하지 않았습니다. 리스트/그리드 뷰 모두에서 동일하게 동작합니다.

### 태그 필터는 넣지 않았다

처음에는 상단에 태그 칩을 나열해서 필터링하는 기능도 추가했었습니다. 하지만 이미 **SearchPage**(키워드 + 날짜 + 태그 복합 검색)와 **TagsPage**(태그별 글 목록)가 동일한 역할을 하고 있어서 제거했습니다. 기능이 겹치면 사용자가 "어디서 해야 하지?"라고 혼란스러워합니다.

## 2. 모바일 사이드바 자동 닫기

### 문제

모바일에서 햄버거 메뉴를 열고 메뉴 항목을 선택하면, 페이지는 이동하는데 사이드바가 그대로 열려 있었습니다. 매번 수동으로 닫아야 했습니다.

### 원인

shadcn/ui의 `Sidebar` 컴포넌트는 모바일에서 `Sheet`(오버레이)로 렌더링됩니다. `openMobile` 상태를 `setOpenMobile`로 제어하는데, NavLink 클릭 시 이 상태를 닫아주는 코드가 없었습니다.

### 해결

`Sidebar.tsx`에서 `useSidebar` 훅을 가져와 NavLink의 `onClick`에 닫기 로직을 추가했습니다.

```tsx
const { isMobile, setOpenMobile } = useSidebar()

// NavLink에 onClick 추가
<NavLink
  to={item.to}
  viewTransition
  onClick={() => isMobile && setOpenMobile(false)}
>
```

`isMobile` 체크를 통해 데스크톱에서는 기존 동작에 영향을 주지 않습니다. 단 3줄의 변경으로 모바일 네비게이션 UX가 크게 개선됩니다.

## 3. robots.txt 추가

### 왜 필요한가

[이전 글](/posts/blog-dev-04-search-seo)에서 `sitemap.xml`을 빌드 타임에 자동 생성하도록 구현했습니다. 하지만 검색 엔진 크롤러가 sitemap의 위치를 알려면 `robots.txt`에 명시하는 것이 좋습니다.

### 구현

`public/robots.txt` 파일 하나를 추가합니다. Vite는 `public/` 디렉토리의 파일을 그대로 빌드 결과에 복사합니다.

```
User-agent: *
Allow: /
Sitemap: https://devy1540.github.io/sitemap.xml
```

- `User-agent: *` — 모든 크롤러에 적용
- `Allow: /` — 전체 사이트 크롤링 허용
- `Sitemap` — sitemap 위치 안내

### Google Search Console 등록

robots.txt와 sitemap을 준비한 후, [Google Search Console](https://search.google.com/search-console)에서 사이트를 등록합니다.

1. **URL 접두어** 방식으로 `https://devy1540.github.io` 등록 (GitHub Pages는 DNS 인증 불가)
2. 소유권 인증 완료
3. Sitemaps 메뉴에서 `https://devy1540.github.io/sitemap.xml` 제출

Google이 색인하는 데 며칠~몇 주 걸릴 수 있으므로 바로 검색 결과에 나타나지 않아도 정상입니다.

## 4. OG 이미지 추가

### 문제

카카오톡이나 슬랙에서 블로그 URL을 공유하면 제목과 설명만 나오고 **썸네일 이미지가 없었습니다.**

### 원인

`useMetaTags` 훅에서 `og:title`, `og:description` 등은 설정하고 있었지만, `og:image` 메타태그가 빠져 있었습니다.

### 해결

1200x630px 크기의 대표 이미지를 `public/og-image.png`에 추가하고, `useMetaTags`에 `og:image` 메타태그를 설정합니다.

```tsx
setMeta("og:image", `${BASE_URL}/og-image.png`)
setMeta("og:image:width", "1200")
setMeta("og:image:height", "630")
```

### 주의사항

- OG 이미지는 **PNG 또는 JPG**만 지원됩니다. SVG는 대부분의 플랫폼에서 인식하지 못합니다.
- 권장 사이즈는 **1200x630px**입니다. 이보다 작으면 일부 플랫폼에서 썸네일이 작게 표시됩니다.
- 카카오톡은 캐시가 강해서, 이미지를 변경한 후에도 이전 이미지가 보일 수 있습니다. [카카오 캐시 초기화 도구](https://developers.kakao.com/tool/debugger/sharing)에서 URL을 입력해 캐시를 삭제할 수 있습니다.

## 고려했지만 넘어간 것들

블로그의 완성도를 높이기 위해 여러 개선 사항을 검토했지만, 현재 규모에서는 과한 것들이 있었습니다.

| 항목 | 판단 | 이유 |
|------|------|------|
| 코드 스플리팅 (shiki) | 보류 | gzip 1.6MB 수준, 체감 문제 없음 |
| PWA (오프라인 읽기) | 스킵 | 개인 블로그에서 오버엔지니어링 |
| 검색 인덱스 최적화 | 스킵 | 글 수십~수백 편 수준에서 불필요 |
| 이미지 최적화 | 보류 | 텍스트 위주 블로그라 효과 적음 |
| 사이드바 카테고리 트리 | 스킵 | 태그 + 시리즈가 충분한 분류 역할 |
| 포스트 카드 썸네일 | 보류 | 모든 글에 이미지를 준비하는 부담 |

"나중에 필요할 때" 하는 것이 아니라 **"실제로 불편할 때"** 하는 것이 개인 프로젝트에서는 올바른 접근이라고 생각합니다.

## 마치며

이번 글에서 다룬 개선들은 각각 코드 변경량이 적지만, 합치면 사용자 경험이 체감될 정도로 달라집니다.

- 연도별 그룹핑 → 글 목록의 가독성 향상
- 모바일 사이드바 자동 닫기 → 네비게이션 UX 개선
- robots.txt → 검색 엔진 크롤링 안내
- OG 이미지 → 링크 공유 시 시각적 표현

"기능을 많이 만드는 것"보다 "있는 기능을 잘 다듬는 것"이 더 중요한 단계가 있습니다. 이 블로그도 이제 그 단계에 들어선 것 같습니다.

---

> 이 블로그의 소스 코드는 [GitHub](https://github.com/devy1540/devy1540.github.io)에서 확인할 수 있습니다.
