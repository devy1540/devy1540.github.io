import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/i18n"
import { useMetaTags } from "@/hooks/useMetaTags"
import { PageContainer } from "@/components/PageContainer"
import { StructuredData } from "@/components/StructuredData"
import { NotFoundPage } from "./NotFoundPage"
import { TOPICS, TOPICS_COPY, topicPath, topicSections, type Topic } from "@/data/topics"
import { getAllPosts } from "@/lib/posts"
import { postPath } from "@/lib/i18n-routing"
import { collectionStructuredData, breadcrumbStructuredData } from "@/lib/structured-data"

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>()
  const topic = TOPICS.find(candidate => candidate.slug === slug)
  return topic ? <TopicContent topic={topic} /> : <NotFoundPage />
}

function TopicContent({ topic }: { topic: Topic }) {
  const { language, t } = useLanguage()
  const copy = TOPICS_COPY[language]
  const path = topicPath(topic.slug, language)
  const sections = topicSections(topic, getAllPosts(language))
  useMetaTags({ title: topic.title[language], description: topic.description[language], url: path })
  return (
    <PageContainer>
      <StructuredData data={collectionStructuredData(topic.title[language], topic.description[language], path, language, sections.flatMap(section => section.articles.map(({ post }) => ({ name: post.title, path: postPath(post.slug, language) }))))} />
      <StructuredData data={breadcrumbStructuredData([
        { name: t.common.home, path: language === "en" ? "/en/" : "/" },
        { name: copy.title, path: topicPath(undefined, language) },
        { name: topic.title[language], path },
      ])} />
      <nav aria-label={language === "ko" ? "상위 주제" : "Parent topics"} className="mb-6">
        <Link to={topicPath(undefined, language)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />{copy.title}
        </Link>
      </nav>
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{topic.title[language]}</h1>
        <p className="leading-7 text-muted-foreground mb-4">{topic.introduction[language]}</p>
        <p className="text-xs text-muted-foreground">{copy.updated} <time dateTime={topic.updated}>{topic.updated}</time></p>
      </header>
      <section className="mb-8 max-w-3xl">
        <h2 className="text-lg font-semibold mb-3">{copy.audience}</h2>
        <p className="leading-7 text-muted-foreground">{topic.audience[language]}</p>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">{copy.questions}</h2>
        <ul className="list-disc pl-5 space-y-2">
          {topic.questions[language].map(question => <li key={question}>{question}</li>)}
        </ul>
      </section>
      <section aria-labelledby="topic-reading-order">
        <h2 id="topic-reading-order" className="text-2xl font-semibold mb-6">{copy.order}</h2>
        <div className="space-y-9">
          {sections.map(section => (
            <section key={section.title.en} className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">{section.title[language]}</h3>
              <p className="text-muted-foreground leading-7 max-w-3xl mb-4">{section.description[language]}</p>
              <ul className="space-y-5">
                {section.articles.map(({ post, reason }) => (
                  <li key={post.slug}>
                    <Link to={postPath(post.slug, language)} className="font-medium text-primary underline underline-offset-4">{post.title}</Link>
                    <p className="text-sm text-muted-foreground leading-6 mt-1">{reason[language]}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <nav aria-label={copy.more} className="border-t mt-10 pt-6">
        <h2 className="text-lg font-semibold mb-3">{copy.more}</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {TOPICS.filter(other => other.slug !== topic.slug).map(other => (
            <li key={other.slug}><Link to={topicPath(other.slug, language)} className="text-sm text-primary underline underline-offset-4">{other.title[language]}</Link></li>
          ))}
        </ul>
      </nav>
    </PageContainer>
  )
}
