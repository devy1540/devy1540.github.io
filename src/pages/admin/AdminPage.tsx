import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, LogIn, Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react"
import { useAdminAuth } from "@/lib/admin/useAdminAuth"
import { GitHubApiError, listPostFiles, setPostDraft, type PostFile } from "@/lib/admin/github"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminPage() {
  useMetaTags({ title: "관리자", noindex: true })
  const { status, error, isConfigured, isAdmin, user, login, logout } = useAdminAuth()

  if (!isConfigured) {
    return (
      <Shell>
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>어드민 기능이 설정되지 않았습니다</AlertTitle>
          <AlertDescription>
            <code>VITE_GITHUB_CLIENT_ID</code>, <code>VITE_OAUTH_PROXY_URL</code> 환경변수가 필요합니다.
            설정 방법은 <code>docs/admin.md</code>를 참고하세요.
          </AlertDescription>
        </Alert>
      </Shell>
    )
  }

  if (status === "loading") {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          <span>인증 정보를 확인하는 중…</span>
        </div>
      </Shell>
    )
  }

  if (isAdmin) {
    return (
      <Shell action={<LogoutButton onLogout={logout} user={user?.login ?? ""} avatarUrl={user?.avatarUrl} />}>
        <DraftManager />
      </Shell>
    )
  }

  // 인증은 됐지만 허용된 관리자가 아닌 경우
  if (user) {
    return (
      <Shell action={<LogoutButton onLogout={logout} user={user.login} avatarUrl={user.avatarUrl} />}>
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>접근 권한이 없습니다</AlertTitle>
          <AlertDescription>
            <code>{user.login}</code> 계정은 이 블로그의 관리자가 아닙니다.
          </AlertDescription>
        </Alert>
      </Shell>
    )
  }

  // 로그아웃 상태 — 로그인 화면
  return (
    <Shell>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>관리자 로그인</CardTitle>
          <CardDescription>GitHub 계정으로 로그인하면 글의 초안/발행 상태를 관리할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={login}>
            <LogIn />
            GitHub로 로그인
          </Button>
          {status === "error" && error && (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>로그인 실패</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Shell>
  )
}

function Shell({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ShieldCheck className="size-6" />
          관리자
        </h1>
        {action}
      </div>
      {children}
    </div>
  )
}

function LogoutButton({
  onLogout,
  user,
  avatarUrl,
}: {
  onLogout: () => void
  user: string
  avatarUrl?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="size-7">
          <AvatarImage src={avatarUrl} alt={user} />
          <AvatarFallback>{user.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground hidden sm:inline">{user}</span>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout}>
        <LogOut />
        로그아웃
      </Button>
    </div>
  )
}

function DraftManager() {
  const { token } = useAdminAuth()
  const [posts, setPosts] = useState<PostFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      setPosts(await listPostFiles(token))
    } catch (err) {
      setError(err instanceof GitHubApiError ? err.message : "글 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  async function handleToggle(file: PostFile) {
    if (!token) return
    setPendingPath(file.path)
    setNotice(null)
    setError(null)
    try {
      const { sha, raw } = await setPostDraft(token, file, !file.draft)
      setPosts((prev) =>
        prev.map((p) => (p.path === file.path ? { ...p, draft: !file.draft, sha, raw } : p))
      )
      setNotice(
        `'${file.title}' 글을 ${!file.draft ? "초안으로 전환" : "발행"}했습니다. 재배포까지 수 분 정도 걸립니다.`
      )
    } catch (err) {
      setError(err instanceof GitHubApiError ? err.message : "변경에 실패했습니다.")
    } finally {
      setPendingPath(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          토글하면 frontmatter의 <code>draft</code> 값이 커밋되고, GitHub Actions 재빌드 후 반영됩니다.
        </p>
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : undefined} />
          새로고침
        </Button>
      </div>

      {notice && (
        <Alert>
          <ShieldCheck />
          <AlertTitle>커밋 완료</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">글이 없습니다.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {posts.map((post) => (
            <li key={post.path} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{post.language.toUpperCase()}</Badge>
                  <Badge variant={post.draft ? "secondary" : "default"}>
                    {post.draft ? "초안" : "발행"}
                  </Badge>
                </div>
                <p className="truncate font-medium">{post.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {post.slug}
                  {post.date ? ` · ${post.date}` : ""}
                </p>
              </div>
              <Button
                variant={post.draft ? "default" : "outline"}
                size="sm"
                disabled={pendingPath === post.path}
                onClick={() => void handleToggle(post)}
              >
                {pendingPath === post.path && <Loader2 className="animate-spin" />}
                {post.draft ? "발행하기" : "초안으로"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
