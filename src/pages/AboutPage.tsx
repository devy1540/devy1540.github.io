import { Github } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"

export function AboutPage() {
  const t = useT()
  useMetaTags({ title: "About", description: t.about.description, url: "/about" })
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-6">About</h1>
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        {t.about.description}
      </p>
      <Button asChild variant="outline">
        <a
          href="https://github.com/devy1540"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </a>
      </Button>
    </div>
  )
}
