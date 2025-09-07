# GitHub 인증 시스템 마이그레이션 문서

## 프로젝트 개요
GitHub Pages 배포 환경에서 안정적인 GitHub 인증을 구현하기 위한 마이그레이션 작업

## 작업 배경
- **초기 문제**: Device Flow 인증의 CORS 제약으로 인한 GitHub Pages 배포 시 오류
- **목표**: GitHub Pages 환경에서 안정적으로 동작하는 인증 시스템 구축
- **최종 선택**: Personal Access Token (PAT) 기반 인증으로 단순화

## 마이그레이션 과정

### 1단계: OAuth App → GitHub App 마이그레이션
**목적**: 보안 강화 및 권한 관리 개선

#### 구현된 기능
- GitHub App JWT 토큰 생성 (`src/utils/jwt.ts`)
- PKCS#1 → PKCS#8 키 포맷 변환
- OAuth 콜백 처리 (`src/services/github-app-auth.ts`)

#### 주요 기술적 문제와 해결
```typescript
// JWT 생성을 위한 PKCS 키 변환
async function convertPkcs1ToPkcs8(pkcs1Pem: string): Promise<string> {
  // PKCS#1을 PKCS#8로 변환하는 ASN.1 구조 생성
  const pkcs8Wrapper = new Uint8Array([
    0x30, 0x82, // SEQUENCE
    (derData.length + 22) >> 8, (derData.length + 22) & 0xff,
    // ... ASN.1 구조
  ]);
}
```

#### 설정 파일
```bash
# .env.local
VITE_GITHUB_APP_ID=1901152
VITE_GITHUB_CLIENT_ID=Iv23liHfQs34OHvmRcbG
VITE_GITHUB_CLIENT_SECRET=68b4fddcb10ddb522f483fb451402eab94867e1c
VITE_GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
VITE_SITE_URL=http://localhost:5173
```

### 2단계: CORS 문제 해결 시도
**문제**: 브라우저에서 GitHub OAuth API 직접 호출 불가

#### 시도된 해결책들
1. **CORS 프록시 사용**
   ```typescript
   const proxyUrl = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token';
   ```

2. **GitHub App Installation 방식**
   ```typescript
   generateInstallUrl(): string {
     return `https://github.com/apps/devy1540-local/installations/new`;
   }
   ```

#### 기술적 제약사항
- GitHub의 모든 OAuth API는 CORS 정책으로 브라우저 직접 호출 차단
- GitHub Pages는 서버리스 환경으로 백엔드 토큰 교환 불가능
- 외부 프록시 서비스는 프로덕션 환경에서 불안정

### 3단계: Personal Access Token 전용 시스템
**최종 결정**: PAT 방식으로 단순화하여 안정성 확보

#### UI 개선사항
```typescript
// 자동 토큰 생성 URL
const tokenUrl = new URL('https://github.com/settings/tokens/new');
tokenUrl.searchParams.set('description', 'devy1540 - GitHub Repository Manager');
tokenUrl.searchParams.set('scopes', 'repo,user');
```

#### 컴포넌트 구조 변경
- **제거**: Tab 기반 OAuth/PAT 선택 UI
- **변경**: PAT 전용 단일 인터페이스
- **추가**: 자동 설정된 토큰 생성 링크

## 주요 파일 변경사항

### 1. JWT 유틸리티 (`src/utils/jwt.ts`)
- `jose` 라이브러리 사용 (브라우저 호환)
- PKCS#1 → PKCS#8 변환 로직 구현
- 에러 처리 및 폴백 메커니즘

### 2. GitHub App 인증 서비스 (`src/services/github-app-auth.ts`)
- OAuth 플로우 구현
- Installation 토큰 생성
- Client Secret 기반 토큰 교환

### 3. GitHub 콜백 컴포넌트 (`src/components/auth/GitHubCallback.tsx`)
- 자동 인증 처리
- PAT 폴백 옵션
- React Hook 순서 문제 해결

### 4. 로그인 버튼 컴포넌트 (`src/components/settings/GitHubLoginButton.tsx`)
- Tab UI 제거
- PAT 전용 인터페이스
- 자동 토큰 생성 URL

## 기술적 학습사항

### GitHub Pages의 제약사항
- 정적 호스팅만 지원 (서버리스)
- 모든 OAuth 플로우에서 CORS 문제 발생
- 클라이언트 사이드에서만 인증 처리 가능

### GitHub 인증 방식별 호환성
| 방식 | GitHub Pages | 보안성 | 구현 복잡도 | 최종 선택 |
|------|-------------|-------|------------|-----------|
| Device Flow | ❌ (CORS) | ⭐⭐⭐ | ⭐⭐ | ❌ |
| OAuth Redirect | ❌ (CORS) | ⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| GitHub App | ❌ (CORS) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| Personal Access Token | ✅ | ⭐⭐ | ⭐ | ✅ |

### JWT 구현 시 주의사항
- 브라우저 환경에서는 `jose` 라이브러리 사용
- PKCS 키 포맷 변환 필요
- ASN.1 구조 이해 필요

## 결론 및 권장사항

### 현재 구현의 장점
- ✅ GitHub Pages 완전 호환
- ✅ 단순하고 안정적인 인증
- ✅ 사용자 경험 최적화 (자동 토큰 설정)

### 향후 개선 방안
1. **서버리스 함수 활용**: Netlify Functions, Vercel Functions
2. **GitHub App 설치 가이드**: 상세한 설치 문서 제공
3. **토큰 보안 강화**: 암호화 저장, 만료 시간 관리

### 배운 교훈
- GitHub Pages 같은 정적 호스팅 환경에서는 PAT가 가장 실용적
- OAuth 구현 시 반드시 CORS 정책 사전 확인 필요
- 사용자 경험과 보안성 사이의 균형점 고려 필요

## 참고 자료
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [JOSE Library Documentation](https://github.com/panva/jose)