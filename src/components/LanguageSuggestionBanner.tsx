import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { en, ko, type Language } from "@/i18n/translations"
import { analytics } from "@/lib/analytics"
import {
  detectSupportedBrowserLanguage,
  getRouteLanguage,
  getStoredLanguage,
  localizePath,
  setStoredLanguage,
  stripLanguagePrefix,
} from "@/lib/i18n-routing"

const koreanPostFiles = import.meta.glob("/content/posts/ko/*.md", {
  query: "?raw",
  import: "default",
})
const englishPostFiles = import.meta.glob("/content/posts/en/*.md", {
  query: "?raw",
  import: "default",
})
const localizedPostFiles = { ko: koreanPostFiles, en: englishPostFiles } satisfies Record<Language, Record<string, () => Promise<unknown>>>
const localizedStaticPaths = new Set(["/", "/posts", "/tags", "/series", "/analytics", "/about", "/privacy"])

function sessionDismissKey(source: Language, target: Language) {
  return `language-suggestion-dismissed:${source}-${target}`
}

function isSessionDismissed(source: Language, target: Language) {
  try {
    return window.sessionStorage.getItem(sessionDismissKey(source, target)) === "true"
  } catch {
    return false
  }
}

function dismissForSession(source: Language, target: Language) {
  try {
    window.sessionStorage.setItem(sessionDismissKey(source, target), "true")
  } catch {
    // Restricted browser storage should not prevent dismissing the current render.
  }
}

async function hasLanguageAlternative(pathname: string, targetLanguage: Language) {
  const normalizedPath = stripLanguagePrefix(pathname).replace(/\/+$/, "") || "/"
  if (localizedStaticPaths.has(normalizedPath)) return true

  const projectSlug = normalizedPath.match(/^\/about\/projects\/([^/]+)$/)?.[1]
  if (projectSlug) {
    const { getResumeData } = await import("@/data/resume-i18n")
    return getResumeData(targetLanguage).projects.some((project) => project.slug === decodeURIComponent(projectSlug))
  }

  const postSlug = normalizedPath.match(/^\/posts\/([^/]+)$/)?.[1]
  if (!postSlug) return false

  try {
    return Boolean(localizedPostFiles[targetLanguage][`/content/posts/${targetLanguage}/${decodeURIComponent(postSlug)}.md`])
  } catch {
    return false
  }
}

export function LanguageSuggestionBanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null)

  useEffect(() => {
    let active = true

    async function updateVisibility() {
      const sourceLanguage = getRouteLanguage(location.pathname)
      const preferredLanguage = getStoredLanguage() ?? detectSupportedBrowserLanguage()

      if (!preferredLanguage || preferredLanguage === sourceLanguage) {
        if (active) setTargetLanguage(null)
        return
      }

      if (isSessionDismissed(sourceLanguage, preferredLanguage)) {
        if (active) setTargetLanguage(null)
        return
      }

      const hasAlternative = await hasLanguageAlternative(location.pathname, preferredLanguage)
      if (active) setTargetLanguage(hasAlternative ? preferredLanguage : null)
    }

    void updateVisibility()
    return () => {
      active = false
    }
  }, [location.pathname])

  if (!targetLanguage) return null

  const sourceLanguage = getRouteLanguage(location.pathname)
  const target = targetLanguage
  const copy = (target === "en" ? en : ko).components

  function viewInPreferredLanguage() {
    setStoredLanguage(target)
    analytics.changeLanguage(target)
    setTargetLanguage(null)
    navigate(
      localizePath(`${location.pathname}${location.search}${location.hash}`, target),
      { viewTransition: true },
    )
  }

  function dismiss() {
    dismissForSession(sourceLanguage, target)
    setTargetLanguage(null)
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
          <Button type="button" size="sm" className="flex-1 sm:flex-none" onClick={viewInPreferredLanguage}>
            {copy.viewInLanguage}
          </Button>
          <Button type="button" size="sm" variant="outline" className="flex-1 bg-background sm:flex-none" onClick={dismiss}>
            {copy.notNow}
          </Button>
        </div>
      </div>
    </section>
  )
}
