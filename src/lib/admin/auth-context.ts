import { createContext, useContext } from "react"
import type { GitHubUser } from "./github"
export type AdminStatus = "idle" | "loading" | "authenticated" | "error"

interface AdminAuthValue {
  user: GitHubUser | null
  token: string | null
  status: AdminStatus
  error: string | null
  /** client_id/프록시 URL이 빌드에 주입되었는지 */
  isConfigured: boolean
  /** 인증되었고, 로그인 아이디가 허용된 관리자와 일치하는지 */
  isAdmin: boolean
  /** GitHub OAuth authorize 화면으로 이동 */
  login: () => void
  logout: () => void
  /** 콜백에서 받은 code를 프록시를 통해 토큰으로 교환 */
  exchangeCode: (code: string, state: string) => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthValue | null>(null)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
