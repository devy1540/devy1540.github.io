import { lazy, Suspense, type ReactNode } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { RootLayout } from "./layouts/RootLayout"
import { HomePage } from "./pages/HomePage"
import { ErrorPage } from "./pages/ErrorPage"
import { NotFoundPage } from "./pages/NotFoundPage"

const PostsPage = lazy(() => import("./pages/PostsPage").then((module) => ({ default: module.PostsPage })))
const PostPage = lazy(() => import("./pages/PostPage").then((module) => ({ default: module.PostPage })))
const TagsPage = lazy(() => import("./pages/TagsPage").then((module) => ({ default: module.TagsPage })))
const SeriesPage = lazy(() => import("./pages/SeriesPage").then((module) => ({ default: module.SeriesPage })))
const SearchPage = lazy(() => import("./pages/SearchPage").then((module) => ({ default: module.SearchPage })))
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })))
const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })))
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage").then((module) => ({ default: module.ProjectDetailPage })))

function lazyRoute(element: ReactNode) {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">Loading...</div>}>
      {element}
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "posts", element: lazyRoute(<PostsPage />) },
      { path: "posts/:slug", element: lazyRoute(<PostPage />) },
      { path: "tags", element: lazyRoute(<TagsPage />) },
      { path: "series", element: lazyRoute(<SeriesPage />) },
      { path: "search", element: lazyRoute(<SearchPage />) },
      { path: "analytics", element: lazyRoute(<AnalyticsPage />) },
      { path: "about", element: lazyRoute(<AboutPage />) },
      { path: "about/projects/:slug", element: lazyRoute(<ProjectDetailPage />) },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
