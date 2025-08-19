import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  it('renders the blog title', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('My Blog')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /posts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderWithRouter(<Header />);
    const themeButton = screen.getByRole('button', { name: /switch theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('shows mobile menu button on small screens', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass('md:hidden');
  });

  it('opens mobile navigation sheet when menu button is clicked', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    fireEvent.click(menuButton);
    
    // Check if the navigation title appears in the sheet
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('hides desktop navigation on mobile', () => {
    renderWithRouter(<Header />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('hidden', 'md:flex');
  });
});
