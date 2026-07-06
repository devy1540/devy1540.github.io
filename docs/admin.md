# 어드민(관리자) 기능 셋업 가이드

GitHub OAuth로 로그인한 관리자가 블로그 페이지 안에서 글의 **초안(draft) ↔ 발행** 상태를 전환할 수 있는 기능입니다.

## 동작 구조

```
[블로그 SPA]                    [Cloudflare Worker]            [GitHub]
  /admin 에서 로그인 클릭 ───────────────────────────────────▶ OAuth authorize
  ◀──────────── redirect /admin/callback?code=… ──────────────
  code 전달 ──────────▶ client_secret으로 교환 ──▶ access_token
  ◀──────────────────── access_token ────────────
  GET /user → login === devy1540 확인 → 관리 UI 노출
  draft 토글 ─────────────────────────────────▶ Contents API 커밋
                                                   └▶ Actions 재빌드/재배포 (수 분)
```

> ⚠️ draft 글은 프로덕션 번들에 포함되지 않으므로, 관리 화면의 글 목록은 GitHub API로
> 직접 조회합니다. 토글은 `.md` frontmatter의 `draft` 값을 커밋하며, **즉시 반영이 아니라
> 재빌드 후** 사이트에 반영됩니다.

---

## 1. GitHub OAuth App 등록

1. https://github.com/settings/developers → **New OAuth App**
2. 입력:
   - **Application name**: `devy-blog-admin` (자유)
   - **Homepage URL**: `https://devy1540.dev`
   - **Authorization callback URL**: `https://devy1540.dev/admin/callback/`
     - 로컬 테스트도 하려면 **Add another callback URL**로 `http://localhost:5173/admin/callback/` 추가
3. 생성 후 **Client ID** 복사. **Generate a new client secret**으로 secret도 발급(한 번만 표시되니 보관).

> client_id는 공개되어도 되는 값입니다. client_secret은 절대 프론트/저장소에 두지 마세요(Worker 전용).

---

## 2. Cloudflare Worker 배포 (`oauth-proxy/`)

```bash
cd oauth-proxy
npm install
npx wrangler login            # 최초 1회

# 시크릿 주입
npx wrangler secret put GITHUB_CLIENT_ID       # 위에서 받은 Client ID
npx wrangler secret put GITHUB_CLIENT_SECRET   # 위에서 받은 Client Secret

npm run deploy
```

배포되면 `https://devy-blog-oauth-proxy.<your-subdomain>.workers.dev` 같은 URL이 출력됩니다. 이 URL을 메모하세요.

- `wrangler.toml`의 `ALLOWED_ORIGIN`이 CORS 허용 도메인입니다. 기본값은 `https://devy1540.dev`.
  로컬 테스트 시 임시로 `*`로 바꾸거나 별도 Worker를 쓰세요.

---

## 3. 환경변수 설정

`.env.production`에 채웁니다(둘 다 공개 가능 값이라 커밋해도 됩니다):

```dotenv
VITE_GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
VITE_OAUTH_PROXY_URL=https://devy-blog-oauth-proxy.<your-subdomain>.workers.dev
```

비어 있으면 `/admin` 진입 시 "미설정" 안내가 표시됩니다(앱은 정상 빌드/동작).

---

## 4. 빌드 & 배포

```bash
npm run build      # /admin, /admin/callback 정적 셸도 함께 프리렌더됨
git commit && git push   # main 푸시 → GitHub Actions 배포
```

---

## 5. 사용

1. `https://devy1540.dev/admin` 접속 → **GitHub로 로그인**
2. 인증되면 글 목록이 뜨고, 각 글의 **초안으로 / 발행하기** 버튼으로 토글
3. 토글 시 frontmatter가 커밋되고, 재빌드 후 반영(목록 상단에 안내)
4. 로그인하면 사이드바에도 **관리자** 메뉴가 나타남

---

## 보안 메모

- 관리자 판정은 `src/lib/admin/config.ts`의 `ADMIN_LOGIN`(현재 `devy1540`)과 일치하는 GitHub 계정만 통과.
  UI 가드일 뿐 아니라, **토큰이 없으면 어떤 변경도 불가능**하므로 실질 권한은 토큰이 강제합니다.
- OAuth scope는 `public_repo`(공개 repo 쓰기)로 최소화.
- access_token은 `sessionStorage`에 저장 → 탭을 닫으면 사라집니다. (XSS 노출 리스크는 1인 관리자 기준 수용)
- client_secret은 Worker 시크릿에만 존재. 저장소/번들 어디에도 없습니다.

## 로컬 개발

```bash
# .env.development 에 client_id / 프록시 URL 채우고
npm run dev
# OAuth App callback에 http://localhost:5173/admin/callback/ 가 등록되어 있어야 함
```
