/**
 * 어드민(관리자) 기능 설정.
 *
 * client_id와 프록시 URL은 비밀이 아니므로 빌드 타임 환경변수로 주입한다.
 * (client_secret은 절대 프론트에 두지 않고 Cloudflare Worker에만 보관)
 */

export const GITHUB_OAUTH_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined
export const OAUTH_PROXY_URL = import.meta.env.VITE_OAUTH_PROXY_URL as string | undefined

/** 블로그 repo. user pages 규칙상 owner === repo 이름의 접두어다. */
export const REPO_OWNER = "devy1540"
export const REPO_NAME = "devy1540.github.io"

/** 관리자로 인정할 GitHub 로그인 아이디. 이 계정만 어드민 UI에 진입할 수 있다. */
export const ADMIN_LOGIN = "devy1540"

/** public repo 쓰기 권한. 글 frontmatter 커밋에 필요한 최소 스코프. */
export const OAUTH_SCOPE = "public_repo"

/** OAuth 콜백 경로. prerender 디렉터리(`/admin/callback/index.html`)와 맞추기 위해 슬래시로 끝낸다. */
export const CALLBACK_PATH = "/admin/callback/"

export const TOKEN_STORAGE_KEY = "admin_gh_token"
export const OAUTH_STATE_KEY = "admin_oauth_state"

/** client_id와 프록시 URL이 모두 설정되어야 OAuth 로그인을 시도할 수 있다. */
export const isAdminConfigured = Boolean(GITHUB_OAUTH_CLIENT_ID && OAUTH_PROXY_URL)
