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
import { Moon, Sun, Monitor, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types';

export function Header() {
  const { theme, toggleTheme, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const navItems: NavigationItem[] = [
    { to: '/', label: 'Home' },
    { to: '/posts', label: 'Posts' },
    { to: '/about', label: 'About' },
    { to: '/settings', label: 'Settings' },
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
              {navItems.map(item => (
                <NavigationMenuItem key={item.to}>
                  <NavLink 
                    to={item.to} 
                    className={({ isActive }) => 
                      cn(
                        navigationMenuTriggerStyle(),
                        isActive && "bg-accent/50 text-accent-foreground"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </NavigationMenuItem>
              ))}
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
                  className="h-9 w-9 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetTitle className="mb-2">Navigation</SheetTitle>
                <SheetDescription className="mb-4">Navigate through the blog pages</SheetDescription>
                <nav className="flex flex-col space-y-4">
                  {navItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSheetOpen(false)}
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors hover:text-primary px-2 py-2 rounded-md hover:bg-accent ${
                          isActive 
                            ? 'text-primary bg-accent font-semibold' 
                            : 'text-muted-foreground'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}