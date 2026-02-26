# Devy's Blog

React + TypeScript + Vite로 만든 개인 기술 블로그입니다.

**Live**: https://devy1540.github.io

## Tech Stack

- **Framework**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS 4, shadcn/ui (Radix UI)
- **Routing**: React Router v7
- **Markdown**: react-markdown, remark-gfm, rehype-raw, rehype-slug
- **Code Highlight**: Shiki
- **Diagrams**: Mermaid
- **Charts**: Recharts
- **Comments**: Giscus
- **i18n**: Custom implementation (ko/en)
- **Deploy**: GitHub Pages

## Features

- Markdown 기반 블로그 포스팅 (GFM, 코드 하이라이팅, Mermaid 다이어그램)
- 시리즈/태그 분류 및 전체 검색 (고급 검색 포함)
- 다크/라이트 테마 + 컬러 테마 커스터마이징
- 한국어/영어 다국어 지원
- Google Analytics 연동 분석 대시보드
- RSS 피드 및 Sitemap 자동 생성
- Draft / 예약 발행 (개발 모드에서만 표시)
- 키보드 단축키 지원
- SEO 최적화 (Open Graph, robots meta)

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Writing Posts

`content/posts/` 디렉토리에 Markdown 파일을 추가합니다.

```yaml
---
title: "포스트 제목"
date: "2026-02-26"
description: "포스트 설명"
tags: ["react", "typescript"]
series: "시리즈 이름"
seriesOrder: 1
---
```

### Draft / 예약 발행

```yaml
---
title: "작성 중인 글"
date: "2026-02-26"
draft: true
---
```

```yaml
---
title: "예약 발행 글"
date: "2026-02-26"
publishDate: "2026-03-15"
---
```

| 환경 | draft / 예약 포스트 |
|------|---------------------|
| `npm run dev` | 목록에 DRAFT/SCHEDULED 배지와 함께 표시 |
| `npm run build` | 목록/검색/태그/시리즈/RSS/sitemap 모두 제외 |

## Project Structure

```
├── content/posts/       # Markdown 블로그 포스트
├── public/              # Static assets
├── src/
│   ├── components/      # UI 컴포넌트
│   │   └── ui/          # shadcn/ui 컴포넌트
│   ├── hooks/           # Custom hooks
│   ├── i18n/            # 다국어 번역
│   ├── lib/             # 유틸리티 (posts, analytics, utils)
│   ├── pages/           # 페이지 컴포넌트
│   └── types/           # TypeScript 타입 정의
└── vite.config.ts       # Vite 설정 (RSS, Sitemap, SPA 404)
```

## Keyboard Shortcuts

| 단축키 | 동작 |
|--------|------|
| `⌘/Ctrl + K` | 검색 열기 |
| `⌘/Ctrl + B` | 사이드바 토글 |
| `Shift + /` | 단축키 안내 |
