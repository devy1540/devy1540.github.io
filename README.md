<div align="center">

<br>

# devy's blog

개인 기술 블로그 — React + TypeScript + Vite

<br>

[![Deploy](https://img.shields.io/github/deployments/devy1540/devy1540.github.io/github-pages?label=deploy&logo=github&style=flat-square)](https://devy1540.github.io)
[![React](https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

[Live](https://devy1540.github.io) &nbsp;&middot;&nbsp; [RSS](https://devy1540.github.io/rss.xml)

<br>

</div>

## Features

<table>
<tr>
<td>:memo: <b>Markdown</b> · Shiki · Mermaid</td>
<td>:crescent_moon: <b>Theme</b> · Dark / Light / System</td>
</tr>
<tr>
<td>:mag: <b>Search</b> · keyword · date · tag</td>
<td>:globe_with_meridians: <b>i18n</b> · 한국어 / English</td>
</tr>
<tr>
<td>:bookmark: <b>Series & Tags</b></td>
<td>:bar_chart: <b>Analytics</b> dashboard</td>
</tr>
<tr>
<td>:speech_balloon: <b>Comments</b> via Giscus</td>
<td>:satellite: <b>SEO</b> · OG · RSS · Sitemap</td>
</tr>
</table>

## Quick Start

```bash
npm install
npm run dev
```

## Writing Posts

`content/posts/`에 마크다운 파일 추가:

```yaml
---
title: "제목"
date: "2025-01-01"
description: "설명"
tags: ["react", "typescript"]
series: "시리즈명"          # optional
seriesOrder: 1              # optional
draft: true                 # optional
publishDate: "2025-12-01"   # optional
---
```

## Structure

```
content/posts/        블로그 포스트 (.md)
src/
├── components/       UI 컴포넌트
├── hooks/            커스텀 훅
├── i18n/             다국어
├── layouts/          레이아웃
├── lib/              유틸리티
└── pages/            페이지
```

## Stack

`React 19` · `TypeScript` · `Vite 7` · `Tailwind CSS 4` · `shadcn/ui` · `React Router v7` · `Shiki` · `Mermaid.js` · `Recharts` · `Giscus` · `GitHub Pages`

## License

MIT
