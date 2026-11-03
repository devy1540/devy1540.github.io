import { useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { staticPageSeo } from "@/lib/page-seo"
import { useMetaTags } from "@/hooks/useMetaTags"
import { useLanguage } from "@/i18n"
import { collectionFilterPath, readCollectionFilters } from "@/lib/collection-filters"
import { useIsHydrated } from "@/hooks/useHydratedSearchParams"

export function SearchPage() {
  const { language, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const hydrated = useIsHydrated()
  const filters = hydrated ? readCollectionFilters(location.search, location.hash) : new URLSearchParams()
  const postsPath = collectionFilterPath("/posts", filters, language)

  useMetaTags(staticPageSeo("/search/", language))

  useEffect(() => {
    if (hydrated) void navigate(postsPath, { replace: true })
  }, [hydrated, navigate, postsPath])

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
