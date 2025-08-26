# Unified Project Structure

```
github-blog/
├── .github/                        # CI/CD 워크플로우
│   └── workflows/
│       ├── ci.yaml                # 테스트 및 린트
│       └── deploy.yaml            # GitHub Pages 배포
├── src/                           # 소스 코드
│   ├── components/                # UI 컴포넌트
│   │   ├── ui/                   # Shadcn UI 컴포넌트
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   ├── post/                 # 포스트 관련
│   │   ├── editor/               # 에디터 관련
│   │   ├── auth/                 # 인증 관련
│   │   └── common/               # 공통 컴포넌트
│   ├── pages/                    # 페이지 컴포넌트
│   ├── hooks/                    # 커스텀 훅
│   ├── services/                 # API 서비스
│   ├── stores/                   # Zustand 스토어
│   ├── utils/                    # 유틸리티
│   ├── types/                    # TypeScript 타입
│   ├── styles/                   # 스타일
│   ├── lib/                      # 외부 라이브러리 설정
│   ├── App.tsx                   # 앱 진입점
│   ├── main.tsx                  # React 진입점
│   └── vite-env.d.ts            # Vite 타입 정의
├── content/                       # 콘텐츠 (GitHub 저장)
│   ├── posts/                    # 블로그 포스트
│   ├── pages/                    # 정적 페이지
│   ├── categories.json           # 카테고리 정의
│   └── config.json              # 블로그 설정
├── public/                        # 정적 자산
│   ├── images/                   # 업로드 이미지
│   ├── favicon.ico
│   └── robots.txt
├── tests/                         # 테스트 파일
│   ├── unit/                     # 단위 테스트
│   ├── integration/              # 통합 테스트
│   └── e2e/                      # E2E 테스트
├── scripts/                       # 빌드/배포 스크립트
├── docs/                          # 프로젝트 문서
│   ├── prd.md
│   ├── architecture.md
│   └── README.md
├── .env.example                   # 환경변수 템플릿
├── .gitignore                     # Git 제외 파일
├── .eslintrc.json                # ESLint 설정
├── .prettierrc                   # Prettier 설정
├── index.html                     # HTML 템플릿
├── package.json                   # 의존성 관리
├── tsconfig.json                 # TypeScript 설정
├── vite.config.ts                # Vite 설정
├── tailwind.config.js            # TailwindCSS 설정
├── postcss.config.js             # PostCSS 설정
└── README.md                     # 프로젝트 README
```
