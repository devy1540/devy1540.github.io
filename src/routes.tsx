import type { RouteObject } from "react-router-dom"
import { RootLayout } from "./layouts/RootLayout"
import { HomePage } from "./pages/HomePage"
import { ErrorPage } from "./pages/ErrorPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { loadRouteModule, type RouteComponentKey, type ResolvedRouteComponents } from "./lib/route-modules"
export { preloadRouteComponents } from "./lib/route-modules"

function routeComponent(key: RouteComponentKey, resolvedComponents: ResolvedRouteComponents) {
  const Component = resolvedComponents[key]
  return Component ? { Component } : { lazy: () => loadRouteModule(key) }
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
        { path: "admin", ...routeComponent("admin", resolvedComponents) },
        { path: "admin/callback", ...routeComponent("adminCallback", resolvedComponents) },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ]
}
