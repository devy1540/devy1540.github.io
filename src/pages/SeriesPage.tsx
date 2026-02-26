import { Link, useSearchParams } from "react-router-dom"
import { useMetaTags } from "@/hooks/useMetaTags"
import { getAllSeries, getSeriesPosts } from "@/lib/posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PostList } from "@/components/PostList"
import { useT } from "@/i18n"

export function SeriesPage() {
  const t = useT()
  useMetaTags({ title: "Series", description: t.series.description, url: "/series" })
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSeries = searchParams.get("name")

  const allSeries = getAllSeries()
  const seriesPosts = selectedSeries ? getSeriesPosts(selectedSeries) : []

  function clearSeries() {
    setSearchParams({})
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Series</h1>

      {!selectedSeries ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allSeries.map((series) => (
            <Link
              key={series.name}
              to={`/series?name=${encodeURIComponent(series.name)}`}
              viewTransition
              className="group"
            >
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {series.name}
                  </CardTitle>
                  <CardDescription>
                    {t.series.postCount(series.postCount, series.firstDate)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {allSeries.length === 0 && (
            <p className="text-muted-foreground">{t.series.noSeries}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-medium">
              <Badge variant="default" className="text-base px-3 py-1">
                {selectedSeries}
              </Badge>
            </span>
            <Button variant="ghost" size="sm" onClick={clearSeries}>
              {t.series.allSeries}
            </Button>
          </div>

          <PostList
            posts={seriesPosts}
            emptyMessage={t.series.noPostsInSeries}
          />
        </div>
      )}
    </div>
  )
}
