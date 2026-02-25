import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-6">About</h1>
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        소프트웨어 개발자입니다. 기술과 개발 경험을 기록합니다.
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
