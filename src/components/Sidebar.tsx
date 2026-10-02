import type { CSSProperties } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Home, FileText, Tags, User, Library, BarChart3, ShieldCheck } from "lucide-react"
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ColorThemeSelector } from "@/components/ColorThemeSelector"
import { LanguageToggle } from "@/components/LanguageToggle"
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts"
import { SidebarInfoMenu } from "@/components/SidebarInfoMenu"
import { useLanguage } from "@/i18n"
import { useAdminAuth } from "@/lib/admin/useAdminAuth"
import { localizePath, stripLanguagePrefix } from "@/lib/i18n-routing"
import { prefetchRoute } from "@/lib/route-modules"
import { SearchCommandTrigger } from "./SearchCommandTrigger"
import { useIsHydrated } from "@/hooks/useHydratedSearchParams"

const navIcons = {
  home: Home,
  posts: FileText,
  series: Library,
  tags: Tags,
  analytics: BarChart3,
  about: User,
} as const

export function AppSidebar() {
  const { pathname } = useLocation()
  const { language, t } = useLanguage()
  const { isAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const { isMobile, setOpenMobile, openMobile, open, state } = useSidebar()
  const collapsed = !isMobile && state === "collapsed"
  const hydrated = useIsHydrated()

  function handleMobileNav(e: React.MouseEvent, to: string) {
    if (!isMobile) return
    e.preventDefault()
    setOpenMobile(false)
    setTimeout(() => {
      navigate(to)
    }, 300)
  }

  const navItems = [
    { label: t.common.home, to: localizePath("/", language), basePath: "/", icon: navIcons.home },
    { label: t.common.posts, to: localizePath("/posts", language), basePath: "/posts", icon: navIcons.posts },
    { label: t.common.series, to: localizePath("/series", language), basePath: "/series", icon: navIcons.series },
    { label: t.common.tags, to: localizePath("/tags", language), basePath: "/tags", icon: navIcons.tags },
    { label: t.common.analytics, to: localizePath("/analytics", language), basePath: "/analytics", icon: navIcons.analytics },
    { label: t.common.about, to: localizePath("/about", language), basePath: "/about", icon: navIcons.about },
  ]

  const actions = [
    { key: "theme", label: t.components.toggleTheme, element: <ThemeToggle /> },
    { key: "color", label: t.components.colorTheme, element: <ColorThemeSelector /> },
    { key: "language", label: t.components.toggleLanguage, element: <LanguageToggle /> },
    { key: "shortcuts", label: t.components.keyboardShortcuts, element: <KeyboardShortcuts /> },
    { key: "info", label: t.components.blogInfo, element: <SidebarInfoMenu onNavigate={handleMobileNav} /> },
  ]

  function isActive(basePath: string) {
    const currentPath = stripLanguagePrefix(pathname).replace(/\/+$/, "") || "/"
    if (basePath === "/") return currentPath === "/"
    return currentPath === basePath || currentPath.startsWith(`${basePath}/`)
  }

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader className="h-16 shrink-0 justify-center px-2 py-0">
        <div className="relative flex h-8 items-center">
          <NavLink
            to={localizePath("/", language)}
            aria-hidden={collapsed || undefined}
            tabIndex={collapsed ? -1 : undefined}
            className="sidebar-brand absolute left-2 text-lg font-bold tracking-tight hover:opacity-80"
          >
            Devy
          </NavLink>
          <Tooltip delayDuration={250}>
            <TooltipTrigger asChild>
              <SidebarTrigger disabled={!hydrated} className="ml-auto size-8 shrink-0" aria-label={isMobile ? t.components.closeMenu : state === "expanded" ? t.components.collapseSidebar : t.components.expandSidebar} aria-expanded={isMobile ? openMobile : open} />
            </TooltipTrigger>
            <TooltipContent side="right">{isMobile ? t.components.closeMenu : state === "expanded" ? t.components.collapseSidebar : t.components.expandSidebar}</TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mb-2">
              <SidebarMenuItem><SearchCommandTrigger variant="sidebar" /></SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.basePath)}
                    tooltip={item.label}
                  >
                    <NavLink
                      to={item.to}
                      aria-label={item.label}
                      onPointerEnter={() => { void prefetchRoute(item.to) }}
                      onFocus={() => { void prefetchRoute(item.to) }}
                      onTouchStart={() => { void prefetchRoute(item.to) }}
                      onClick={(e) => handleMobileNav(e, item.to)}
                    >
                      {({ isPending }) => (
                        <>
                          <item.icon className={isPending ? "animate-pulse motion-reduce:animate-none" : undefined} />
                          <span className="sidebar-menu-label">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="관리자">
                    <NavLink to="/admin" onClick={(e) => handleMobileNav(e, "/admin")}>
                      <ShieldCheck />
                      <span className="sidebar-menu-label">관리자</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-0 p-2">
        <div className="sidebar-actions" style={{ "--action-count": actions.length } as CSSProperties}>
          {actions.map(({ key, label, element }, index) => <div key={key} className="sidebar-action" style={{ "--action-index": index } as CSSProperties}>
            <Tooltip>
              <TooltipTrigger asChild>{element}</TooltipTrigger>
              <TooltipContent side="top">{label}</TooltipContent>
            </Tooltip>
          </div>)}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  )
}
