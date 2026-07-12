---
title: "Tailwind CSS 시작하기"
date: "2026-02-15"
description: "Tailwind CSS의 기본 개념과 활용법을 알아봅니다."
tags: ["css", "tailwind"]
draft: true
---

Tailwind CSS는 유틸리티 퍼스트(Utility-First) 방식의 CSS 프레임워크입니다. 미리 정의된 클래스들을 조합해 스타일을 구성하기 때문에, 별도의 CSS 파일을 작성하지 않고도 빠르게 UI를 만들 수 있습니다.

## 유틸리티 퍼스트란?

전통적인 CSS 작성 방식은 의미론적인 클래스 이름을 짓고 해당 클래스에 스타일을 부여합니다. 반면 Tailwind는 `flex`, `pt-4`, `text-center`, `text-blue-500`처럼 하나의 역할만 하는 작은 클래스를 직접 HTML에 적용합니다.

```html
<!-- 전통적인 방식 -->
<button class="submit-button">제출</button>

<!-- Tailwind 방식 -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
  제출
</button>
```

## 자주 쓰는 클래스 패턴

카드 레이아웃을 Tailwind로 구성하는 예시입니다.

```tsx
function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
```

## 다크 모드 지원

Tailwind는 `dark:` 접두사를 통해 다크 모드 스타일을 손쉽게 적용할 수 있습니다. `tailwind.config.js`에서 `darkMode: 'class'`로 설정하면 HTML 루트 요소의 `dark` 클래스 유무에 따라 다크 모드가 전환됩니다.

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  다크 모드를 지원하는 컨텐츠
</div>
```

Tailwind를 처음 사용할 때는 클래스가 많아 보여 가독성이 걱정될 수 있지만, 익숙해지면 오히려 스타일 파악이 더 빠르고 컴포넌트 단위로 스타일이 캡슐화되어 유지보수가 편리합니다.
