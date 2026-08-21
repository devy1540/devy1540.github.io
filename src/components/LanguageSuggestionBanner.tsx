import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { en } from "@/i18n/translations"
import { analytics } from "@/lib/analytics"
import {
  getRouteLanguage,
  getStoredLanguage,
  localizePath,
  prefersEnglishBrowser,
  setStoredLanguage,
  stripLanguagePrefix,
} from "@/lib/i18n-routing"

const SESSION_DISMISS_KEY = "language-suggestion-dismissed"
const englishPostFiles = import.meta.glob("/content/posts/en/*.md", {
  query: "?raw",
  import: "default",
})
const localizedStaticPaths = new Set(["/", "/posts", "/tags", "/series", "/analytics", "/about", "/privacy"])

function isSessionDismissed() {
  try {
    return window.sessionStorage.getItem(SESSION_DISMISS_KEY) === "true"
  } catch {
    return false
  }
}

function dismissForSession() {
  try {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY, "true")
  } catch {
    // Restricted browser storage should not prevent dismissing the current render.
  }
}

async function hasEnglishAlternative(pathname: string) {
  if (getRouteLanguage(pathname) === "en") return false

  const normalizedPath = stripLanguagePrefix(pathname).replace(/\/+$/, "") || "/"
  if (localizedStaticPaths.has(normalizedPath)) return true

  const projectSlug = normalizedPath.match(/^\/about\/projects\/([^/]+)$/)?.[1]
  if (projectSlug) {
    const { getResumeData } = await import("@/data/resume-i18n")
    return getResumeData("en").projects.some((project) => project.slug === decodeURIComponent(projectSlug))
  }

  const postSlug = normalizedPath.match(/^\/posts\/([^/]+)$/)?.[1]
  if (!postSlug) return false

  try {
    return Boolean(englishPostFiles[`/content/posts/en/${decodeURIComponent(postSlug)}.md`])
  } catch {
    return false
  }
}

export function LanguageSuggestionBanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const copy = en.components

  useEffect(() => {
    let active = true

    async function updateVisibility() {
      if (isSessionDismissed()) {
        if (active) setVisible(false)
        return
      }

      const storedLanguage = getStoredLanguage()
      const prefersEnglish = storedLanguage ? storedLanguage === "en" : prefersEnglishBrowser()
      const hasAlternative = prefersEnglish && await hasEnglishAlternative(location.pathname)
      if (active) setVisible(hasAlternative)
    }

    void updateVisibility()
    return () => {
      active = false
    }
  }, [location.pathname])

  if (!visible) return null

  function viewInEnglish() {
    setStoredLanguage("en")
    analytics.changeLanguage("en")
    setVisible(false)
    navigate(
      localizePath(`${location.pathname}${location.search}${location.hash}`, "en"),
      { viewTransition: true },
    )
  }

  function dismiss() {
    dismissForSession()
    setVisible(false)
  }

  return (
    <section
      data-nosnippet
      aria-label={copy.languageSuggestionTitle}
      className="border-y border-blue-200/70 bg-blue-50/80 px-4 py-3 dark:border-blue-900/70 dark:bg-blue-950/40 md:px-20"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <Languages className="mt-0.5 size-4 shrink-0 text-primary sm:mt-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium">{copy.languageSuggestionTitle}</p>
            <p className="text-sm text-muted-foreground">{copy.languageSuggestionDescription}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" className="flex-1 sm:flex-none" onClick={viewInEnglish}>
            {copy.viewInEnglish}
          </Button>
          <Button type="button" size="sm" variant="outline" className="flex-1 bg-background sm:flex-none" onClick={dismiss}>
            {copy.notNow}
          </Button>
        </div>
      </div>
    </section>
  )
}
