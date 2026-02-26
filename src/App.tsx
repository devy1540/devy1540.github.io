import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { RootLayout } from "./layouts/RootLayout"
import { HomePage } from "./pages/HomePage"
import { PostPage } from "./pages/PostPage"
import { PostsPage } from "./pages/PostsPage"
import { TagsPage } from "./pages/TagsPage"
import { SearchPage } from "./pages/SearchPage"
import { AboutPage } from "./pages/AboutPage"
import { NotFoundPage } from "./pages/NotFoundPage"

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "posts", element: <PostsPage /> },
      { path: "posts/:slug", element: <PostPage /> },
      { path: "tags", element: <TagsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
