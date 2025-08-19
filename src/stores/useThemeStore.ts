import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'gray' | 'black';

interface ThemeState {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;
  applyCurrentTheme: () => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      accentColor: 'blue',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme, get().accentColor);
      },
      setAccentColor: (color) => {
        set({ accentColor: color });
        applyTheme(get().theme, color);
      },
      toggleTheme: () => {
        set((state) => {
          // Cycle through: light → dark → system → light
          let newTheme: Theme;
          switch (state.theme) {
            case 'light':
              newTheme = 'dark';
              break;
            case 'dark':
              newTheme = 'system';
              break;
            case 'system':
              newTheme = 'light';
              break;
            default:
              newTheme = 'light';
          }
          applyTheme(newTheme, get().accentColor);
          return { theme: newTheme };
        });
      },
      applyCurrentTheme: () => {
        const { theme, accentColor } = get();
        applyTheme(theme, accentColor);
      },
      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Automatically apply theme when store is rehydrated
        state?.applyCurrentTheme();
      },
    }
  )
);

/**
 * Applies the given theme and accent color to the document root element
 * @param theme - The theme to apply ('light', 'dark', or 'system')
 * @param accentColor - The accent color to apply
 */
// Shadcn UI 공식 OKLCH 색상 값 사용
const accentColorMap: Record<AccentColor, { light: string; dark: string }> = {
  blue: { light: 'oklch(65% 0.15 230)', dark: 'oklch(75% 0.15 230)' },
  green: { light: 'oklch(60% 0.16 142)', dark: 'oklch(70% 0.14 142)' },
  purple: { light: 'oklch(62% 0.18 263)', dark: 'oklch(72% 0.16 263)' },
  orange: { light: 'oklch(68% 0.18 25)', dark: 'oklch(78% 0.16 25)' },
  red: { light: 'oklch(62% 0.25 25)', dark: 'oklch(72% 0.23 25)' },
  pink: { light: 'oklch(65% 0.20 330)', dark: 'oklch(75% 0.18 330)' },
  gray: { light: 'oklch(45% 0.02 0)', dark: 'oklch(85% 0.02 0)' },
  black: { light: 'oklch(20% 0 0)', dark: 'oklch(95% 0 0)' },
};

function applyTheme(theme: Theme, accentColor: AccentColor) {
  const root = document.documentElement;
  
  // Apply theme class
  let isDark = false;
  if (theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', isDark);
  } else {
    isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
  }
  
  // Apply accent color using --color-primary (shadcn/ui 공식 방식)
  const colorValue = accentColorMap[accentColor][isDark ? 'dark' : 'light'];
  root.style.setProperty('--color-primary', colorValue);
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      state.applyCurrentTheme();
    }
  });
}
