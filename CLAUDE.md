# Devy's Blog - Project Guide

## Overview
React + TypeScript + Vite로 구축된 개인 기술 블로그. GitHub Pages(`devy1540.github.io`)에 배포.
블로그 글은 Markdown 파일로 관리하며, 빌드 타임에 `import.meta.glob`으로 로드.

## Tech Stack
- **Framework**: React 19, TypeScript 5.8, Vite 7
- **Routing**: react-router-dom v7 (`createBrowserRouter`)
- **UI**: shadcn/ui (Radix UI 기반), Tailwind CSS v4, lucide-react 아이콘
- **Markdown**: react-markdown + remark-gfm + rehype-raw + rehype-slug
- **Code Highlight**: Shiki (github-light/github-dark 테마, dual theme)
- **Diagram**: Mermaid.js (CSS 변수 기반 동적 테마)
- **Charts**: Recharts (Analytics 페이지)
- **Comments**: Giscus (GitHub Discussions 기반)
- **Analytics**: Google Analytics (gtag), Google Apps Script API로 조회수 조회

## Project Structure

```
/
├── content/posts/          # 블로그 글 (.md, frontmatter 포함)
├── public/                 # 정적 파일 (favicon, og-image, robots.txt)
├── src/
│   ├── main.tsx            # 엔트리포인트 (ThemeProvider > LanguageProvider > App)
│   ├── App.tsx             # 라우터 정의
│   ├── layouts/
│   │   └── RootLayout.tsx  # 공통 레이아웃 (Sidebar + Header + Outlet)
│   ├── pages/
│   │   ├── HomePage.tsx        # 메인: 최신글, 인기글, 통계
│   │   ├── PostsPage.tsx       # 글 목록 (리스트/그리드 뷰)
│   │   ├── PostPage.tsx        # 글 상세 (마크다운 렌더링, TOC, 댓글)
│   │   ├── TagsPage.tsx        # 태그별 글 목록
│   │   ├── SeriesPage.tsx      # 시리즈별 글 목록
│   │   ├── SearchPage.tsx      # 고급 검색 (키워드, 날짜, 태그)
│   │   ├── AnalyticsPage.tsx   # 블로그 통계 대시보드
│   │   ├── AboutPage.tsx       # 소개 (프로필, 스킬, 경력, 프로젝트 목록)
│   │   ├── ProjectDetailPage.tsx # 프로젝트 상세 (/about/projects/:slug)
│   │   ├── NotFoundPage.tsx
│   │   └── ErrorPage.tsx
│   ├── components/
│   │   ├── Sidebar.tsx         # 사이드 네비게이션 (collapsible icon 지원)
│   │   ├── SearchCommand.tsx   # Cmd+K 검색 (cmdk 기반)
│   │   ├── CodeBlock.tsx       # 코드 하이라이팅 (Shiki + Mermaid)
│   │   ├── TableOfContents.tsx # 목차
│   │   ├── Comments.tsx        # Giscus 댓글
│   │   ├── PostList.tsx        # 글 목록 컴포넌트
│   │   ├── SeriesNavigator.tsx # 시리즈 네비게이션
│   │   ├── ThemeToggle.tsx     # Light/Dark/System 토글
│   │   ├── ColorThemeSelector.tsx # 컬러 테마 선택
│   │   ├── LanguageToggle.tsx  # ko/en 토글
│   │   ├── KeyboardShortcuts.tsx # 단축키 안내 모달
│   │   ├── DailyVisitsChart.tsx  # 일별 방문자 차트
│   │   ├── VisitorCounter.tsx    # 방문자 카운터
│   │   ├── DatePicker.tsx
│   │   ├── ScrollToTop.tsx       # 라우트 변경 시 스크롤 리셋
│   │   ├── ScrollToTopButton.tsx # 스크롤 투 탑 버튼
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── hooks/
│   │   ├── useTheme.tsx      # 테마 Context (light/dark/system)
│   │   ├── usePageViews.ts   # GA 조회수 (Google Apps Script API, 1시간 캐시)
│   │   ├── useMetaTags.ts    # SEO 메타태그 동적 설정
│   │   └── use-mobile.ts     # 모바일 감지
│   ├── i18n/
│   │   ├── index.ts          # re-export
│   │   ├── useLanguage.tsx   # 언어 Context (ko/en, localStorage 저장)
│   │   └── translations.ts  # 번역 데이터 (ko, en)
│   └── lib/
│       ├── posts.ts          # 글 파싱/조회 (frontmatter 파싱, 검색, 시리즈)
│       ├── analytics.ts      # GA 이벤트 트래킹 유틸
│       ├── reading-time.ts   # 읽기 시간 계산
│       └── utils.ts          # cn() 유틸
├── vite.config.ts            # Vite 설정 + RSS/Sitemap/404 빌드 플러그인
├── components.json           # shadcn/ui 설정
└── package.json
```

## Routes
| Path | Page | Description |
|------|------|-------------|
| `/` | HomePage | 최신글 5개, 인기글 Top 5, 블로그 통계 |
| `/posts` | PostsPage | 전체 글 목록 (리스트/그리드) |
| `/posts/:slug` | PostPage | 글 상세 (마크다운 렌더링) |
| `/tags` | TagsPage | 태그별 필터링 |
| `/series` | SeriesPage | 시리즈별 필터링 |
| `/search` | SearchPage | 고급 검색 |
| `/analytics` | AnalyticsPage | 블로그 통계 대시보드 |
| `/about` | AboutPage | 소개 페이지 |
| `/about/projects/:slug` | ProjectDetailPage | 프로젝트 상세 |

## Key Patterns

### Blog Post (Markdown Frontmatter)
```yaml
---
title: "제목"
date: "2025-01-01"
description: "설명"
tags: ["tag1", "tag2"]
series: "시리즈명"       # optional
seriesOrder: 1           # optional
draft: true              # optional - dev에서만 표시
publishDate: "2025-12-01" # optional - 예약 발행
---
```

### i18n
- `useT()` 훅으로 번역 객체 접근: `const t = useT()`
- `useLanguage()` 훅으로 언어 전환: `const { language, setLanguage } = useLanguage()`
- 번역 키 추가 시 `src/i18n/translations.ts`의 `Translations` 인터페이스, `ko`, `en` 모두 수정

### Theme
- `useTheme()` 훅: `theme` (light/dark/system), `resolvedTheme` (light/dark), `setTheme()`
- CSS: `dark` 클래스 기반 (Tailwind dark mode)
- 컬러 테마: `document.documentElement.dataset.color`로 관리

### Post Data
- `content/posts/*.md` 파일을 `import.meta.glob`으로 eager 로드
- `src/lib/posts.ts`에서 frontmatter 파싱, 정렬, 필터링, 검색 제공
- draft/scheduled 글은 production 빌드에서 자동 필터링

### SEO
- `useMetaTags()` 훅으로 페이지별 title, description, OG 태그 설정
- `vite.config.ts`에서 빌드 시 sitemap.xml, rss.xml 자동 생성
- SPA 404 fallback: index.html → 404.html 복사

### Page Views
- Google Apps Script API로 GA 데이터 조회
- `usePageViews()` 훅: sessionStorage 캐시 (TTL 1시간)
- 메모리 + sessionStorage 이중 캐시

### About Page Data
- 경력/프로젝트 데이터는 `AboutPage.tsx`의 `COMPANIES` 상수에 정의
- 프로젝트 상세 데이터는 `ProjectDetailPage.tsx`의 `PROJECTS` 상수에 정의
- 프로젝트 추가 시 두 파일 모두 수정 필요

## Commands
```bash
npm run dev        # 개발 서버 (Vite)
npm run build      # 프로덕션 빌드 (tsc + vite build + sitemap/rss/404 생성)
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint 실행
npm run type-check # TypeScript 타입 체크
```

## Deployment
- GitHub Pages: `devy1540.github.io`
- BASE_URL: `https://devy1540.github.io`
- 댓글: Giscus → `devy1540/devy1540.github.io` repo의 GitHub Discussions

## Code Conventions
- 함수 컴포넌트: `export function ComponentName()` (named export)
- 경로 alias: `@/` → `src/`
- UI 컴포넌트: `src/components/ui/` (shadcn/ui, 직접 수정 가능)
- Vite 빌드 시 manual chunks: shiki, markdown, router, ui 분리
