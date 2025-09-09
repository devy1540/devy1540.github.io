# UI 일관성 수정: 페이지 제목 정렬 통일

## 문제점

페이지별로 제목 정렬이 일관되지 않아 사용자 경험에 혼란을 야기했습니다.

### 발견된 불일치 사항
- **HomePage**: 제목 가운데 정렬 ✅
- **AboutPage**: 제목 가운데 정렬 ✅  
- **SettingsPage**: 제목 왼쪽 정렬 ❌
- **DraftsPage**: 제목 왼쪽 정렬 ❌

## 해결 방법

모든 페이지 제목을 가운데 정렬로 통일하여 일관된 UI 경험을 제공합니다.

### 수정된 파일들

#### 1. SettingsPage.tsx
```diff
- <h1 className="text-4xl font-bold">Settings</h1>
+ <h1 className="text-4xl font-bold text-center">Settings</h1>
```

**위치**: `src/pages/SettingsPage.tsx:27`

#### 2. DraftsPage.tsx
```diff
- <div className="mb-8">
+ <div className="mb-8 text-center">
    <h1 className="text-3xl font-bold tracking-tight mb-2">초안 목록</h1>
    <p className="text-muted-foreground">
      저장된 초안들을 관리하고 편집을 계속할 수 있습니다.
    </p>
  </div>
```

**위치**: `src/pages/DraftsPage.tsx:44`

## 결과

### Before
- Settings 페이지: 제목이 왼쪽에 치우쳐 보임
- Drafts 페이지: 제목과 설명이 왼쪽 정렬로 다른 페이지와 다른 느낌

### After
- 모든 주요 페이지의 제목이 가운데 정렬로 통일
- 일관된 사용자 경험 제공
- 브랜딩과 시각적 계층 구조 개선

## 관련 CSS 클래스

- `text-center`: 텍스트 가운데 정렬
- `text-4xl font-bold`: 메인 페이지 제목 스타일
- `text-3xl font-bold tracking-tight`: Draft 페이지 제목 스타일

## 품질 검증

✅ **HomePage** - 제목 정렬 일관성 확인  
✅ **AboutPage** - 제목 정렬 일관성 확인  
✅ **SettingsPage** - 수정 완료, 제목 가운데 정렬  
✅ **DraftsPage** - 수정 완료, 제목과 설명 가운데 정렬

## 향후 개선 사항

1. **디자인 시스템**: 페이지 제목 컴포넌트 표준화 고려
2. **스타일 가이드**: 제목 정렬 규칙을 코딩 표준에 명시
3. **자동화**: ESLint 규칙으로 일관성 검사 자동화 검토

---

**수정일**: 2025-01-09  
**수정자**: Quinn (QA 엔지니어)  
**리뷰 상태**: ✅ 완료