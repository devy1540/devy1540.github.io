import { NavLink, useLocation } from "react-router-dom"
import { Home, FileText, Tags, User } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ColorThemeSelector } from "@/components/ColorThemeSelector"

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Posts", to: "/posts", icon: FileText },
  { label: "Tags", to: "/tags", icon: Tags },
  { label: "About", to: "/about", icon: User },
]

export function AppSidebar() {
  const { pathname } = useLocation()

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
                    <NavLink to={item.to} viewTransition>
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
        </div>
        <p className="text-xs text-sidebar-foreground/50 text-center pt-1 group-data-[state=collapsed]:hidden">
          &copy; {new Date().getFullYear()} Devy
        </p>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  )
}
