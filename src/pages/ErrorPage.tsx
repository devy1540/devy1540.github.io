import { Link, useRouteError } from "react-router-dom"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"

export function ErrorPage() {
  const error = useRouteError()
  const { language, t } = useLanguage()

  if (import.meta.env.DEV) {
    console.error(error)
  }

  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] text-center">
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
        <Link to={localizePath("/", language)} viewTransition>{t.common.goHome}</Link>
      </Button>
    </PageContainer>
  )
}
