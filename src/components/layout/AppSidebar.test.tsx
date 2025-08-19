import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

// Mock the theme store
vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
    getEffectiveTheme: () => 'light',
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SidebarProvider>
        {component}
      </SidebarProvider>
    </BrowserRouter>
  );
};

describe('AppSidebar', () => {
  it('renders brand header with logo and title', () => {
    renderWithProviders(<AppSidebar />);
    
    expect(screen.getByText('MB')).toBeInTheDocument();
    expect(screen.getByText('My Blog')).toBeInTheDocument();
    expect(screen.getByText('개발 여정을 기록하는 공간')).toBeInTheDocument();
  });

  it('displays user section placeholder', () => {
    renderWithProviders(<AppSidebar />);
    
    expect(screen.getByText('로그인하여')).toBeInTheDocument();
    expect(screen.getByText('더 많은 기능을 사용하세요')).toBeInTheDocument();
  });

  it('renders navigation menu with icons', () => {
    renderWithProviders(<AppSidebar />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /posts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('shows auth requirement indicator for settings', () => {
    renderWithProviders(<AppSidebar />);
    
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toBeInTheDocument();
    
    // Check if the orange auth indicator dot is present
    const authIndicator = settingsLink.querySelector('.bg-orange-500');
    expect(authIndicator).toBeInTheDocument();
  });

  it('includes theme toggle in footer', () => {
    renderWithProviders(<AppSidebar />);
    
    // QA Enhancement: More descriptive aria-label for better accessibility
    const themeButton = screen.getByRole('button', { name: /테마 전환: 현재 light 모드/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('sidebar has proper structure with header, content, footer', () => {
    renderWithProviders(<AppSidebar />);
    
    // Check for structural elements
    expect(screen.getByText('Navigation')).toBeInTheDocument(); // SidebarGroupLabel
  });
});
