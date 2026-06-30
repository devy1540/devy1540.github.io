import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Home, FileText, Tags, User, Library, BarChart3 } from "lucide-react"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ColorThemeSelector } from "@/components/ColorThemeSelector"
import { LanguageToggle } from "@/components/LanguageToggle"
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts"
import { useLanguage } from "@/i18n"
import { localizePath, stripLanguagePrefix } from "@/lib/i18n-routing"

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
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()

  function handleMobileNav(e: React.MouseEvent, to: string) {
    if (!isMobile) return
    e.preventDefault()
    setOpenMobile(false)
    setTimeout(() => {
      document.startViewTransition(() => navigate(to))
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

  function isActive(basePath: string) {
    const currentPath = stripLanguagePrefix(pathname).replace(/\/+$/, "") || "/"
    if (basePath === "/") return currentPath === "/"
    return currentPath === basePath || currentPath.startsWith(`${basePath}/`)
  }

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <NavLink
          to={localizePath("/", language)}
          viewTransition
          className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity group-data-[collapsible=icon]:text-center"
        >
          <span className="group-data-[state=collapsed]:hidden">Devy</span>
          <span className="hidden group-data-[state=collapsed]:inline">D</span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.basePath)}
                    tooltip={item.label}
                  >
                    <NavLink to={item.to} viewTransition onClick={(e) => handleMobileNav(e, item.to)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-center gap-1 group-data-[state=collapsed]:flex-col">
          <Tooltip>
            <TooltipTrigger asChild><ThemeToggle /></TooltipTrigger>
            <TooltipContent side="top">{t.components.toggleTheme}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild><ColorThemeSelector /></TooltipTrigger>
            <TooltipContent side="top">{t.components.colorTheme}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild><LanguageToggle /></TooltipTrigger>
            <TooltipContent side="top">{t.components.toggleLanguage}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild><KeyboardShortcuts /></TooltipTrigger>
            <TooltipContent side="top">{t.components.keyboardShortcuts}</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-sidebar-foreground/50 text-center pt-1 group-data-[state=collapsed]:hidden">
          &copy; {new Date().getFullYear()} Devy
          {" | "}
          <NavLink
            to={localizePath("/privacy", language)}
            viewTransition
            onClick={(e) => handleMobileNav(e, localizePath("/privacy", language))}
            className="hover:text-sidebar-foreground/80 transition-colors"
          >
            {t.common.privacy}
          </NavLink>
        </p>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  )
}
