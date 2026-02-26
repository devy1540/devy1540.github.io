import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "./hooks/useTheme"
import { LanguageProvider } from "./i18n"
import { App } from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
)
