import type { Language } from "@/i18n"
import type { Post, PostMeta } from "@/types/post"
import type { ProjectDetail } from "@/data/resume"
import { localizePath, postPath } from "./i18n-routing"
import { getPostModifiedDate } from "./post-dates"

const BASE_URL = "https://dev.devy.dev"
const SITE_NAME = "Devy Archive"
const OG_IMAGE_URL = `${BASE_URL}/og-image.png?v=20260922-5`

function articleText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>/gm, "")
    .replace(/---/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 5000)
}

export function blogStructuredData(posts: PostMeta[], language: Language, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: SITE_NAME,
    description,
    url: `${BASE_URL}${localizePath("/", language)}`,
    inLanguage: language === "en" ? "en" : "ko-KR",
    author: { "@type": "Person", name: "Devy", url: `${BASE_URL}${localizePath("/about", language)}` },
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: getPostModifiedDate(post),
      url: `${BASE_URL}${postPath(post.slug, language)}`,
    })),
  }
}

export function postListStructuredData(posts: PostMeta[], language: Language, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${BASE_URL}${localizePath("/posts", language)}`,
    inLanguage: language === "en" ? "en" : "ko-KR",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE_URL}${postPath(post.slug, language)}`,
        name: post.title,
      })),
    },
  }
}

export function postStructuredData(post: Post) {
  const url = `${BASE_URL}${postPath(post.slug, post.language)}`
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: getPostModifiedDate(post),
    url,
    image: OG_IMAGE_URL,
    author: { "@type": "Person", name: "Devy", url: `${BASE_URL}${localizePath("/about", post.language)}` },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleBody: articleText(post.content),
    inLanguage: post.language === "en" ? "en" : "ko-KR",
    ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
  }
}

export function projectStructuredData(project: ProjectDetail, language: Language) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: project.name,
    description: `${project.company} — ${project.name}`,
    url: `${BASE_URL}${localizePath(`/about/projects/${project.slug}`, language)}`,
    inLanguage: language === "en" ? "en" : "ko-KR",
    mainEntity: {
      "@type": "CreativeWork",
      name: project.name,
      description: project.tasks.map((task) => task.content).join(" "),
      dateCreated: project.period,
    },
  }
}
