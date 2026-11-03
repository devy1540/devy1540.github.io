import type { ComponentType } from "react"
import { stripLanguagePrefix } from "./i18n-routing"
import { createRetryableLoader } from "./async-loader"
import { preloadPostForPath } from "./posts"

export type RouteComponentKey =
  | "posts"
  | "post"
  | "tags"
  | "series"
  | "search"
  | "analytics"
  | "about"
  | "project"
  | "privacy"
  | "admin"
  | "adminCallback"

export type ResolvedRouteComponents = Partial<Record<RouteComponentKey, ComponentType>>

const factories: Record<RouteComponentKey, () => Promise<{ Component: ComponentType }>> = {
  posts: () => import("../pages/PostsPage").then((module) => ({ Component: module.PostsPage })),
  post: () => import("../pages/PostPage").then((module) => ({ Component: module.PostPage })),
  tags: () => import("../pages/TagsPage").then((module) => ({ Component: module.TagsPage })),
  series: () => import("../pages/SeriesPage").then((module) => ({ Component: module.SeriesPage })),
  search: () => import("../pages/SearchPage").then((module) => ({ Component: module.SearchPage })),
  analytics: () => import("../pages/AnalyticsPage").then((module) => ({ Component: module.AnalyticsPage })),
  about: () => import("../pages/AboutPage").then((module) => ({ Component: module.AboutPage })),
  project: () => import("../pages/ProjectDetailPage").then((module) => ({ Component: module.ProjectDetailPage })),
  privacy: () => import("../pages/PrivacyPage").then((module) => ({ Component: module.PrivacyPage })),
  admin: () => import("../pages/admin/AdminPage").then((module) => ({ Component: module.AdminPage })),
  adminCallback: () => import("../pages/admin/AdminCallbackPage").then((module) => ({ Component: module.AdminCallbackPage })),
}


const loaders = new Map<RouteComponentKey, () => Promise<{ Component: ComponentType }>>()

export function loadRouteModule(key: RouteComponentKey) {
  let load = loaders.get(key)
  if (!load) {
    load = createRetryableLoader(factories[key])
    loaders.set(key, load)
  }
  return load()
}

export function getRouteComponentKey(pathname: string): RouteComponentKey | null {
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
  if (path === "/admin") return "admin"
  if (path === "/admin/callback") return "adminCallback"
  return null
}

export async function preloadRouteComponents(pathname: string): Promise<ResolvedRouteComponents> {
  const key = getRouteComponentKey(pathname)
  if (!key) return {}

  const [{ Component }] = await Promise.all([loadRouteModule(key), preloadPostForPath(pathname)])
  return { [key]: Component }
}


export function prefetchRoute(pathname: string) {
  const key = getRouteComponentKey(pathname)
  return key ? loadRouteModule(key).then(() => undefined, () => undefined) : Promise.resolve()
}
