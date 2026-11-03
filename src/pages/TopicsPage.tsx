import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/i18n"
import { useMetaTags } from "@/hooks/useMetaTags"
import { PageContainer } from "@/components/PageContainer"
import { StructuredData } from "@/components/StructuredData"
import { TOPICS, TOPICS_COPY, topicPath } from "@/data/topics"
import { collectionStructuredData } from "@/lib/structured-data"

export function TopicsPage() {
  const { language } = useLanguage()
  const copy = TOPICS_COPY[language]
  const path = topicPath(undefined, language)
  useMetaTags({ title: copy.title, description: copy.description, url: path })
  return (
    <PageContainer>
      <StructuredData data={collectionStructuredData(copy.title, copy.description, path, language, TOPICS.map(topic => ({ name: topic.title[language], path: topicPath(topic.slug, language) })))} />
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-3">{copy.title}</h1>
        <p className="text-muted-foreground leading-7">{copy.introduction}</p>
      </header>
      <div className="space-y-8">
        {TOPICS.map(topic => (
          <section key={topic.slug} className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">
              <Link to={topicPath(topic.slug, language)} className="hover:underline underline-offset-4">{topic.title[language]}</Link>
            </h2>
            <p className="text-muted-foreground leading-7 max-w-3xl mb-4">{topic.audience[language]}</p>
            <ul className="list-disc pl-5 space-y-2 mb-5">
              {topic.questions[language].map(question => <li key={question}>{question}</li>)}
            </ul>
            <Link to={topicPath(topic.slug, language)} className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4">
              {copy.open}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}
