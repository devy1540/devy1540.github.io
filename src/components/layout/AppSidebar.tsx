import { Home, FileText, User, Settings, Monitor, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types';

export function AppSidebar() {
  const { theme, toggleTheme, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();

  const navItems: NavigationItem[] = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/posts', label: 'Posts', icon: FileText },
    { to: '/about', label: 'About', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings, requiresAuth: true },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r">
      {/* Brand Header */}
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-2 py-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">MB</span>
          </div>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <h3 className="font-semibold text-sidebar-foreground">My Blog</h3>
            <p className="text-xs text-sidebar-foreground/60">개발 여정을 기록하는 공간</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Section - Future Enhancement */}
        <SidebarGroup>
          <SidebarGroupContent className="p-2">
            <div className="flex items-center space-x-3 px-2 py-3 rounded-lg bg-sidebar-accent/50">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-sidebar-foreground">로그인하여</p>
                <p className="text-xs text-sidebar-foreground/60">더 많은 기능을 사용하세요</p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "group/nav-link",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          )
                        }
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.requiresAuth && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 opacity-60" 
                               title="로그인 필요" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Theme Toggle Footer */}
      <SidebarFooter className="border-t">
        <div className="p-2">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="w-full justify-start gap-2 h-9"
            size="sm"
          >
            {theme === 'system' ? (
              <Monitor className="h-4 w-4" />
            ) : effectiveTheme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="group-data-[collapsible=icon]:hidden">
              {theme === 'system' ? '시스템 설정' : effectiveTheme === 'dark' ? '다크 모드' : '라이트 모드'}
            </span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
