import { useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { useMetaTags } from "@/hooks/useMetaTags"
import { useLanguage } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"

export function SearchPage() {
  const { language, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const postsPath = localizePath(`/posts${location.search}`, language)

  useMetaTags({
    title: t.common.posts,
    description: t.posts.description,
    url: localizePath("/posts", language),
  })

  useEffect(() => {
    navigate(postsPath, { replace: true })
  }, [navigate, postsPath])

  return (
    <PageContainer>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{t.search.redirectTitle}</h1>
        <p className="text-muted-foreground">{t.search.redirectDescription}</p>
        <Button asChild>
          <Link to={postsPath} replace>
            {t.search.goToPosts}
          </Link>
        </Button>
      </div>
    </PageContainer>
  )
}
