import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAdminAuth } from "@/lib/admin/useAdminAuth"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function AdminCallbackPage() {
  useMetaTags({ title: "로그인 처리", noindex: true })
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { status, error, exchangeCode } = useAdminAuth()
  const startedRef = useRef(false)
  // 초기 렌더는 항상 스피너로 고정한다. 쿼리 누락/실패 판정은 마운트 후에만 하여,
  // 쿼리 없이 프리렌더된 정적 셸과 런타임(?code=…) 초기 렌더가 일치하도록 한다.
  const [missingParams, setMissingParams] = useState(false)

  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // code → token 교환은 한 번만 시도(코드는 1회용, StrictMode 이중 실행 방지).
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (!code || !state) {
      setMissingParams(true)
      return
    }
    void exchangeCode(code, state)
  }, [code, state, exchangeCode])

  // 인증 성공 시 관리자 페이지로 이동
  useEffect(() => {
    if (status === "authenticated") navigate("/admin", { replace: true })
  }, [status, navigate])

  const failed = missingParams || status === "error"

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16">
      {failed ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>로그인을 완료하지 못했습니다</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{missingParams ? "인증 정보가 누락되었습니다." : error}</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">다시 시도</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          <span>로그인을 처리하는 중…</span>
        </div>
      )}
    </div>
  )
}
