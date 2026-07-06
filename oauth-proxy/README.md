# oauth-proxy

블로그 어드민 기능용 GitHub OAuth code↔token 교환 프록시 (Cloudflare Worker).

정적 호스팅(GitHub Pages)에는 `client_secret`을 둘 수 없어, 이 Worker가 서버 사이드에서
토큰 교환을 대신합니다. 프론트는 `code`만 POST하고 `access_token`을 돌려받습니다.

## 배포

```bash
npm install
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npm run deploy
```

## 바인딩

| 이름 | 종류 | 설명 |
|------|------|------|
| `GITHUB_CLIENT_ID` | secret | OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | secret | OAuth App Client Secret |
| `ALLOWED_ORIGIN` | var (`wrangler.toml`) | CORS 허용 도메인 (기본 `https://devy1540.dev`) |

## API

`POST /` — body `{ "code": "..." }` → `{ "access_token", "token_type", "scope" }`

전체 셋업은 저장소 루트의 [`docs/admin.md`](../docs/admin.md) 참고.
