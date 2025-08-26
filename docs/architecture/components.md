# Components

## BlogApp (메인 애플리케이션)
**Responsibility:** React 애플리케이션의 진입점으로 라우팅, 전역 상태, 테마 관리

**Key Interfaces:**
- App 초기화 및 설정
- 라우터 설정 및 페이지 라우팅
- 전역 에러 바운더리
- 테마 프로바이더 (다크/라이트 모드)

**Dependencies:** React, React Router, Zustand, Shadcn UI

**Technology Stack:** React 18.3+, TypeScript 5.3+, React Router 6.20+

## AuthManager (인증 관리자)
**Responsibility:** GitHub OAuth 인증 플로우 관리, 토큰 저장, 관리자 권한 확인

**Key Interfaces:**
- `login()`: GitHub OAuth 로그인 시작
- `logout()`: 로그아웃 및 토큰 삭제
- `getUser()`: 현재 사용자 정보 반환
- `isAuthenticated()`: 인증 상태 확인
- `isAdmin()`: 관리자 권한 확인
- `canEdit()`: 편집 권한 확인
- `canDelete()`: 삭제 권한 확인

**Dependencies:** GitHub OAuth API, Zustand Store

**Technology Stack:** Octokit 3.1+, Zustand 4.5+

## PostManager (포스트 관리자)
**Responsibility:** 포스트 CRUD 작업 및 로컬 캐싱 관리

**Key Interfaces:**
- `getPosts(filters?)`: 포스트 목록 조회
- `getPost(slug)`: 단일 포스트 조회
- `createPost(data)`: 새 포스트 생성
- `updatePost(slug, data)`: 포스트 수정
- `deletePost(slug)`: 포스트 삭제
- `toggleDraft(slug)`: 초안/게시 상태 전환

**Dependencies:** GitHubAPIService, CacheManager

**Technology Stack:** Octokit, localStorage API

## MarkdownEditor (마크다운 에디터)
**Responsibility:** 마크다운 작성, 실시간 프리뷰, 자동 저장 기능 제공

**Key Interfaces:**
- `onChange(content)`: 콘텐츠 변경 핸들링
- `onSave()`: 수동 저장 트리거
- `togglePreview()`: 프리뷰 모드 전환
- `insertImage(url)`: 이미지 삽입
- `autoSave()`: 자동 저장 (30초 간격)

**Dependencies:** @uiw/react-md-editor, PostManager

**Technology Stack:** @uiw/react-md-editor 4.0+, react-markdown 9.0+

## UIComponentLibrary (UI 컴포넌트 라이브러리)
**Responsibility:** Shadcn UI 기반 재사용 가능한 컴포넌트 제공

**Key Interfaces:**
- Layout 컴포넌트 (Header, Footer, Sidebar)
- Form 컴포넌트 (Input, Button, Select, etc.)
- Display 컴포넌트 (Card, Badge, Avatar, etc.)
- Feedback 컴포넌트 (Toast, Dialog, Loading)

**Dependencies:** Shadcn UI, Radix UI, TailwindCSS

**Technology Stack:** Shadcn UI (latest), TailwindCSS 3.4+

## GitHubAPIService (GitHub API 서비스)
**Responsibility:** GitHub API와의 모든 통신을 캡슐화

**Key Interfaces:**
- Repository 콘텐츠 관리 (CRUD)
- 이미지 업로드
- Rate Limit 모니터링
- 커밋 생성 및 푸시

**Dependencies:** Octokit, AuthManager

**Technology Stack:** Octokit 3.1+, REST API v3

## CacheManager (캐시 관리자)
**Responsibility:** API 응답 캐싱 및 오프라인 지원

**Key Interfaces:**
- `get(key)`: 캐시된 데이터 조회
- `set(key, data, ttl)`: 데이터 캐싱
- `invalidate(pattern)`: 캐시 무효화
- `clear()`: 전체 캐시 삭제

**Dependencies:** localStorage, IndexedDB

**Technology Stack:** Web Storage API, IndexedDB

## RouterManager (라우터 관리자)
**Responsibility:** SPA 라우팅 및 네비게이션 관리

**Key Interfaces:**
- 페이지 라우트 정의
- 보호된 라우트 처리
- 404 처리
- 스크롤 복원

**Dependencies:** React Router, AuthManager

**Technology Stack:** React Router 6.20+

## ThemeManager (테마 관리자)
**Responsibility:** 다크/라이트 모드 전환 및 사용자 설정 저장

**Key Interfaces:**
- `toggleTheme()`: 테마 전환
- `getTheme()`: 현재 테마 반환
- `setTheme(theme)`: 테마 설정
- 시스템 테마 감지

**Dependencies:** Zustand, TailwindCSS

**Technology Stack:** Zustand 4.5+, CSS Variables

## PermissionGuard (권한 가드)
**Responsibility:** UI 요소의 권한 기반 조건부 렌더링

**Key Interfaces:**
- `requireAdmin`: 관리자만 접근 가능
- `requireAuth`: 인증된 사용자만 접근 가능
- `fallback`: 권한 없을 때 표시할 컴포넌트

**Dependencies:** AuthManager

**Technology Stack:** React 18.3+
