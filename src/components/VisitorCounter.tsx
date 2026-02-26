import { Eye } from "lucide-react"
import { usePageViews } from "@/hooks/usePageViews"

export function VisitorCounter() {
  const { totalViews } = usePageViews()

  if (totalViews === null) return null

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="size-3.5" />
      <span>{totalViews.toLocaleString()} views</span>
    </div>
  )
}
