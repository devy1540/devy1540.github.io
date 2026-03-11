import { useState } from "react"
import { Github, Mail, Phone, Linkedin, ChevronDown, Download, Loader2, FileText, ExternalLink } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { PROFILE, SKILLS, COMPANIES, CERTIFICATIONS, PROJECTS } from "@/data/resume"
import { getPostBySlug } from "@/lib/posts"
import { renderBold } from "@/lib/utils"

function CompanySection({ company }: { company: typeof COMPANIES[number] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-8">
      {/* Left: Company Info */}
      <div>
        <h3 className="font-bold">{company.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{company.role}</p>
        <p className="text-sm text-muted-foreground">{company.period}</p>
      </div>

      {/* Right: Highlights + Projects */}
      <div className="space-y-3">
        {company.highlights && company.highlights.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">주요 성과</p>
            <ul className="space-y-1">
              {company.highlights.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{renderBold(h)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {company.projects.map((ps, index) => {
          const project = PROJECTS.find((p) => p.slug === ps.slug)
          if (!project) return null

          return (
            <Collapsible
              key={project.slug}
              defaultOpen={index === 0}
              className="group/project rounded-lg border"
            >
              <CollapsibleTrigger className="flex w-full items-center gap-2 text-left cursor-pointer p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{project.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tech.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[11px] px-1.5 py-0">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 -rotate-90 group-data-[state=open]/project:rotate-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden">
                <div className="px-3 pb-3 space-y-3">
                  <ul className="space-y-2.5">
                    {project.tasks.map((task, i) => (
                      <li key={i}>
                        <div className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                          <span className="shrink-0 mt-0.5">•</span>
                          <span>{renderBold(task.content)}</span>
                        </div>
                        {task.details && task.details.length > 0 && (
                          <ul className="mt-1 ml-5 space-y-1">
                            {task.details.map((detail, j) => (
                              <li key={j} className="flex gap-2 text-sm leading-relaxed">
                                <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
                                <span className="text-foreground font-medium">{renderBold(detail)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                  {project.achievements && project.achievements.length > 0 && (
                    <ul className="space-y-1.5 border-t border-dashed pt-2">
                      {project.achievements.map((ach, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                          <span className="shrink-0 mt-0.5">•</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CollapsibleContent>
              {(() => {
                const relatedPostData = project.relatedPosts?.map(getPostBySlug).filter(Boolean) ?? []
                const relatedLinks = project.relatedLinks ?? []
                if (relatedPostData.length === 0 && relatedLinks.length === 0) return null
                return (
                  <div className="border-t border-dashed px-3 py-2 space-y-1.5">
                    {relatedPostData.map((rp) => (
                      <a
                        key={rp!.slug}
                        href={`/posts/${rp!.slug}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span>{rp!.title}</span>
                      </a>
                    ))}
                    {relatedLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                )
              })()}
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}

export function AboutPage() {
  const t = useT()
  const [pdfLoading, setPdfLoading] = useState(false)
  useMetaTags({ title: "About", description: t.about.description, url: "/about" })

  async function handleDownloadPdf() {
    setPdfLoading(true)
    try {
      const [{ pdf }, { ResumePdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ResumePdf"),
      ])
      const blob = await pdf(ResumePdfDocument()).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${PROFILE.name}_이력서.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://github.com/devy1540.png" alt={PROFILE.name} />
          <AvatarFallback className="text-2xl">HJ</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{PROFILE.name}</h1>
          <p className="text-lg text-muted-foreground">{t.about.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground justify-center sm:justify-start">
            <a href={`mailto:${PROFILE.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" />
              {PROFILE.email}
            </a>
            <a href={`tel:${PROFILE.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Phone className="h-3.5 w-3.5" />
              {PROFILE.phone}
            </a>
          </div>
          <div className="flex gap-2 justify-center sm:justify-start">
            <Button asChild variant="outline" size="sm">
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.introduction}</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {PROFILE.introduction}
        </p>
      </section>

      <Separator />

      {/* Experience + Projects */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.experience}</h2>
        <div className="space-y-8">
          {COMPANIES.map((company) => (
            <CompanySection key={company.name} company={company} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.skills}</h2>
        <div className="space-y-4">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((cert) => (
                <Badge key={cert.name} variant="outline">
                  {cert.name} ({cert.year})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
