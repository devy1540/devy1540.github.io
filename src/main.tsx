import { createRoot, hydrateRoot } from "react-dom/client"
import { AppProviders } from "./app-shell"
import { App } from "./App"
import { createRoutes, preloadRouteComponents } from "./routes"
import "./index.css"
import { seedPostHydrationData } from "./lib/posts"
import { AppLoadError } from "./pages/ErrorPage"
import { getRouteLanguage } from "./lib/i18n-routing"

async function start() {
  const postData = document.getElementById("post-hydration-data")?.textContent
  if (postData) {
    try { seedPostHydrationData(JSON.parse(postData)) } catch { /* Fall back to the article loader. */ }
  }
  const resolvedComponents = await preloadRouteComponents(window.location.pathname)
  const routes = createRoutes(resolvedComponents)
  const app = (
    <AppProviders>
      <App routes={routes} />
    </AppProviders>
  )

  const root = document.getElementById("root")!

  if (root.hasChildNodes()) {
    hydrateRoot(root, app)
  } else {
    createRoot(root).render(app)
  }
}

void start().catch(() => {
  createRoot(document.getElementById("root")!).render(
    <AppProviders initialLanguage={getRouteLanguage(window.location.pathname)}>
      <AppLoadError />
    </AppProviders>
  )
})
