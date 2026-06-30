import type { ComponentType } from "react"
import type { RouteObject } from "react-router-dom"
import { RootLayout } from "./layouts/RootLayout"
import { HomePage } from "./pages/HomePage"
import { ErrorPage } from "./pages/ErrorPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { stripLanguagePrefix } from "./lib/i18n-routing"

type RouteComponentKey =
  | "posts"
  | "post"
  | "tags"
  | "series"
  | "search"
  | "analytics"
  | "about"
  | "project"
  | "privacy"

type ResolvedRouteComponents = Partial<Record<RouteComponentKey, ComponentType>>

const routeComponentLoaders: Record<RouteComponentKey, () => Promise<{ Component: ComponentType }>> = {
  posts: () => import("./pages/PostsPage").then((module) => ({ Component: module.PostsPage })),
  post: () => import("./pages/PostPage").then((module) => ({ Component: module.PostPage })),
  tags: () => import("./pages/TagsPage").then((module) => ({ Component: module.TagsPage })),
  series: () => import("./pages/SeriesPage").then((module) => ({ Component: module.SeriesPage })),
  search: () => import("./pages/SearchPage").then((module) => ({ Component: module.SearchPage })),
  analytics: () => import("./pages/AnalyticsPage").then((module) => ({ Component: module.AnalyticsPage })),
  about: () => import("./pages/AboutPage").then((module) => ({ Component: module.AboutPage })),
  project: () => import("./pages/ProjectDetailPage").then((module) => ({ Component: module.ProjectDetailPage })),
  privacy: () => import("./pages/PrivacyPage").then((module) => ({ Component: module.PrivacyPage })),
}

function routeComponent(key: RouteComponentKey, resolvedComponents: ResolvedRouteComponents) {
  const Component = resolvedComponents[key]
  return Component ? { Component } : { lazy: routeComponentLoaders[key] }
}

function getRouteComponentKey(pathname: string): RouteComponentKey | null {
  const path = stripLanguagePrefix(pathname).replace(/\/+$/, "") || "/"
  if (path === "/posts") return "posts"
  if (path.startsWith("/posts/")) return "post"
  if (path === "/tags") return "tags"
  if (path === "/series") return "series"
  if (path === "/search") return "search"
  if (path === "/analytics") return "analytics"
  if (path === "/about") return "about"
  if (path.startsWith("/about/projects/")) return "project"
  if (path === "/privacy") return "privacy"
  return null
}

export async function preloadRouteComponents(pathname: string): Promise<ResolvedRouteComponents> {
  const key = getRouteComponentKey(pathname)
  if (!key) return {}

  const { Component } = await routeComponentLoaders[key]()
  return { [key]: Component }
}

export function createRoutes(resolvedComponents: ResolvedRouteComponents = {}): RouteObject[] {
  const childRoutes: RouteObject[] = [
    { index: true, element: <HomePage /> },
    { path: "posts", ...routeComponent("posts", resolvedComponents) },
    { path: "posts/:slug", ...routeComponent("post", resolvedComponents) },
    { path: "tags", ...routeComponent("tags", resolvedComponents) },
    { path: "series", ...routeComponent("series", resolvedComponents) },
    { path: "search", ...routeComponent("search", resolvedComponents) },
    { path: "analytics", ...routeComponent("analytics", resolvedComponents) },
    { path: "about", ...routeComponent("about", resolvedComponents) },
    { path: "about/projects/:slug", ...routeComponent("project", resolvedComponents) },
    { path: "privacy", ...routeComponent("privacy", resolvedComponents) },
  ]

  return [
    {
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        ...childRoutes,
        { path: "en", children: childRoutes },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ]
}
