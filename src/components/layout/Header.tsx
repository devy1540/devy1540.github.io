import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu';
import { useThemeStore } from '@/stores/useThemeStore';
import { Moon, Sun, Monitor, Menu, Home, FileText, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types';

export function Header() {
  const { theme, toggleTheme, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const navItems: NavigationItem[] = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/posts', label: 'Posts', icon: FileText },
    { to: '/about', label: 'About', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings, requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center space-x-2 hover:text-primary transition-colors">
            <span className="text-xl font-bold">My Blog</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex" viewport={false}>
            <NavigationMenuList>
              {navItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <NavigationMenuItem key={item.to}>
                    <NavLink 
                      to={item.to} 
                      className={({ isActive }) => 
                        cn(
                          navigationMenuTriggerStyle(),
                          "flex items-center space-x-2",
                          isActive && "bg-accent/50 text-accent-foreground"
                        )
                      }
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              title={`Current: ${theme} (${effectiveTheme})`}
            >
              {theme === 'system' ? (
                <Monitor className="h-5 w-5" />
              ) : effectiveTheme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">
                Switch theme (Current: {theme})
              </span>
            </Button>

            {/* Mobile Menu with Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 md:hidden transition-all duration-200",
                    sheetOpen && "bg-accent text-accent-foreground"
                  )}
                  aria-expanded={sheetOpen}
                  aria-label={sheetOpen ? "메뉴 닫기" : "메뉴 열기"}
                >
                  <Menu className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    sheetOpen && "rotate-90"
                  )} />
                  <span className="sr-only">{sheetOpen ? "메뉴 닫기" : "메뉴 열기"}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[340px] lg:w-[380px] p-0 max-w-[85vw]">
                {/* Brand Header Section */}
                <div className="border-b bg-muted/10 px-6 py-4">
                  <SheetTitle className="text-lg font-bold text-primary">My Blog</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mt-1">
                    개발 여정을 기록하는 공간
                  </SheetDescription>
                </div>

                {/* User Section - Future Enhancement */}
                <div className="px-6 py-3 border-b bg-muted/5">
                  <div className="flex items-center space-x-3 min-h-[48px]">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">로그인하여</p>
                      <p className="text-xs text-muted-foreground">더 많은 기능을 사용하세요</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 px-6 py-4">
                  <nav className="space-y-1">
                    {navItems.map(item => {
                      const IconComponent = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setSheetOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "group flex items-center space-x-3 rounded-lg px-3 py-4 text-sm font-medium transition-all duration-200 min-h-[48px]",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              isActive 
                                ? "bg-accent text-accent-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground"
                            )
                          }
                        >
                          <IconComponent className="h-5 w-5 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.requiresAuth && (
                            <div className="w-2 h-2 rounded-full bg-orange-500 opacity-60" title="로그인 필요" />
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>

                {/* Theme Toggle Section */}
                <div className="border-t px-6 py-4 bg-muted/5">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">테마 설정</p>
                    <Button
                      variant="outline"
                      onClick={toggleTheme}
                      className="w-full justify-start space-x-3 min-h-[48px]"
                    >
                      {theme === 'system' ? (
                        <Monitor className="h-5 w-5" />
                      ) : effectiveTheme === 'dark' ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                      <span className="flex-1 text-left">
                        {theme === 'system' ? '시스템 설정' : effectiveTheme === 'dark' ? '다크 모드' : '라이트 모드'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {theme}
                      </span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}