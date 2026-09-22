import { useRouteError } from "react-router-dom"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"

export function ErrorPage() {
  const error = useRouteError()

  if (import.meta.env.DEV) {
    console.error(error)
  }

  return <AppLoadError />
}

export function AppLoadError() {
  const { language, t } = useLanguage()

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
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.location.reload()}>{t.common.retry}</Button>
        <Button asChild variant="outline">
          <a href={localizePath("/", language)}>{t.common.goHome}</a>
        </Button>
      </div>
    </PageContainer>
  )
}
