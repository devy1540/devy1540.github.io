import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "node:stream"
import { AppProviders } from "./app-shell"
import { createServerRoutes } from "./routes.server"
import { PROJECTS } from "./data/resume"
import { getAllPosts, getPostBySlug } from "./lib/posts"

export interface PrerenderRoute {
  path: string
  title: string
  description: string
  type?: "website" | "article"
  date?: string
  tags?: string[]
  articleBody?: string
  jsonLd?: Record<string, unknown>
}

const BASE_URL = "https://devy1540.dev"

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

export function getPrerenderRoutes(): PrerenderRoute[] {
  const posts = getAllPosts()
  const homeDescription = "Java, Spring, Kubernetes, observability, React와 운영 경험을 정리하는 Devy의 기술 블로그입니다."

  return [
    {
      path: "/",
      title: "백엔드·인프라 개발 기록",
      description: homeDescription,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Devy's Blog",
        description: homeDescription,
        url: BASE_URL,
        inLanguage: "ko-KR",
        author: { "@type": "Person", name: "Devy" },
        blogPost: posts.slice(0, 10).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${BASE_URL}/posts/${post.slug}/`,
        })),
      },
    },
    {
      path: "/posts/",
      title: "글 목록",
      description: "개발하며 배운 것들을 정리한 글 목록입니다.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "글 목록",
        description: "개발하며 배운 것들을 정리한 글 목록입니다.",
        url: `${BASE_URL}/posts/`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${BASE_URL}/posts/${post.slug}/`,
            name: post.title,
          })),
        },
      },
    },
    { path: "/tags/", title: "태그", description: "태그별로 분류된 블로그 글 목록입니다." },
    { path: "/series/", title: "시리즈", description: "시리즈별로 분류된 블로그 글 목록입니다." },
    { path: "/search/", title: "검색", description: "블로그 글을 키워드, 태그, 날짜로 검색합니다." },
    { path: "/analytics/", title: "통계", description: "블로그 방문과 글 조회 통계를 확인합니다." },
    { path: "/about/", title: "소개", description: "개발자 Devy의 소개 페이지입니다." },
    ...PROJECTS.map((project) => ({
      path: `/about/projects/${project.slug}/`,
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
    ...posts.map((post) => {
      const fullPost = getPostBySlug(post.slug)
      const articleBody = fullPost ? markdownToText(fullPost.content).slice(0, 5000) : ""

      return {
        path: `/posts/${post.slug}/`,
        title: post.title,
        description: post.description,
        type: "article" as const,
        date: post.date,
        tags: post.tags,
        articleBody,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${BASE_URL}/posts/${post.slug}/`,
          image: `${BASE_URL}/og-image.png`,
          author: { "@type": "Person", name: "Devy" },
          publisher: { "@type": "Organization", name: "Devy's Blog" },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/posts/${post.slug}/` },
          articleBody,
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
      <AppProviders>
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
