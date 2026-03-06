import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/i18n"
import { PROJECTS } from "@/data/resume"
import { renderBold } from "@/lib/utils"

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = PROJECTS.find((p) => p.slug === slug)
  const t = useT()

  useMetaTags({
    title: project?.name,
    description: project ? `${project.company} — ${project.name}` : undefined,
    url: slug ? `/about/projects/${slug}` : undefined,
  })

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">{t.post.notFound}</h1>
        <Button asChild variant="ghost">
          <Link to="/about" viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.about.backToAbout}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
        <Link to="/about" viewTransition>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.about.backToAbout}
        </Link>
      </Button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {project.name}
        </h1>
        <p className="text-muted-foreground">
          {project.company} · {project.period}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tech.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <Separator className="my-6" />

      <section>
        <h2 className="text-xl font-semibold mb-4">{t.about.tasks}</h2>
        <ul className="space-y-4">
          {project.tasks.map((task, i) => (
            <li key={i}>
              <div className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{renderBold(task.content)}</span>
              </div>
              {task.details && task.details.length > 0 && (
                <ul className="mt-2 ml-6 space-y-1.5">
                  {task.details.map((detail, j) => (
                    <li key={j} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-muted-foreground mt-0.5 shrink-0">•</span>
                      <span className="text-foreground font-medium">{renderBold(detail)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {project.achievements && project.achievements.length > 0 && (
        <>
          <Separator className="my-6" />
          <section>
            <h2 className="text-xl font-semibold mb-4">{t.about.achievements}</h2>
            <ul className="space-y-3">
              {project.achievements.map((achievement, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
