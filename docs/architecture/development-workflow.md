# Development Workflow

## Local Development Setup

### Prerequisites
```bash
node --version        # v22.0.0 이상 필요
npm --version         # v10.0.0 이상 필요
git --version         # v2.0.0 이상 필요
```

### Initial Setup
```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/github-blog.git
cd github-blog

# 2. 의존성 설치
npm install

# 3. Shadcn UI 초기 설정
npx shadcn-ui@latest init

# 4. 환경 변수 설정
cp .env.example .env.local

# 5. GitHub OAuth App 생성
# GitHub.com > Settings > Developer settings > OAuth Apps

# 6. 초기 콘텐츠 생성
mkdir -p content/posts content/pages
```

### Development Commands
```bash
npm run dev           # 개발 서버 시작
npm run lint          # ESLint 검사
npm run type-check    # TypeScript 타입 검사
npm run test          # 테스트 실행
npm run build         # 프로덕션 빌드
npm run preview       # 빌드 결과 미리보기
```

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
VITE_GITHUB_CLIENT_ID=your_oauth_app_client_id
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=github-blog
VITE_GITHUB_BRANCH=main
VITE_ENABLE_COMMENTS=false
VITE_ENABLE_ANALYTICS=false
VITE_API_CACHE_TTL=60000
VITE_AUTO_SAVE_INTERVAL=30000
```
