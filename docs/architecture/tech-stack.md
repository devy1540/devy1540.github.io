# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | 타입 안전 프로그래밍 | 대규모 코드베이스의 유지보수성과 개발 생산성 향상 |
| Frontend Framework | React | 18.3+ | UI 컴포넌트 프레임워크 | 풍부한 생태계, 컴포넌트 재사용성, 커뮤니티 지원 |
| UI Component Library | Shadcn UI | latest | 재사용 가능한 UI 컴포넌트 | 커스터마이징 가능, 모던 디자인, Radix UI 기반 접근성 |
| State Management | Zustand | 4.5+ | 전역 상태 관리 | 간단한 API, TypeScript 지원, 작은 번들 크기 |
| Backend Language | N/A | - | - | GitHub API 사용으로 별도 백엔드 불필요 |
| Backend Framework | N/A | - | - | 정적 호스팅 환경 |
| API Style | REST (GitHub API) | v3 | GitHub 리소스 접근 | GitHub 공식 API, 안정적이고 문서화 우수 |
| Database | GitHub Repository | - | 콘텐츠 저장소 | 버전 관리, 백업 자동화, 추가 비용 없음 |
| Cache | localStorage | - | 클라이언트 캐싱 | 오프라인 지원, API Rate Limit 대응 |
| File Storage | GitHub Repository | - | 이미지/파일 저장 | 저장소와 통합 관리, CDN 제공 |
| Authentication | GitHub OAuth | 2.0 | 사용자 인증 | GitHub 계정 통합, 안전한 토큰 관리 |
| Frontend Testing | Vitest | 1.0+ | 단위/통합 테스트 | Vite와 완벽 호환, 빠른 실행 속도 |
| Backend Testing | N/A | - | - | 백엔드 없음 |
| E2E Testing | Playwright | 1.40+ | End-to-End 테스트 | 크로스 브라우저 지원, 강력한 디버깅 도구 |
| Build Tool | Vite | 5.0+ | 번들링 및 개발 서버 | 빠른 HMR, 최적화된 빌드, ESM 지원 |
| Bundler | Vite (Rollup) | 5.0+ | 프로덕션 번들링 | Tree shaking, Code splitting 자동화 |
| IaC Tool | N/A | - | - | GitHub Pages 자동 제공 |
| CI/CD | GitHub Actions | - | 자동 빌드/배포 | GitHub 통합, 무료 티어 충분 |
| Monitoring | Google Analytics | GA4 | 사용자 분석 | 무료, 강력한 분석 도구 |
| Logging | Console + Sentry | latest | 에러 추적 | 실시간 에러 모니터링, 무료 티어 제공 |
| CSS Framework | TailwindCSS | 3.4+ | 유틸리티 CSS | Shadcn UI와 완벽 호환, 빠른 스타일링 |

## 추가 라이브러리

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Markdown Editor | @uiw/react-md-editor | 4.0+ | 마크다운 편집기 |
| Markdown Renderer | react-markdown | 9.0+ | 마크다운 렌더링 |
| Syntax Highlighting | Prism.js | 1.29+ | 코드 구문 강조 |
| Router | React Router | 6.20+ | 클라이언트 라우팅 |
| GitHub API Client | Octokit | 3.1+ | GitHub API 통신 |
| Date Handling | date-fns | 3.0+ | 날짜 포맷팅 |
| Icons | Lucide React | latest | 아이콘 세트 |
| Node Runtime | Node.js | 22+ | 개발 환경 |
