import { useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { useIsHydrated } from "@/hooks/useHydratedSearchParams"
import { AppSidebar } from "@/components/Sidebar"
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcuts"
import { ScrollToTop } from "@/components/ScrollToTop"
import { SearchCommandProvider } from "@/components/SearchCommand"
import { SearchCommandTrigger } from "@/components/SearchCommandTrigger"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"
import { Confetti } from "@/components/Confetti"
import { LanguageSuggestionBanner } from "@/components/LanguageSuggestionBanner"
import { NavigationStatus } from "@/components/NavigationStatus"
import { RoutePreloader } from "@/components/RoutePreloader"
import { trackPageView } from "@/lib/analytics"
import { getRouteLanguage } from "@/lib/i18n-routing"
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

function MobileHeader() {
  const { t } = useLanguage()
  const { openMobile, setOpenMobile } = useSidebar()
  const hydrated = useIsHydrated()
  return <header data-mobile-header className="sticky top-0 z-40 flex h-12 items-center gap-2 bg-background px-4 md:hidden">
    <Button data-mobile-menu-trigger disabled={!hydrated} variant="ghost" size="icon" className="size-11" aria-label={t.components.openMenu} aria-expanded={openMobile} onClick={() => setOpenMobile(!openMobile)}>
      <PanelLeft className="size-4" />
    </Button>
    <span className="font-bold text-lg tracking-tight">Devy</span>
    <div className="ml-auto"><SearchCommandTrigger /></div>
  </header>
}

export function RootLayout() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const pageKey = pathname.replace(/\/+$/, "") || "/"
  return (
    <SidebarProvider>
      <KeyboardShortcutsProvider>
        <SearchCommandProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg">{t.common.skipToContent}</a>
          <NavigationStatus />
          <RoutePreloader />
          <ScrollToTop />
          <RouteAnalytics />
          <RouteLanguageSync />
          <Confetti />
          <AppSidebar />
          <SidebarInset>
            <MobileHeader />
            <LanguageSuggestionBanner />
            <main id="main-content" tabIndex={-1} className="min-w-0 px-4 md:px-20 py-8">
              <div key={pageKey} className="page-transition">
                <Outlet />
              </div>
            </main>
            <ScrollToTopButton />
          </SidebarInset>
        </SearchCommandProvider>
      </KeyboardShortcutsProvider>
    </SidebarProvider>
  )
}
