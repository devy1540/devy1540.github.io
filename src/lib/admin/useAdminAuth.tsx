import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { fetchAuthenticatedUser, type GitHubUser } from "./github"
import {
  ADMIN_LOGIN,
  CALLBACK_PATH,
  GITHUB_OAUTH_CLIENT_ID,
  OAUTH_PROXY_URL,
  OAUTH_SCOPE,
  OAUTH_STATE_KEY,
  TOKEN_STORAGE_KEY,
  isAdminConfigured,
} from "./config"

type AdminStatus = "idle" | "loading" | "authenticated" | "error"

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

const AdminAuthContext = createContext<AdminAuthValue | null>(null)

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredToken(token: string | null) {
  if (typeof window === "undefined") return
  try {
    if (token) window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
    else window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // 저장 실패는 무시 — 메모리 상태만으로도 동작한다.
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [status, setStatus] = useState<AdminStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  // 마운트 시 sessionStorage의 토큰으로 세션 복원(클라이언트 전용).
  // 초기 렌더 출력은 항상 로그아웃 상태라 SSR 결과와 일치한다(hydration 안전).
  useEffect(() => {
    const stored = readStoredToken()
    if (!stored) return

    setToken(stored)
    setStatus("loading")
    fetchAuthenticatedUser(stored)
      .then((nextUser) => {
        setUser(nextUser)
        setStatus("authenticated")
      })
      .catch(() => {
        writeStoredToken(null)
        setToken(null)
        setUser(null)
        setStatus("idle")
      })
  }, [])

  const login = useCallback(() => {
    if (!isAdminConfigured || typeof window === "undefined") return

    const state = crypto.randomUUID()
    try {
      window.sessionStorage.setItem(OAUTH_STATE_KEY, state)
    } catch {
      // sessionStorage를 못 쓰면 state 검증이 불가능하므로 진행하지 않는다.
      setError("브라우저 저장소를 사용할 수 없어 로그인할 수 없습니다.")
      setStatus("error")
      return
    }

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize")
    authorizeUrl.searchParams.set("client_id", GITHUB_OAUTH_CLIENT_ID!)
    authorizeUrl.searchParams.set("redirect_uri", `${window.location.origin}${CALLBACK_PATH}`)
    authorizeUrl.searchParams.set("scope", OAUTH_SCOPE)
    authorizeUrl.searchParams.set("state", state)
    window.location.href = authorizeUrl.toString()
  }, [])

  const logout = useCallback(() => {
    writeStoredToken(null)
    setToken(null)
    setUser(null)
    setStatus("idle")
    setError(null)
  }, [])

  const exchangeCode = useCallback(async (code: string, state: string) => {
    setStatus("loading")
    setError(null)
    try {
      const savedState = window.sessionStorage.getItem(OAUTH_STATE_KEY)
      window.sessionStorage.removeItem(OAUTH_STATE_KEY)
      if (!savedState || savedState !== state) {
        throw new Error("인증 상태(state)가 일치하지 않습니다. 다시 로그인해 주세요.")
      }

      const res = await fetch(OAUTH_PROXY_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.access_token) {
        throw new Error(data?.error || "토큰 교환에 실패했습니다.")
      }

      const accessToken = data.access_token as string
      const nextUser = await fetchAuthenticatedUser(accessToken)
      writeStoredToken(accessToken)
      setToken(accessToken)
      setUser(nextUser)
      setStatus("authenticated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
      setStatus("error")
    }
  }, [])

  const isAdmin = status === "authenticated" && user?.login === ADMIN_LOGIN

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        status,
        error,
        isConfigured: isAdminConfigured,
        isAdmin,
        login,
        logout,
        exchangeCode,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
