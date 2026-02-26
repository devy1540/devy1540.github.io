---
title: "블로그 만들기 #1 — 프로젝트 소개 & 기술 스택"
date: "2026-02-26"
description: "React 19, Vite 7, shadcn/ui로 개인 블로그를 새로 만든 이유와 기술 스택을 소개합니다."
tags: ["react", "vite", "shadcn-ui", "blog"]
series: "React 블로그 만들기"
seriesOrder: 1
---

# 블로그 만들기 #1 — 프로젝트 소개 & 기술 스택

## 왜 새로 만들었나

기존에 Hugo로 블로그를 운영하고 있었습니다. Hugo는 빠르고 간편하지만, 커스터마이징에 한계가 있었습니다. 테마를 수정하려면 Go 템플릿 문법을 알아야 하고, 원하는 인터랙션을 추가하기 어려웠습니다.

React로 직접 만들면 원하는 기능을 자유롭게 구현할 수 있고, 프론트엔드 기술을 실습하는 좋은 프로젝트가 될 것이라 판단했습니다.

## 기술 스택

| 분류 | 기술 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | **React 19** | 익숙한 생태계, 최신 기능 활용 |
| 빌드 | **Vite 7** | 빠른 HMR, 심플한 설정 |
| 라우팅 | **React Router v7** | 데이터 라우터, View Transitions 지원 |
| UI | **shadcn/ui** (new-york) | 복사해서 쓰는 컴포넌트, 커스터마이징 자유 |
| 스타일 | **Tailwind CSS v4** | oklch 색상 시스템, 유틸리티 클래스 |
| 배포 | **GitHub Pages** | 무료, GitHub Actions와 연동 |

## 프로젝트 구조

```
src/
├── components/     # UI 컴포넌트
│   └── ui/         # shadcn/ui 컴포넌트
├── hooks/          # 커스텀 훅
├── layouts/        # RootLayout (사이드바 + 헤더)
├── lib/            # 유틸리티 (posts, analytics 등)
├── pages/          # 페이지 컴포넌트
└── types/          # TypeScript 타입
content/
└── posts/          # 마크다운 포스트 파일
```

## 포스트 시스템

포스트는 `content/posts/` 디렉토리에 마크다운 파일로 관리합니다. Vite의 `import.meta.glob`을 사용해 빌드 타임에 모든 포스트를 로드합니다.

```tsx
const modules = import.meta.glob("/content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
})
```

각 포스트의 frontmatter를 파싱해서 제목, 날짜, 설명, 태그, 시리즈 정보를 추출합니다. 별도의 CMS나 데이터베이스 없이 마크다운 파일만으로 블로그를 운영할 수 있습니다.

## 사이드바 레이아웃

shadcn/ui의 `Sidebar` 컴포넌트를 활용해 접을 수 있는 사이드바를 구현했습니다. 메뉴 구성은 Home, Posts, Search, Tags, About이고, 하단에는 다크모드 토글과 컬러 테마 선택이 있습니다.

---

다음 글에서는 Command Palette 검색과 View Transitions API 구현을 다룹니다.
