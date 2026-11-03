import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "node:stream"
import { AppProviders } from "./app-shell"
import { createServerRoutes } from "./routes.server"
import { getResumeData } from "./data/resume-i18n"
import type { ProjectDetail } from "./data/resume"
import { postSeo } from "./lib/post-seo"
import { getAllPosts } from "./lib/posts"
import { getRouteLanguage, localizePath, postPath, stripLanguagePrefix } from "./lib/i18n-routing"
import type { Language } from "./i18n"
import { en } from "./i18n/translations"
import { STATIC_PAGE_PATHS, staticPageSeo } from "./lib/page-seo"
import type { SeoOptions } from "./lib/seo"
import { PAGE_UPDATED } from "./data/page-updates"
export { renderSeoHead, resolveSeo, SITE as siteConfig, escapeMarkup } from "./lib/seo"
export { preparePostContentForPrerender, getPostHydrationData } from "./lib/posts"

export interface PrerenderRoute extends SeoOptions {
  path: string
  title: string
  description: string
  language?: Language
  lastmod?: string
  alternates?: Partial<Record<Language, string>>
}

function toCanonicalPath(path: string) {
  if (path === "/") return "/"
  return path.endsWith("/") ? path : `${path}/`
}

function localizedStaticRoutes(language: Language): PrerenderRoute[] {
  return STATIC_PAGE_PATHS.map(path => {
    const seo = staticPageSeo(path, language)
    return { ...seo, path: localizePath(path, language), language, alternates: seo.alternateUrls }
  })
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

// The same catalogue drives prerendered HTML, sitemap inclusion, and RSS.
export function getFeedPosts(language: Language) { return getAllPosts(language) }

export function getPrerenderRoutes(): PrerenderRoute[] {
  const koPosts = getAllPosts("ko")
  const enPosts = getAllPosts("en")
  const koProjects = getResumeData("ko").projects
  const enProjects = getResumeData("en").projects

  const routes: PrerenderRoute[] = [
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
    ...[...koPosts, ...enPosts].map(post => {
      const seo = postSeo(post)
      return {
        ...seo,
        path: postPath(post.slug, post.language),
        language: post.language,
        lastmod: post.updated,
        alternates: seo.alternateUrls,
      }
    }),
    ...koPosts.filter(post => !post.availableLanguages.includes("en")).map(post => ({
      path: postPath(post.slug, "en"),
      language: "en" as const,
      title: en.post.translationUnavailableTitle,
      description: en.post.translationUnavailableDescription,
      noindex: true,
      canonicalPath: postPath(post.slug, "ko"),
      alternates: { ko: postPath(post.slug, "ko") },
    })),
  ]
  return routes.map(route => ({
    ...route,
    path: toCanonicalPath(route.path),
    lastmod: route.lastmod ?? PAGE_UPDATED[toCanonicalPath(stripLanguagePrefix(route.path))],
  }))
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
