import { Link } from "react-router-dom"
import { useLanguage } from "@/i18n"
import { TOPICS, TOPICS_COPY, topicPath } from "@/data/topics"

export function TopicGuides({ postSlug }: { postSlug?: string }) {
  const { language } = useLanguage()
  const copy = TOPICS_COPY[language]
  const topics = postSlug ? TOPICS.filter(topic => topic.sections.some(section => section.articles.some(article => article.slug === postSlug))) : TOPICS
  if (!topics.length) return null
  return (
    <section aria-labelledby="topic-guides-heading" className={postSlug ? "mt-10 mb-10" : "mb-10"}>
      <h2 id="topic-guides-heading" className="text-lg font-semibold mb-3">{postSlug ? copy.related : copy.title}</h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(topic => (
          <li key={topic.slug} className="border-t pt-4 min-w-0">
            <Link to={topicPath(topic.slug, language)} className="font-medium text-primary underline underline-offset-4">{topic.title[language]}</Link>
            <p className="text-sm text-muted-foreground leading-6 mt-2">{topic.description[language]}</p>
          </li>
        ))}
      </ul>
      {!postSlug && <Link to={topicPath(undefined, language)} className="inline-block mt-5 text-sm text-primary underline underline-offset-4">{copy.more}</Link>}
    </section>
  )
}
