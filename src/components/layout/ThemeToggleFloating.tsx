import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';
import { useMemo, useCallback } from 'react';
import type { Theme } from '@/stores/useThemeStore';

// Theme options configuration for better maintainability
const THEME_OPTIONS = [
  { value: 'light' as Theme, label: '라이트 모드', icon: Sun },
  { value: 'dark' as Theme, label: '다크 모드', icon: Moon },
  { value: 'system' as Theme, label: '시스템 설정', icon: Monitor },
] as const;

export function ThemeToggleFloating() {
  const { theme, setTheme, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();

  // Memoize theme icon to prevent unnecessary re-renders
  const themeIcon = useMemo(() => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    return effectiveTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  }, [theme, effectiveTheme]);

  // Memoize aria label for accessibility
  const ariaLabel = useMemo(() => {
    const currentThemeText =
      theme === 'system'
        ? '시스템 설정'
        : effectiveTheme === 'dark'
          ? '다크 모드'
          : '라이트 모드';
    return `테마 선택: 현재 ${currentThemeText}`;
  }, [theme, effectiveTheme]);

  // Memoize theme handler to prevent recreation on every render
  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            // 기본 모바일 스타일
            'fixed bottom-4 right-4 z-50',
            // 태블릿 이상: 더 큰 여백
            'md:bottom-6 md:right-6',
            // 포커스 접근성
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            // 터치 영역 보장 (최소 44px)
            'min-h-[44px] min-w-[44px] h-12 w-12',
            // 호버 상태
            'hover:bg-accent hover:text-accent-foreground',
            // 그림자 효과로 떠있는 느낌
            'shadow-lg hover:shadow-xl transition-shadow',
            // iOS Safari safe area 대응 및 성능 최적화
            'pb-safe-bottom pr-safe-right will-change-transform'
          )}
          aria-label={ariaLabel}
          tabIndex={0}
        >
          {themeIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleThemeChange(value)}
            className={cn('cursor-pointer', theme === value && 'bg-accent')}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
