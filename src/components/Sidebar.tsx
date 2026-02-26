import { NavLink, useLocation } from "react-router-dom"
import { Home, FileText, Tags, User, Search, Library, BarChart3 } from "lucide-react"
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
import { ThemeToggle } from "@/components/ThemeToggle"
import { ColorThemeSelector } from "@/components/ColorThemeSelector"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useT } from "@/i18n"

const navIcons = {
  home: Home,
  posts: FileText,
  series: Library,
  search: Search,
  tags: Tags,
  analytics: BarChart3,
  about: User,
} as const

export function AppSidebar() {
  const { pathname } = useLocation()
  const t = useT()
  const { isMobile, setOpenMobile } = useSidebar()

  const navItems = [
    { label: t.common.home, to: "/", icon: navIcons.home },
    { label: t.common.posts, to: "/posts", icon: navIcons.posts },
    { label: t.common.series, to: "/series", icon: navIcons.series },
    { label: t.common.search, to: "/search", icon: navIcons.search },
    { label: t.common.tags, to: "/tags", icon: navIcons.tags },
    { label: t.common.analytics, to: "/analytics", icon: navIcons.analytics },
    { label: t.common.about, to: "/about", icon: navIcons.about },
  ]

  function isActive(to: string) {
    if (to === "/") return pathname === "/"
    return pathname.startsWith(to)
  }

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <NavLink
          to="/"
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
                    isActive={isActive(item.to)}
                    tooltip={item.label}
                  >
                    <NavLink to={item.to} viewTransition onClick={() => isMobile && setOpenMobile(false)}>
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
          <ThemeToggle />
          <ColorThemeSelector />
          <LanguageToggle />
        </div>
        <p className="text-xs text-sidebar-foreground/50 text-center pt-1 group-data-[state=collapsed]:hidden">
          &copy; {new Date().getFullYear()} Devy
        </p>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  )
}
