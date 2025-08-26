# Database Schema

## 파일 시스템 구조

```
content/
├── posts/                    # 블로그 포스트 (마크다운)
│   ├── 2024-01-15-hello-world.md
│   ├── 2024-01-20-react-tips.md
│   └── draft-new-post-idea.md
├── pages/                    # 정적 페이지
│   ├── about.md
│   └── portfolio.md
├── categories.json          # 카테고리 메타데이터
└── config.json             # 블로그 설정

public/
├── images/                  # 업로드된 이미지
│   ├── 2024-01-15-screenshot.png
│   └── 2024-01-20-diagram.jpg
└── assets/                 # 기타 정적 자산
```

## 포스트 파일 형식 (Markdown with Frontmatter)

```markdown
---
title: "React 성능 최적화 팁 10가지"
slug: "react-performance-tips"
isDraft: false
createdAt: "2024-01-20T09:00:00Z"
updatedAt: "2024-01-22T14:30:00Z"
publishedAt: "2024-01-20T10:00:00Z"
category: "development"
tags: ["react", "performance", "javascript"]
excerpt: "React 애플리케이션의 성능을 향상시키는 실용적인 팁들을 소개합니다."
thumbnail: "/images/react-performance.png"
readingTime: 8
metadata:
  ogTitle: "React 성능 최적화 완벽 가이드"
  ogDescription: "실무에서 바로 적용 가능한 React 최적화 기법"
  ogImage: "/images/react-performance-og.png"
---

# React 성능 최적화 팁 10가지

포스트 본문 내용...
```

## 카테고리 데이터 (categories.json)

```json
{
  "categories": [
    {
      "id": "development",
      "name": "개발",
      "slug": "development",
      "description": "프로그래밍과 개발 관련 포스트",
      "postCount": 0
    }
  ]
}
```

## 블로그 설정 (config.json)

```json
{
  "blog": {
    "title": "개인 개발 블로그",
    "description": "개발 여정을 기록하는 공간",
    "author": {
      "name": "Your Name",
      "email": "your.email@example.com",
      "github": "your-github-username"
    }
  }
}
```
