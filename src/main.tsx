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

void start().catch((error: unknown) => {
  console.error("Failed to initialize the page", error)
  const root = document.getElementById("root")!
  // A failed client chunk must not replace a readable prerendered page with
  // an indexable error screen. Its ordinary links still work without React.
  if (root.hasChildNodes()) return

  createRoot(root).render(
    <AppProviders initialLanguage={getRouteLanguage(window.location.pathname)}>
      <AppLoadError />
    </AppProviders>
  )
})
