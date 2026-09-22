import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "node:stream"
import { AppProviders } from "./app-shell"
import { createServerRoutes } from "./routes.server"
import { getResumeData } from "./data/resume-i18n"
import type { ProjectDetail } from "./data/resume"
import { getAllPosts } from "./lib/posts"
import { getRouteLanguage, localizePath, postPath } from "./lib/i18n-routing"
import type { Language } from "./i18n"
export { preparePostContentForPrerender, getPostHydrationData } from "./lib/posts"

export interface PrerenderRoute {
  path: string
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  type?: "website" | "article"
  date?: string
  tags?: string[]
  language?: Language
  noindex?: boolean
  canonicalPath?: string
  alternates?: Partial<Record<Language, string>>
}

function toCanonicalPath(path: string) {
  if (path === "/") return "/"
  return path.endsWith("/") ? path : `${path}/`
}

function localizedStaticRoutes(language: Language): PrerenderRoute[] {
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
    {
      path: path("/privacy/"),
      language,
      title: isEnglish ? "Privacy Policy" : "개인정보처리방침",
      description: isEnglish ? "Privacy policy for dev.devy.dev." : "dev.devy.dev의 개인정보처리방침입니다.",
      alternates: {
        ko: "/privacy/",
        en: "/en/privacy/",
      },
    },
  ]
}

function localizedProjectRoutes(language: Language, projects: ProjectDetail[]): PrerenderRoute[] {
  return projects.map((project) => {
    const path = localizePath(`/about/projects/${project.slug}`, language)
    const description = `${project.company} — ${project.name}`

    return {
      path,
      language,
      title: project.name,
      description,
      alternates: {
        ko: localizePath(`/about/projects/${project.slug}`, "ko"),
        en: localizePath(`/about/projects/${project.slug}`, "en"),
      },
    }
  })
}

export function getPrerenderRoutes(): PrerenderRoute[] {
  const koPosts = getAllPosts("ko")
  const enPosts = getAllPosts("en")
  const koProjects = getResumeData("ko").projects
  const enProjects = getResumeData("en").projects

  return [
    ...localizedStaticRoutes("ko"),
    ...localizedStaticRoutes("en"),
    // 어드민 진입 화면은 클라이언트 전용 동작이지만, 정적 셸을 프리렌더해서
    // SPA fallback(404.html) hydration 불일치를 피한다. 색인은 막는다(noindex).
    {
      path: "/admin/",
      language: "ko" as const,
      title: "관리자",
      description: "블로그 관리자 로그인 및 글 관리.",
      noindex: true,
    },
    {
      path: "/admin/callback/",
      language: "ko" as const,
      title: "로그인 처리",
      description: "GitHub 로그인 처리 중입니다.",
      noindex: true,
    },
    ...localizedProjectRoutes("ko", koProjects),
    ...localizedProjectRoutes("en", enProjects),
    ...koPosts.map((post) => {
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
        alternates,
      }
    }),
    ...koPosts.map((koPost) => {
      const post = enPosts.find((candidate) => candidate.slug === koPost.slug)
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
        alternates,
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
