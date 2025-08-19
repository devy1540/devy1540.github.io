import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/useThemeStore';
import { Moon, Sun, Monitor } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Sidebar Trigger for Mobile */}
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="lg:hidden" />
            <Link to="/" className="flex items-center space-x-2 hover:text-primary transition-colors lg:hidden">
              <span className="text-lg font-bold">My Blog</span>
            </Link>
          </div>

          {/* Right side actions - Desktop only theme toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 lg:hidden"
              title={`Current: ${theme} (${effectiveTheme})`}
            >
              {theme === 'system' ? (
                <Monitor className="h-4 w-4" />
              ) : effectiveTheme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">
                Switch theme (Current: {theme})
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}