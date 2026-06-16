import { Link } from "react-router-dom"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { useMetaTags } from "@/hooks/useMetaTags"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"

export function NotFoundPage() {
  useMetaTags({ title: "404" })
  const { language, t } = useLanguage()
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-8xl font-bold tracking-tight mb-4 text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold mb-8">
        {t.notFound.title}
      </h1>
      <Button asChild>
        <Link to={localizePath("/", language)} viewTransition>{t.common.goHome}</Link>
      </Button>
    </PageContainer>
  )
}
