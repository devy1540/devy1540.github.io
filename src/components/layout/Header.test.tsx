import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from './Header';

// Mock the theme store
vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
    getEffectiveTheme: () => 'light',
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SidebarProvider>
        {component}
      </SidebarProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('renders simplified header for sidebar layout', () => {
    renderWithRouter(<Header />);
    // Header should be much simpler now with sidebar integration
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('shows mobile blog title and sidebar trigger on small screens', () => {
    renderWithRouter(<Header />);
    // Mobile title should be visible
    expect(screen.getByText('My Blog')).toBeInTheDocument();
    
    // Sidebar trigger should be present (by screen reader text)
    const sidebarTrigger = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(sidebarTrigger).toBeInTheDocument();
  });

  it('renders mobile theme toggle button', () => {
    renderWithRouter(<Header />);
    const themeButton = screen.getByRole('button', { name: /switch theme/i });
    expect(themeButton).toBeInTheDocument();
    expect(themeButton).toHaveClass('lg:hidden');
  });

  it('shows appropriate elements for mobile layout', () => {
    renderWithRouter(<Header />);
    
    // Mobile title should have lg:hidden class
    const titleLink = screen.getByRole('link', { name: /my blog/i });
    expect(titleLink).toHaveClass('lg:hidden');
    
    // Theme button should be mobile-only
    const themeButton = screen.getByRole('button', { name: /switch theme/i });
    expect(themeButton).toHaveClass('lg:hidden');
  });

  it('header has proper z-index for sidebar layout', () => {
    renderWithRouter(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('z-40');
  });
});
