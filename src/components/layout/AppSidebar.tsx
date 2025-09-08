import {
  Home,
  FileText,
  User,
  Settings,
  PenTool,
  Github,
  Linkedin,
  Twitter,
  Mail,
} from 'lucide-react';
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
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types';

// Navigation items configuration - extracted for reusability
const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/about', label: 'About', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings, requiresAuth: true },
];

const authorOnlyItems: NavigationItem[] = [
  { to: '/editor', label: 'New Post', icon: PenTool, requiresAuth: true },
  { to: '/drafts', label: 'Drafts', icon: FileText, requiresAuth: true },
];

// Social links configuration - with proper URLs and labels
const socialLinks = [
  {
    href: 'https://github.com/devy1540',
    icon: Github,
    label: 'GitHub',
  },
  {
    href: 'https://linkedin.com/in/devy1540',
    icon: Linkedin,
    label: 'LinkedIn',
  },
  {
    href: 'https://twitter.com/devy1540',
    icon: Twitter,
    label: 'Twitter',
  },
  {
    href: 'mailto:contact@devy1540.github.io',
    icon: Mail,
    label: 'Email',
  },
] as const;

export function AppSidebar() {
  const { isAuthenticated, hasWriteAccess } = useGitHubAuthStore();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      {/* Brand Header */}
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-2 py-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              MB
            </span>
          </div>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <h3 className="font-semibold text-sidebar-foreground">My Blog</h3>
            <p className="text-xs text-sidebar-foreground/60">
              개발 여정을 기록하는 공간
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Section - Show actual login status */}
        {isAuthenticated && (
          <>
            <SidebarGroup>
              <SidebarGroupContent className="p-2">
                <div className="flex items-center space-x-3 px-2 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-sidebar-foreground">
                      로그인됨
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      블로그를 관리할 수 있습니다
                    </p>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />
          </>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'group/nav-link',
                            isActive &&
                              'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          )
                        }
                      >
                        <IconComponent className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.requiresAuth && (
                          <div
                            className="ml-auto w-2 h-2 rounded-full bg-orange-500 opacity-60 shrink-0"
                            title="로그인 필요"
                            aria-label="로그인 필요"
                          />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Author-only Navigation */}
        {isAuthenticated && hasWriteAccess && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                Author
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {authorOnlyItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild tooltip={item.label}>
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              cn(
                                'group/nav-link',
                                isActive &&
                                  'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              )
                            }
                          >
                            <IconComponent className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Social Links Footer */}
      <SidebarFooter className="border-t">
        <div className="p-2">
          <nav aria-label="소셜 미디어 링크">
            <div
              className={cn(
                // 기본 가로 배치
                'flex items-center justify-center gap-1',
                // 축소 모드에서 세로 배치
                'group-data-[collapsible=icon]:flex-col',
                'group-data-[collapsible=icon]:gap-2'
              )}
            >
              {socialLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    'h-8 w-8',
                    // 터치 영역 보장 (모바일)
                    'sm:h-10 sm:w-10 md:h-8 md:w-8',
                    // 최소 터치 영역 44px 보장
                    'min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] md:min-h-[32px] md:min-w-[32px]'
                  )}
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} 프로필 보기 (새 탭에서 열림)`}
                  >
                    <link.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </nav>

          {/* Copyright */}
          <div className="text-center mt-2 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-sidebar-foreground/40">
              © {new Date().getFullYear()} My Blog. All rights reserved.
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
