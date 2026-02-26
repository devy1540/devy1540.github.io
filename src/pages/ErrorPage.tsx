import { Link, useRouteError } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"

export function ErrorPage() {
  const error = useRouteError()
  const t = useT()

  if (import.meta.env.DEV) {
    console.error(error)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-8xl font-bold tracking-tight mb-4 text-muted-foreground">
        !
      </p>
      <h1 className="text-2xl font-semibold mb-2">
        {t.notFound.errorTitle}
      </h1>
      <p className="text-muted-foreground mb-8">
        {t.notFound.errorMessage}
      </p>
      <Button asChild>
        <Link to="/" viewTransition>{t.common.goHome}</Link>
      </Button>
    </div>
  )
}
