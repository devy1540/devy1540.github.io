<div align="center">

# Devy's Blog

**React + TypeScript + Vite로 만든 개인 기술 블로그**

[![Deploy](https://img.shields.io/github/deployments/devy1540/devy1540.github.io/github-pages?label=Deploy&logo=github)](https://devy1540.github.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[**Live Demo**](https://devy1540.github.io) · [**RSS Feed**](https://devy1540.github.io/rss.xml)

</div>

---

## Features

| | Feature | Description |
|---|---------|-------------|
| :memo: | **Markdown 블로그** | GFM, 코드 하이라이팅(Shiki), Mermaid 다이어그램 지원 |
| :mag: | **고급 검색** | 키워드, 날짜 범위, 태그 필터 기반 전체 검색 |
| :bookmark: | **시리즈 & 태그** | 글 분류 및 시리즈 네비게이션 |
| :crescent_moon: | **테마** | 다크/라이트/시스템 + 컬러 테마 커스터마이징 |
| :globe_with_meridians: | **다국어** | 한국어/영어 전환 |
| :bar_chart: | **Analytics** | Google Analytics 연동 통계 대시보드 |
| :speech_balloon: | **댓글** | Giscus (GitHub Discussions 기반) |
| :satellite: | **SEO** | Open Graph, RSS, Sitemap 자동 생성 |
| :calendar: | **예약 발행** | Draft / Scheduled 포스트 관리 |

## Tech Stack

<table>
<tr>
<td align="center" width="96"><b>Category</b></td>
<td><b>Technologies</b></td>
</tr>
<tr>
<td align="center">Frontend</td>
<td>React 19 · TypeScript · Vite 7</td>
</tr>
<tr>
<td align="center">Styling</td>
<td>Tailwind CSS 4 · shadcn/ui (Radix UI) · Lucide Icons</td>
</tr>
<tr>
<td align="center">Routing</td>
<td>React Router v7</td>
</tr>
<tr>
<td align="center">Markdown</td>
<td>react-markdown · remark-gfm · rehype-raw · rehype-slug</td>
</tr>
<tr>
<td align="center">Code</td>
<td>Shiki (dual theme: github-light / github-dark)</td>
</tr>
<tr>
<td align="center">Diagrams</td>
<td>Mermaid.js (CSS 변수 기반 동적 테마)</td>
</tr>
<tr>
<td align="center">Charts</td>
<td>Recharts</td>
</tr>
<tr>
<td align="center">Comments</td>
<td>Giscus (GitHub Discussions)</td>
</tr>
<tr>
<td align="center">Analytics</td>
<td>Google Analytics · Google Apps Script API</td>
</tr>
<tr>
<td align="center">Deploy</td>
<td>GitHub Pages</td>
</tr>
</table>

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

<details>
<summary><b>기타 명령어</b></summary>

```bash
# TypeScript 타입 체크
npm run type-check

# ESLint
npm run lint
```

</details>

## Writing Posts

`content/posts/` 디렉토리에 Markdown 파일을 추가합니다.

```yaml
---
title: "포스트 제목"
date: "2026-02-26"
description: "포스트 설명"
tags: ["react", "typescript"]
series: "시리즈 이름"       # optional
seriesOrder: 1              # optional
draft: true                 # optional
publishDate: "2026-03-15"   # optional (예약 발행)
---
```

> **Note**
> `draft: true` 또는 미래 `publishDate`가 설정된 글은 `npm run dev`에서만 배지와 함께 표시되며, 프로덕션 빌드에서는 자동 제외됩니다.

## Project Structure

```
content/posts/           # Markdown 블로그 포스트
public/                  # 정적 파일 (favicon, og-image)
src/
├── components/          # UI 컴포넌트
│   └── ui/              #   shadcn/ui
├── hooks/               # Custom hooks (theme, pageViews, meta)
├── i18n/                # 다국어 (ko/en)
├── layouts/             # 공통 레이아웃 (Sidebar + Header)
├── lib/                 # 유틸리티 (posts, analytics)
├── pages/               # 페이지 컴포넌트
└── types/               # TypeScript 타입 정의
```

## Keyboard Shortcuts

| Shortcut | Action |
|:--------:|--------|
| <kbd>Cmd</kbd> + <kbd>K</kbd> | 검색 열기 |
| <kbd>Cmd</kbd> + <kbd>B</kbd> | 사이드바 토글 |
| <kbd>Shift</kbd> + <kbd>/</kbd> | 단축키 안내 |

## License

MIT
