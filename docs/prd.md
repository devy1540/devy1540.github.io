# 개인 깃헙 블로그 Product Requirements Document (PRD)

## Goals and Background Context

### Goals
• React + TypeScript 기반의 현대적인 개인 블로그 플랫폼 구축
• GitHub Pages를 통한 정적 사이트 자동 배포 시스템 구현
• 블로그 내에서 직접 콘텐츠를 작성하고 즉시 배포할 수 있는 CMS 기능 제공
• Shadcn UI와 TailwindCSS를 활용한 깔끔하고 반응형 사용자 인터페이스 구현
• Zustand를 통한 효율적인 상태 관리로 원활한 사용자 경험 제공
• 개발자 친화적인 마크다운 기반 글쓰기 환경 구축

### Background Context
기존의 GitHub 블로그는 주로 Jekyll이나 Hugo 같은 정적 사이트 생성기를 사용하며, 로컬에서 마크다운 파일을 작성하고 Git을 통해 푸시하는 방식으로 운영됩니다. 이는 개발자에게는 익숙하지만, 콘텐츠 작성과 배포 과정이 분리되어 있어 번거로울 수 있습니다.

이 프로젝트는 React 기반의 SPA로 블로그를 구축하고, 블로그 자체에서 콘텐츠를 작성하면 GitHub API를 통해 자동으로 커밋/푸시되어 배포되는 통합 환경을 제공하고자 합니다. 이를 통해 별도의 로컬 개발 환경 없이도 웹 브라우저에서 직접 블로그를 관리할 수 있게 됩니다.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-12-19 | 1.0 | 초기 PRD 작성 | PM |

## Requirements

### Functional Requirements
• **FR1:** 사용자는 블로그 내 에디터에서 마크다운으로 포스트를 작성하고 미리보기할 수 있어야 한다
• **FR2:** 사용자는 작성한 포스트를 GitHub 저장소에 자동으로 커밋/푸시하여 배포할 수 있어야 한다
• **FR3:** 블로그는 포스트 목록을 카테고리/태그별로 필터링하고 검색할 수 있어야 한다
• **FR4:** 사용자는 GitHub OAuth를 통해 인증하고 자신의 저장소에 접근할 수 있어야 한다
• **FR5:** 블로그는 코드 블록에 대한 문법 강조(Syntax Highlighting)를 지원해야 한다
• **FR6:** 사용자는 포스트에 이미지를 업로드하고 GitHub 저장소에 저장할 수 있어야 한다
• **FR7:** 블로그는 댓글 기능을 제공해야 한다 (GitHub Discussions/Utterances 연동)
• **FR8:** 사용자는 다크모드/라이트모드를 전환할 수 있어야 한다
• **FR9:** 블로그는 포스트별 조회수를 추적하고 표시해야 한다
• **FR10:** 사용자는 About, Portfolio 등의 정적 페이지를 생성/편집할 수 있어야 한다

### Non-Functional Requirements
• **NFR1:** 블로그는 모바일, 태블릿, 데스크톱에서 반응형으로 동작해야 한다
• **NFR2:** 초기 페이지 로딩 시간은 3초 이내여야 한다
• **NFR3:** 블로그는 SEO 최적화를 위해 메타 태그와 Open Graph 태그를 지원해야 한다
• **NFR4:** GitHub API 호출은 Rate Limit을 고려하여 캐싱 전략을 구현해야 한다
• **NFR5:** 블로그는 PWA(Progressive Web App) 기능을 지원하여 오프라인에서도 읽기가 가능해야 한다
• **NFR6:** 모든 사용자 입력은 XSS 공격을 방지하기 위해 적절히 처리되어야 한다
• **NFR7:** 코드는 TypeScript의 strict 모드를 사용하여 타입 안정성을 보장해야 한다
• **NFR8:** 컴포넌트는 Shadcn UI 디자인 시스템을 일관되게 적용해야 한다

## User Interface Design Goals

### Overall UX Vision
깔끔하고 읽기 편한 개발자 친화적 블로그 인터페이스를 제공합니다. Shadcn UI의 모던하고 미니멀한 디자인 언어를 기반으로, 콘텐츠에 집중할 수 있는 깨끗한 레이아웃과 직관적인 네비게이션을 구현합니다. 글 작성 시에는 실시간 마크다운 프리뷰와 함께 VS Code와 유사한 편집 경험을 제공하여 개발자들이 친숙하게 사용할 수 있도록 합니다.

### Key Interaction Paradigms
• **단축키 중심 작업**: Cmd/Ctrl + S (저장), Cmd/Ctrl + P (프리뷰) 등 키보드 단축키 지원
• **실시간 프리뷰**: 마크다운 작성 시 분할 화면으로 즉시 결과 확인
• **드래그 앤 드롭**: 이미지 업로드를 위한 직관적인 드래그 앤 드롭 지원
• **무한 스크롤**: 포스트 목록에서 자연스러운 콘텐츠 로딩
• **토스트 알림**: 저장, 배포 등 작업 상태를 비차단 방식으로 피드백

### Core Screens and Views
• **홈/포스트 목록 페이지** - 최신 포스트, 카테고리 필터, 검색 기능
• **포스트 상세 페이지** - 콘텐츠 뷰어, 목차(TOC), 댓글 섹션
• **포스트 에디터** - 마크다운 편집기, 실시간 프리뷰, 메타데이터 설정
• **카테고리/태그 페이지** - 분류별 포스트 그룹핑
• **About 페이지** - 프로필 및 소개
• **설정 페이지** - GitHub 연동, 테마 설정, 블로그 메타 정보

### Accessibility: WCAG AA
• 키보드 네비게이션 완벽 지원
• 스크린 리더 호환성
• 충분한 색상 대비 (4.5:1 이상)
• 포커스 인디케이터 명확히 표시

### Branding
• Shadcn UI의 디자인 토큰 활용 (깔끔한 보더, 서브틀한 그림자)
• 모노스페이스 폰트를 코드 블록과 기술 콘텐츠에 활용
• 다크/라이트 모드 모두에서 일관된 브랜드 경험
• 개인화 가능한 액센트 컬러 시스템

### Target Device and Platforms: Web Responsive
• 모바일 (360px~): 단일 컬럼, 터치 최적화, 하단 네비게이션
• 태블릿 (768px~): 적응형 그리드, 사이드바 토글
• 데스크톱 (1024px~): 풀 레이아웃, 고정 사이드바, 멀티 컬럼

## Technical Assumptions

### Repository Structure: Monorepo
단일 저장소에서 블로그 애플리케이션과 콘텐츠를 함께 관리합니다. `/src`에 React 애플리케이션, `/content` 또는 `/posts`에 마크다운 콘텐츠를 저장하여 GitHub Pages 배포를 간소화합니다.

### Service Architecture
**정적 SPA (Single Page Application) with GitHub Pages**
• React + TypeScript 기반 클라이언트 사이드 렌더링
• GitHub API를 통한 동적 콘텐츠 관리
• Vite를 통한 빌드 및 번들링
• GitHub Actions를 통한 자동 빌드/배포 파이프라인
• 외부 API 없이 GitHub 저장소를 데이터베이스로 활용

### Testing Requirements
**Unit + Integration 테스트 전략**
• **Unit Tests**: Vitest를 사용한 컴포넌트 및 유틸리티 함수 테스트
• **Integration Tests**: React Testing Library를 통한 사용자 인터랙션 테스트
• **E2E Tests (선택적)**: Playwright를 통한 핵심 플로우 테스트
• **수동 테스트 지원**: Storybook을 통한 컴포넌트 격리 테스트 환경 제공

### Additional Technical Assumptions and Requests
• **상태 관리**: Zustand를 사용한 전역 상태 관리 (사용자 인증, 테마, 에디터 상태)
• **스타일링**: TailwindCSS + Shadcn UI 컴포넌트 라이브러리 활용
• **마크다운 처리**: 
  - `react-markdown` 또는 `@uiw/react-md-editor` 사용
  - `remark`/`rehype` 플러그인으로 확장 (코드 하이라이팅, TOC 생성)
• **라우팅**: React Router v6 또는 TanStack Router 사용
• **GitHub API 통신**: 
  - Octokit 라이브러리 활용
  - Personal Access Token 또는 OAuth App 인증
• **이미지 최적화**: 
  - 이미지는 `/public/images` 또는 GitHub 저장소에 직접 저장
  - lazy loading 및 WebP 포맷 지원 고려
• **번들 최적화**:
  - Code splitting으로 초기 로딩 최적화
  - Tree shaking으로 번들 크기 최소화
• **개발 환경**:
  - ESLint + Prettier 코드 품질 관리
  - Husky + lint-staged로 커밋 전 검증
• **배포**:
  - GitHub Actions workflow로 main 브랜치 푸시 시 자동 배포
  - `gh-pages` 브랜치에 빌드 결과물 배포

## Epic List

**Epic 1: Foundation & Core Blog Structure**
*프로젝트 기초 설정과 기본 블로그 구조를 구축하여 정적 콘텐츠를 표시할 수 있는 MVP 블로그 배포*

**Epic 2: Content Management System**
*블로그 내에서 직접 마크다운 포스트를 작성, 편집, 미리보기할 수 있는 에디터 시스템 구현*

**Epic 3: GitHub Integration & Auto-Deploy**
*GitHub API 연동으로 작성한 콘텐츠를 저장소에 커밋/푸시하고 자동 배포하는 완전한 CMS 워크플로우 구현*

## Epic 1: Foundation & Core Blog Structure

React + TypeScript 프로젝트를 초기 설정하고, Shadcn UI와 TailwindCSS를 통합하여 기본 디자인 시스템을 구축합니다. 정적 마크다운 파일을 읽어 표시할 수 있는 기본 블로그 구조를 구현하고, GitHub Pages에 배포 가능한 상태로 만듭니다. 이 에픽 완료 시 방문자들이 블로그 포스트를 읽고 탐색할 수 있는 완전히 기능하는 읽기 전용 블로그가 배포됩니다.

### Story 1.1: Project Setup and Core Dependencies

As a 개발자,
I want React + TypeScript + Vite 프로젝트를 설정하고 핵심 의존성을 구성하기를,
so that 견고한 개발 환경에서 블로그를 구축할 수 있다.

#### Acceptance Criteria
1: Vite를 사용한 React + TypeScript 프로젝트가 초기화되어야 한다
2: TailwindCSS와 Shadcn UI가 설치되고 구성되어야 한다
3: Zustand 상태 관리 라이브러리가 설치되어야 한다
4: ESLint, Prettier 설정이 완료되어야 한다
5: 기본 프로젝트 구조 (/src/components, /src/pages, /src/store, /content)가 생성되어야 한다
6: GitHub 저장소가 생성되고 초기 커밋이 완료되어야 한다
7: 개발 서버가 정상 실행되고 "Hello World" 페이지가 표시되어야 한다

### Story 1.2: Layout Components and Navigation

As a 블로그 방문자,
I want 일관된 헤더, 푸터, 네비게이션을 통해 블로그를 탐색하기를,
so that 모든 페이지에서 쉽게 이동할 수 있다.

#### Acceptance Criteria
1: 반응형 헤더 컴포넌트가 블로그 제목과 네비게이션 메뉴를 포함해야 한다
2: 푸터 컴포넌트가 저작권 정보와 소셜 링크를 표시해야 한다
3: React Router가 구성되고 기본 라우트(/, /posts, /about)가 작동해야 한다
4: 다크/라이트 모드 토글 버튼이 헤더에 있고 Zustand로 상태가 관리되어야 한다
5: 모바일에서 햄버거 메뉴가 작동해야 한다
6: 모든 컴포넌트가 Shadcn UI 디자인 시스템을 따라야 한다

### Story 1.3: Post List and Detail Views

As a 블로그 방문자,
I want 포스트 목록을 보고 개별 포스트를 읽기를,
so that 블로그 콘텐츠를 소비할 수 있다.

#### Acceptance Criteria
1: /content 폴더의 마크다운 파일들이 포스트 목록에 표시되어야 한다
2: 각 포스트 카드가 제목, 요약, 날짜, 태그를 표시해야 한다
3: 포스트 클릭 시 상세 페이지(/post/:slug)로 이동해야 한다
4: 마크다운이 올바르게 렌더링되고 코드 블록에 구문 강조가 적용되어야 한다
5: 포스트 상세 페이지에 목차(TOC)가 자동 생성되어야 한다
6: 읽기 시간 추정이 표시되어야 한다

### Story 1.4: GitHub Pages Deployment

As a 블로그 운영자,
I want GitHub Actions를 통해 자동으로 블로그를 배포하기를,
so that main 브랜치 푸시 시 자동으로 사이트가 업데이트된다.

#### Acceptance Criteria
1: GitHub Actions workflow 파일이 생성되어야 한다
2: main 브랜치 푸시 시 자동으로 빌드가 실행되어야 한다
3: 빌드 결과물이 gh-pages 브랜치에 배포되어야 한다
4: GitHub Pages 설정이 완료되고 커스텀 도메인 설정이 가능해야 한다
5: 404 페이지가 SPA 라우팅을 위해 올바르게 구성되어야 한다
6: 배포된 사이트가 https://[username].github.io/[repo-name]에서 접근 가능해야 한다

## Epic 2: Content Management System

블로그 내에서 직접 콘텐츠를 작성하고 편집할 수 있는 완전한 마크다운 에디터 시스템을 구축합니다. 실시간 프리뷰, 자동 저장, 메타데이터 관리 기능을 포함하여 사용자가 브라우저에서 편안하게 글을 작성할 수 있는 환경을 제공합니다. 이 에픽 완료 시, 작성한 콘텐츠는 로컬 스토리지에 저장되며, Epic 3에서 GitHub 연동을 추가할 준비가 완료됩니다.

### Story 2.1: Markdown Editor Integration

As a 블로그 운영자,
I want 강력한 마크다운 에디터로 포스트를 작성하기를,
so that 브라우저에서 직접 콘텐츠를 생성할 수 있다.

#### Acceptance Criteria
1: /editor 라우트에 마크다운 에디터 페이지가 생성되어야 한다
2: @uiw/react-md-editor 또는 유사한 에디터가 통합되어야 한다
3: 에디터가 마크다운 구문 강조를 지원해야 한다
4: 기본 마크다운 툴바(굵게, 기울임, 링크, 이미지, 코드 등)가 제공되어야 한다
5: 에디터 상태가 Zustand store에서 관리되어야 한다
6: 키보드 단축키(Cmd/Ctrl + B, I, K 등)가 작동해야 한다
7: 다크/라이트 모드에서 에디터 테마가 적절히 전환되어야 한다

### Story 2.2: Real-time Preview and Split View

As a 콘텐츠 작성자,
I want 작성 중인 내용을 실시간으로 미리보기를,
so that 최종 결과물을 확인하면서 글을 작성할 수 있다.

#### Acceptance Criteria
1: 분할 화면 모드(에디터/프리뷰)가 구현되어야 한다
2: 프리뷰가 실제 포스트 페이지와 동일한 스타일로 렌더링되어야 한다
3: 에디터 입력 시 디바운싱으로 프리뷰가 효율적으로 업데이트되어야 한다
4: 프리뷰 전용 모드와 에디터 전용 모드로 전환 가능해야 한다
5: 프리뷰에서 코드 구문 강조와 수식 렌더링이 작동해야 한다
6: 스크롤 동기화 옵션이 제공되어야 한다

### Story 2.3: Post Metadata Management

As a 블로그 운영자,
I want 포스트의 메타데이터를 관리하기를,
so that 제목, 태그, 카테고리 등을 설정할 수 있다.

#### Acceptance Criteria
1: 포스트 제목, 슬러그, 설명을 입력할 수 있는 폼이 제공되어야 한다
2: 태그를 추가/제거할 수 있는 태그 입력 컴포넌트가 구현되어야 한다
3: 카테고리를 선택하거나 새로 생성할 수 있어야 한다
4: 발행 날짜를 설정할 수 있어야 한다
5: 썸네일 이미지 URL을 설정할 수 있어야 한다
6: SEO 메타 태그(og:title, description 등)를 설정할 수 있어야 한다
7: 프론트매터(frontmatter) 형식으로 마크다운에 포함되어야 한다

### Story 2.4: Draft Management and Auto-save

As a 콘텐츠 작성자,
I want 작성 중인 글이 자동으로 저장되기를,
so that 실수로 작업 내용을 잃지 않는다.

#### Acceptance Criteria
1: 5초마다 자동으로 로컬 스토리지에 저장되어야 한다
2: 저장 상태가 UI에 표시되어야 한다 ("저장됨", "저장 중...")
3: 초안 목록을 볼 수 있는 /drafts 페이지가 구현되어야 한다
4: 각 초안이 제목, 마지막 수정 시간, 미리보기와 함께 표시되어야 한다
5: 초안을 불러와서 계속 편집할 수 있어야 한다
6: 초안을 삭제할 수 있어야 한다
7: 브라우저 새로고침 후에도 작성 중인 내용이 복구되어야 한다

## Epic 3: GitHub Integration & Auto-Deploy

GitHub API와 완전히 통합하여 블로그 내에서 작성한 콘텐츠를 직접 GitHub 저장소에 커밋하고 푸시할 수 있는 기능을 구현합니다. OAuth 인증을 통해 안전하게 사용자의 저장소에 접근하고, 이미지를 포함한 모든 콘텐츠를 관리할 수 있게 합니다. 이 에픽 완료 시, 사용자는 브라우저에서 글을 작성하고 버튼 클릭으로 GitHub에 배포하는 완전한 CMS 워크플로우를 갖게 됩니다.

### Story 3.1: GitHub OAuth Authentication

As a 블로그 운영자,
I want GitHub 계정으로 안전하게 인증하기를,
so that 내 GitHub 저장소에 콘텐츠를 푸시할 수 있다.

#### Acceptance Criteria
1: GitHub OAuth App이 생성되고 설정되어야 한다
2: "GitHub로 로그인" 버튼이 설정 페이지에 추가되어야 한다
3: OAuth 플로우가 완료되면 액세스 토큰이 안전하게 저장되어야 한다
4: 로그인 상태가 Zustand store에서 관리되어야 한다
5: 로그인한 사용자 정보(아바타, 이름, 저장소 목록)가 표시되어야 한다
6: 로그아웃 기능이 구현되어야 한다
7: 토큰 만료 시 재인증 프롬프트가 표시되어야 한다

### Story 3.2: Repository Content Management

As a 블로그 운영자,
I want GitHub 저장소의 콘텐츠를 읽고 쓰기를,
so that 저장소를 CMS 백엔드로 활용할 수 있다.

#### Acceptance Criteria
1: Octokit 라이브러리가 통합되어야 한다
2: 저장소의 /content 폴더에서 기존 포스트 목록을 가져올 수 있어야 한다
3: 특정 파일의 내용을 읽어올 수 있어야 한다
4: 새 파일을 생성하거나 기존 파일을 업데이트할 수 있어야 한다
5: 파일 삭제 기능이 구현되어야 한다
6: API Rate Limit 상태가 표시되어야 한다
7: 오프라인 시 로컬 스토리지 폴백이 작동해야 한다

### Story 3.3: Commit and Push Workflow

As a 콘텐츠 작성자,
I want 작성한 포스트를 GitHub에 커밋하고 배포하기를,
so that 블로그에 새 글이 자동으로 게시된다.

#### Acceptance Criteria
1: "게시" 버튼이 에디터에 추가되어야 한다
2: 커밋 메시지를 입력할 수 있는 다이얼로그가 제공되어야 한다
3: 포스트가 적절한 파일명(slug.md)으로 저장되어야 한다
4: 프론트매터가 포함된 완전한 마크다운 파일이 생성되어야 한다
5: 커밋이 main 브랜치에 푸시되어야 한다
6: 푸시 진행 상태가 실시간으로 표시되어야 한다
7: 성공/실패 토스트 알림이 표시되어야 한다
8: GitHub Actions 배포 상태 링크가 제공되어야 한다

### Story 3.4: Image Upload and Management

As a 콘텐츠 작성자,
I want 이미지를 업로드하고 포스트에 삽입하기를,
so that 풍부한 비주얼 콘텐츠를 작성할 수 있다.

#### Acceptance Criteria
1: 이미지 드래그 앤 드롭이 에디터에서 작동해야 한다
2: 파일 선택 다이얼로그로도 이미지를 업로드할 수 있어야 한다
3: 이미지가 /public/images 또는 /assets 폴더에 업로드되어야 한다
4: 업로드 진행률이 표시되어야 한다
5: 이미지 URL이 자동으로 마크다운에 삽입되어야 한다
6: 이미지 압축/리사이징 옵션이 제공되어야 한다
7: 업로드된 이미지 갤러리를 볼 수 있어야 한다

## Checklist Results Report

### PM 체크리스트 검증 요약

**전체 완성도**: 85% ✅
**아키텍처 준비도**: Ready

#### 카테고리별 평가
- ✅ **강점 영역**: User Experience (95%), Functional Requirements (95%), Epic Structure (95%)
- ⚠️ **개선 필요**: Problem Definition (75%), Cross-Functional Requirements (70%)

#### 주요 권장사항
1. **성공 지표 정의**: 구체적인 KPI 설정 필요 (월간 활성 사용자, 포스트 작성 빈도 등)
2. **MVP 검증 계획**: 초기 사용자 피드백 수집 방법 정의
3. **데이터 모델링**: 포스트, 태그, 카테고리 데이터 구조 명세화

#### 기술적 검토 필요사항
- GitHub API Rate Limit 대응 전략
- 이미지 저장소 크기 관리
- 오프라인/온라인 동기화 메커니즘

**결론**: PRD는 아키텍처 설계를 진행하기에 충분히 완성되었으며, 식별된 개선사항은 개발 과정에서 점진적으로 보완 가능합니다.

## Next Steps

### UX Expert Prompt
"개인 GitHub 블로그 PRD(docs/prd.md)를 검토했습니다. Shadcn UI와 TailwindCSS 기반으로 데스크톱 우선 반응형 디자인이 필요합니다. 주요 화면: 홈/포스트 목록, 포스트 상세, 마크다운 에디터(분할 뷰), 설정 페이지. VS Code 스타일의 편집 경험과 다크/라이트 모드 지원이 핵심입니다. 와이어프레임과 디자인 시스템 가이드를 작성해주세요."

### Architect Prompt
"개인 GitHub 블로그 PRD(docs/prd.md)를 검토했습니다. React + TypeScript + Vite 기반 SPA로 GitHub Pages에 배포됩니다. 기술 스택: Zustand(상태관리), Shadcn UI + TailwindCSS(UI), React Router(라우팅), Octokit(GitHub API). 3개 에픽으로 구성: 1) 기본 블로그 구조, 2) CMS 에디터, 3) GitHub 통합. 아키텍처 설계 문서를 작성해주세요. 특히 GitHub API Rate Limit 대응과 오프라인 동기화 전략을 포함해주세요."
