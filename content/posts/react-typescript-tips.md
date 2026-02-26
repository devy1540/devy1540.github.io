---
title: "React + TypeScript 실전 팁"
date: "2026-02-20"
description: "React 프로젝트에서 TypeScript를 효과적으로 사용하는 팁들을 정리합니다."
tags: ["react", "typescript"]
series: "React 마스터하기"
seriesOrder: 1
---

# React + TypeScript 실전 팁

React와 TypeScript를 함께 사용하면 코드의 안전성과 가독성이 크게 향상됩니다. 이 글에서는 실제 프로젝트에서 자주 활용하는 TypeScript 패턴들을 소개합니다.

## Props 타입 정의

컴포넌트의 Props를 명확하게 타입으로 정의하는 것이 기본입니다. `interface`를 사용하면 IDE의 자동완성 지원을 최대한 활용할 수 있고, 잘못된 Props 전달을 컴파일 타임에 잡아낼 수 있습니다.

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
}

function Button({ label, onClick, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  )
}
```

## 제네릭 컴포넌트 활용

목록(List) 컴포넌트처럼 다양한 데이터 타입을 처리해야 하는 경우, 제네릭을 활용하면 재사용성이 높아집니다.

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

## 커스텀 훅의 반환 타입 명시

커스텀 훅을 작성할 때 반환 타입을 명시적으로 지정하면 사용하는 측에서 타입 추론이 정확해지고 코드 의도가 명확해집니다.

TypeScript를 처음 도입할 때는 `any` 타입을 피하고, 점진적으로 타입을 구체화해 나가는 방식을 권장합니다. 처음부터 완벽한 타입을 작성하려 하기보다, 코드가 동작하면서 타입을 다듬어 가는 것이 현실적인 접근법입니다.
