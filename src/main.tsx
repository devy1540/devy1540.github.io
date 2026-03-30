import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "./hooks/useTheme"
import { LanguageProvider } from "./i18n"
import { App } from "./App"
import "./index.css"

const root = document.getElementById("root")!
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
)
// Reveal after React mounts — prevents FOUC from prerendered HTML
root.style.opacity = "1"
