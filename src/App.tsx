import { useState } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import { createRoutes } from "./routes"

interface AppProps {
  routes?: RouteObject[]
}

export function App({ routes }: AppProps) {
  const [router] = useState(() => createBrowserRouter(routes ?? createRoutes()))

  return <RouterProvider router={router} />
}
