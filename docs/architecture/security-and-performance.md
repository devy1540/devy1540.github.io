# Security and Performance

## Security Requirements

**Frontend Security:**
- CSP Headers: 적절한 Content Security Policy 설정
- XSS Prevention: React의 자동 이스케이핑 + DOMPurify로 마크다운 살균
- Secure Storage: 토큰은 메모리 저장 (localStorage 지양)

**Backend Security:**
- Input Validation: Zod 스키마로 모든 입력 검증
- Rate Limiting: GitHub API 자체 Rate Limit + 클라이언트 throttling
- CORS Policy: GitHub Pages 도메인만 허용

**Authentication Security:**
- Token Storage: 메모리 또는 세션 스토리지 (짧은 TTL)
- Session Management: 1시간 후 자동 로그아웃, 갱신 토큰 사용
- Password Policy: GitHub OAuth 사용으로 자체 패스워드 불필요

## Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 200KB (gzipped)
- Loading Strategy: Code splitting + Lazy loading
- Caching Strategy: 정적 자산 1년, API 응답 1분

**Backend Performance:**
- Response Time Target: < 500ms
- Database Optimization: 클라이언트 사이드 인덱싱
- Caching Strategy: 포스트 목록 60초, 개별 포스트 300초
