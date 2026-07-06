import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "node:stream"
import { AppProviders } from "./app-shell"
import { createServerRoutes } from "./routes.server"
import { PROJECTS } from "./data/resume"
import { getAllPosts, getPostBySlug } from "./lib/posts"
import { getRouteLanguage, localizePath, postPath } from "./lib/i18n-routing"
import type { Language } from "./i18n"
import type { PostMeta } from "./types/post"

export interface PrerenderRoute {
  path: string
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  type?: "website" | "article"
  date?: string
  tags?: string[]
  articleBody?: string
  language?: Language
  noindex?: boolean
  canonicalPath?: string
  alternates?: Partial<Record<Language, string>>
  jsonLd?: Record<string, unknown>
}

const BASE_URL = "https://devy1540.dev"
const OG_IMAGE_URL = `${BASE_URL}/og-image.png?v=20260610`

function markdownToText(md: string) {
  return md
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
}

function toCanonicalPath(path: string) {
  if (path === "/") return "/"
  return path.endsWith("/") ? path : `${path}/`
}

function localizedStaticRoutes(language: Language, posts: PostMeta[]): PrerenderRoute[] {
  const isEnglish = language === "en"
  const path = (basePath: string) => toCanonicalPath(localizePath(basePath, language))
  const homeDescription = isEnglish
    ? "An archive of Devy's development and operations notes, organized around problem solving."
    : "Devy의 개발과 운영 기록을 문제 해결 중심으로 모아둔 아카이브입니다."
  const postsDescription = isEnglish ? "All blog posts." : "개발하며 배운 것들을 정리한 글 목록입니다."

  return [
    {
      path: path("/"),
      language,
      title: isEnglish ? "Backend and Infrastructure Engineering Notes" : "백엔드·인프라 개발 기록",
      description: homeDescription,
      ogTitle: "Devy Archive",
      alternates: {
        ko: "/",
        en: "/en/",
      },
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Devy Archive",
        description: homeDescription,
        url: `${BASE_URL}${path("/") === "/" ? "" : path("/")}`,
        inLanguage: isEnglish ? "en" : "ko-KR",
        author: { "@type": "Person", name: "Devy" },
        blogPost: posts.slice(0, 10).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${BASE_URL}${postPath(post.slug, language)}`,
        })),
      },
    },
    {
      path: path("/posts/"),
      language,
      title: isEnglish ? "Posts" : "글 목록",
      description: postsDescription,
      alternates: {
        ko: "/posts/",
        en: "/en/posts/",
      },
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: isEnglish ? "Posts" : "글 목록",
        description: postsDescription,
        url: `${BASE_URL}${path("/posts/")}`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${BASE_URL}${postPath(post.slug, language)}`,
            name: post.title,
          })),
        },
      },
    },
    {
      path: path("/tags/"),
      language,
      title: isEnglish ? "Tags" : "태그",
      description: isEnglish ? "Blog posts grouped by tag." : "태그별로 분류된 블로그 글 목록입니다.",
      alternates: {
        ko: "/tags/",
        en: "/en/tags/",
      },
    },
    {
      path: path("/series/"),
      language,
      title: isEnglish ? "Series" : "시리즈",
      description: isEnglish ? "Blog posts grouped by series." : "시리즈별로 분류된 블로그 글 목록입니다.",
      alternates: {
        ko: "/series/",
        en: "/en/series/",
      },
    },
    {
      path: path("/search/"),
      language,
      title: isEnglish ? "Posts" : "글 목록",
      description: postsDescription,
      noindex: true,
      canonicalPath: path("/posts/"),
      alternates: {
        ko: "/posts/",
        en: "/en/posts/",
      },
    },
    {
      path: path("/analytics/"),
      language,
      title: isEnglish ? "Analytics" : "통계",
      description: isEnglish ? "Blog visit and post view statistics." : "블로그 방문과 글 조회 통계를 확인합니다.",
      alternates: {
        ko: "/analytics/",
        en: "/en/analytics/",
      },
    },
    {
      path: path("/about/"),
      language,
      title: isEnglish ? "About" : "소개",
      description: isEnglish ? "About Devy." : "개발자 Devy의 소개 페이지입니다.",
      alternates: {
        ko: "/about/",
        en: "/en/about/",
      },
    },
  ]
}

export function getPrerenderRoutes(): PrerenderRoute[] {
  const koPosts = getAllPosts("ko")
  const enPosts = getAllPosts("en")

  return [
    ...localizedStaticRoutes("ko", koPosts),
    ...localizedStaticRoutes("en", enPosts),
    ...PROJECTS.map((project) => ({
      path: `/about/projects/${project.slug}/`,
      language: "ko" as const,
      title: project.name,
      description: `${project.company} - ${project.name}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: project.name,
        description: `${project.company} - ${project.name}`,
        url: `${BASE_URL}/about/projects/${project.slug}/`,
        inLanguage: "ko-KR",
        mainEntity: {
          "@type": "CreativeWork",
          name: project.name,
          description: project.tasks.map((task) => task.content).join(" "),
          dateCreated: project.period,
        },
      },
    })),
    ...PROJECTS.map((project) => ({
      path: `/en/about/projects/${project.slug}/`,
      language: "en" as const,
      title: project.name,
      description: `${project.company} - ${project.name}`,
      alternates: {
        ko: `/about/projects/${project.slug}/`,
        en: `/en/about/projects/${project.slug}/`,
      },
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: project.name,
        description: `${project.company} - ${project.name}`,
        url: `${BASE_URL}/en/about/projects/${project.slug}/`,
        inLanguage: "en",
        mainEntity: {
          "@type": "CreativeWork",
          name: project.name,
          description: project.tasks.map((task) => task.content).join(" "),
          dateCreated: project.period,
        },
      },
    })),
    ...koPosts.map((post) => {
      const fullPost = getPostBySlug(post.slug, "ko")
      const articleBody = fullPost ? markdownToText(fullPost.content).slice(0, 5000) : ""
      const alternates: Partial<Record<Language, string>> = { ko: postPath(post.slug, "ko") }
      if (post.availableLanguages.includes("en")) alternates.en = postPath(post.slug, "en")

      return {
        path: `/posts/${post.slug}/`,
        language: "ko" as const,
        title: post.title,
        description: post.description,
        type: "article" as const,
        date: post.date,
        tags: post.tags,
        articleBody,
        alternates,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${BASE_URL}/posts/${post.slug}/`,
          image: OG_IMAGE_URL,
          author: { "@type": "Person", name: "Devy" },
          publisher: { "@type": "Organization", name: "Devy Archive" },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/posts/${post.slug}/` },
          articleBody,
          ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
        },
      }
    }),
    ...koPosts.map((koPost) => {
      const post = enPosts.find((candidate) => candidate.slug === koPost.slug)
      const fullPost = post ? getPostBySlug(post.slug, "en") : undefined
      const articleBody = fullPost ? markdownToText(fullPost.content).slice(0, 5000) : ""
      const path = postPath(koPost.slug, "en")
      const alternates: Partial<Record<Language, string>> = { ko: postPath(koPost.slug, "ko") }
      if (post) alternates.en = path

      if (!post) {
        return {
          path,
          language: "en" as const,
          title: "English version is not available yet",
          description: "This post has not been translated into English yet.",
          noindex: true,
          canonicalPath: postPath(koPost.slug, "ko"),
          alternates,
        }
      }

      return {
        path,
        language: "en" as const,
        title: post.title,
        description: post.description,
        type: "article" as const,
        date: post.date,
        tags: post.tags,
        articleBody,
        alternates,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${BASE_URL}${toCanonicalPath(path)}`,
          image: OG_IMAGE_URL,
          author: { "@type": "Person", name: "Devy" },
          publisher: { "@type": "Organization", name: "Devy Archive" },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}${toCanonicalPath(path)}` },
          articleBody,
          inLanguage: "en",
          ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
        },
      }
    }),
  ].map((route) => ({ ...route, path: toCanonicalPath(route.path) }))
}

export function render(url: string) {
  const router = createMemoryRouter(createServerRoutes(), {
    initialEntries: [url],
  })

  return new Promise<string>((resolve, reject) => {
    const stream = new PassThrough()
    let html = ""
    let didError = false

    stream.setEncoding("utf8")
    stream.on("data", (chunk) => {
      html += chunk
    })
    stream.on("end", () => {
      if (didError) reject(new Error(`SSR failed for ${url}`))
      else resolve(html)
    })
    stream.on("error", reject)

    const { pipe } = renderToPipeableStream(
      <AppProviders initialLanguage={getRouteLanguage(url)}>
        <RouterProvider router={router} />
      </AppProviders>,
      {
        onAllReady() {
          pipe(stream)
        },
        onShellError(error) {
          reject(error)
        },
        onError(error) {
          didError = true
          console.error(error)
        },
      }
    )
  })
}
