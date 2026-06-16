import { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/Sidebar"
import { ScrollToTop } from "@/components/ScrollToTop"
import { SearchCommand } from "@/components/SearchCommand"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"
import { Confetti } from "@/components/Confetti"
import { trackPageView } from "@/lib/analytics"
import {
  detectBrowserLanguage,
  getRouteLanguage,
  getStoredLanguage,
  localizePath,
  stripLanguagePrefix,
} from "@/lib/i18n-routing"
import { getPostBySlug } from "@/lib/posts"
import { useLanguage } from "@/i18n"

function RouteAnalytics() {
  const location = useLocation()
  const isInitialPageLoad = useRef(true)

  useEffect(() => {
    if (isInitialPageLoad.current) {
      isInitialPageLoad.current = false
      return
    }

    const path = `${location.pathname}${location.search}`
    const timeoutId = window.setTimeout(() => trackPageView(path), 0)
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, location.search])

  return null
}

function RouteLanguageSync() {
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const routeLanguage = getRouteLanguage(location.pathname)

  useEffect(() => {
    if (language !== routeLanguage) setLanguage(routeLanguage, { persist: false })
  }, [language, routeLanguage, setLanguage])

  return null
}

function isAutoLocaleRedirectCandidate(pathname: string): boolean {
  const normalizedPath = stripLanguagePrefix(pathname).replace(/\/+$/, "") || "/"
  const staticPaths = new Set(["/", "/posts", "/tags", "/series", "/search", "/analytics", "/about"])

  if (staticPaths.has(normalizedPath) || /^\/about\/projects\/[^/]+$/.test(normalizedPath)) {
    return true
  }

  const postSlug = normalizedPath.match(/^\/posts\/([^/]+)$/)?.[1]
  if (!postSlug) return false

  try {
    return Boolean(getPostBySlug(decodeURIComponent(postSlug), "en"))
  } catch {
    return false
  }
}

function AutoLocaleRedirect() {
  const location = useLocation()
  const navigate = useNavigate()
  const lastRedirectTarget = useRef<string | null>(null)

  useEffect(() => {
    if (getRouteLanguage(location.pathname) === "en") return

    const preferredLanguage = getStoredLanguage() ?? detectBrowserLanguage()
    if (preferredLanguage !== "en") return
    if (!isAutoLocaleRedirectCandidate(location.pathname)) return

    const target = `${localizePath(location.pathname, "en")}${location.search}${location.hash}`
    if (target === `${location.pathname}${location.search}${location.hash}`) return
    if (lastRedirectTarget.current === target) return

    lastRedirectTarget.current = target
    navigate(target, { replace: true })
  }, [location.hash, location.pathname, location.search, navigate])

  return null
}

export function RootLayout() {
  return (
    <SidebarProvider>
      <ScrollToTop />
      <RouteAnalytics />
      <RouteLanguageSync />
      <AutoLocaleRedirect />
      <Confetti />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background px-4">
          <SidebarTrigger />
          <span className="font-bold text-lg tracking-tight md:hidden">Devy</span>
          <div className="ml-auto">
            <SearchCommand />
          </div>
        </header>
        <main className="px-4 md:px-20 py-8">
          <Outlet />
        </main>
        <ScrollToTopButton />
      </SidebarInset>
    </SidebarProvider>
  )
}
