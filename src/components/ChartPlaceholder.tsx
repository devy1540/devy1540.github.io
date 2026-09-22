import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useT } from "@/i18n"

export function ChartPlaceholder({ error, retry, height }: { error: boolean; retry: () => void; height: number }) {
  const t = useT()
  return (
    <div className="relative flex flex-col items-center justify-center gap-3 rounded-lg border p-4" style={{ minHeight: height }}>
      {error ? (
        <>
          <p role="alert" className="text-sm text-muted-foreground">{t.common.chartLoadError}</p>
          <Button variant="outline" size="sm" onClick={retry}>{t.common.retry}</Button>
        </>
      ) : (
        <>
          <Skeleton className="absolute inset-0 motion-reduce:animate-none" />
          <p role="status" className="relative text-sm text-muted-foreground">{t.common.chartLoading}</p>
        </>
      )}
    </div>
  )
}
