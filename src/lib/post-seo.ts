import type { PostMeta } from "@/types/post"
import type { SeoOptions } from "./seo"
import { postPath } from "./i18n-routing"

export function postSeo(post: PostMeta) {
  return {
    title: post.title,
    description: post.description,
    url: postPath(post.slug, post.language),
    type: "article",
    datePublished: post.date,
    dateModified: post.updated,
    alternateUrls: Object.fromEntries(post.availableLanguages.map(language => [language, postPath(post.slug, language)])),
  } satisfies SeoOptions
}
