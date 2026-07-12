import { createRoot, hydrateRoot } from "react-dom/client"
import { AppProviders } from "./app-shell"
import { App } from "./App"
import { createRoutes, preloadRouteComponents } from "./routes"
import "./index.css"

async function start() {
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

void start()
