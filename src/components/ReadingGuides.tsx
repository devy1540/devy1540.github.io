import { Link } from "react-router-dom"
import { READING_GUIDES } from "@/data/reading-guides"
import { useLanguage } from "@/i18n"
import { postPath } from "@/lib/i18n-routing"
import type { PostMeta } from "@/types/post"

export function ReadingGuides({ posts }: { posts: PostMeta[] }) {
  const { language, t } = useLanguage()
  const bySlug = new Map(posts.filter(post => post.language === language).map(post => [post.slug, post]))

  return (
    <section aria-labelledby="reading-guides-heading" className="mb-10">
      <h2 id="reading-guides-heading" className="text-xs font-semibold uppercase tracking-widest mb-3">
        {t.home.readingGuides}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">{t.home.readingGuidesDescription}</p>
      <div className="grid gap-6 sm:grid-cols-2">
        {READING_GUIDES.map(guide => {
          const articles = guide.slugs.map(slug => bySlug.get(slug)).filter((post): post is PostMeta => !!post)
          if (!articles.length) return null
          return (
            <div key={guide.id} className="min-w-0 border-t pt-4">
              <h3 className="font-medium">{guide.title[language]}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{guide.description[language]}</p>
              <ul className="mt-3 space-y-2">
                {articles.map(post => (
                  <li key={post.slug}>
                    <Link to={postPath(post.slug, language)} className="text-sm text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
