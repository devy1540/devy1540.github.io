# External APIs

## GitHub API
- **Purpose:** 콘텐츠 관리, 파일 CRUD, 저장소 정보 접근
- **Documentation:** https://docs.github.com/en/rest
- **Base URL(s):** `https://api.github.com`
- **Authentication:** Bearer Token (Personal Access Token 또는 OAuth Token)
- **Rate Limits:** 인증 시 5,000 requests/hour, 미인증 시 60 requests/hour

**Key Endpoints Used:**
- `GET /repos/{owner}/{repo}/contents/{path}` - 파일 조회
- `PUT /repos/{owner}/{repo}/contents/{path}` - 파일 생성/수정
- `DELETE /repos/{owner}/{repo}/contents/{path}` - 파일 삭제
- `GET /repos/{owner}/{repo}` - 저장소 정보 조회
- `GET /user` - 현재 사용자 정보
- `GET /rate_limit` - Rate Limit 상태 확인

**Integration Notes:** Octokit 라이브러리를 통해 통신, 모든 요청에 캐싱 적용하여 Rate Limit 최적화

## GitHub OAuth API
- **Purpose:** 사용자 인증 및 권한 부여
- **Documentation:** https://docs.github.com/en/apps/oauth-apps
- **Base URL(s):** `https://github.com/login/oauth`
- **Authentication:** Client ID & Client Secret
- **Rate Limits:** N/A

**Key Endpoints Used:**
- `GET /authorize` - OAuth 인증 페이지로 리다이렉트
- `POST /access_token` - Authorization Code를 Access Token으로 교환

**Integration Notes:** OAuth App 등록 필요, 리다이렉트 URI 설정 필수, 프로덕션에서는 서버리스 함수를 통한 토큰 교환 권장

## Utterances (댓글 시스템)
- **Purpose:** GitHub Issues 기반 댓글 시스템
- **Documentation:** https://utteranc.es/
- **Base URL(s):** `https://utteranc.es/client.js`
- **Authentication:** Public (GitHub 로그인으로 댓글 작성)
- **Rate Limits:** GitHub API Rate Limit 적용

**Key Endpoints Used:**
- 스크립트 임베드 방식 (iframe)

**Integration Notes:** 저장소에 utterances 앱 설치 필요, Issue 템플릿 설정 권장, 테마 커스터마이징 가능

## Google Analytics 4
- **Purpose:** 사용자 행동 분석
- **Documentation:** https://developers.google.com/analytics/devguides/collection/ga4
- **Base URL(s):** `https://www.googletagmanager.com/gtag/js`
- **Authentication:** Measurement ID
- **Rate Limits:** 10 million hits/month (무료 티어)

**Key Endpoints Used:**
- `gtag('config', GA_MEASUREMENT_ID)` - 초기화
- `gtag('event', 'page_view')` - 페이지뷰 추적
- `gtag('event', 'custom_event')` - 커스텀 이벤트

**Integration Notes:** GDPR 준수를 위한 쿠키 동의 배너 고려, SPA 라우팅 변경 시 수동 페이지뷰 전송 필요
