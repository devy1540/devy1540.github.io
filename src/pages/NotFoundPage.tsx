import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-8xl font-bold tracking-tight mb-4 text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold mb-8">
        페이지를 찾을 수 없습니다
      </h1>
      <Button asChild>
        <Link to="/" viewTransition>홈으로 돌아가기</Link>
      </Button>
    </div>
  )
}
