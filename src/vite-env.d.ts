/// <reference types="vite/client" />

declare module "virtual:post-search/ko" {
  const texts: Record<string, string>
  export default texts
}
declare module "virtual:post-search/en" {
  const texts: Record<string, string>
  export default texts
}

interface ImportMetaEnv {
  /** Google Apps Script API URL (조회수 조회) */
  readonly VITE_GA_API_URL?: string
  /** GitHub OAuth App client_id (어드민 로그인) */
  readonly VITE_GITHUB_CLIENT_ID?: string
  /** OAuth code↔token 교환 프록시(Cloudflare Worker) URL */
  readonly VITE_OAUTH_PROXY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
