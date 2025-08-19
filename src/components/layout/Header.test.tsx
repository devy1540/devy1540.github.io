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

  it('renders navigation links with icons', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /posts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderWithRouter(<Header />);
    const themeButton = screen.getByRole('button', { name: /switch theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('shows mobile menu button on small screens', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /메뉴 열기/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass('md:hidden');
  });

  it('opens mobile navigation sheet when menu button is clicked', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /메뉴 열기/i });
    
    fireEvent.click(menuButton);
    
    // Check if the sheet content appears (using unique description text)
    expect(screen.getByText('개발 여정을 기록하는 공간')).toBeInTheDocument();
    
    // Check if the sheet title is rendered (by role)
    expect(screen.getByRole('heading', { name: 'My Blog' })).toBeInTheDocument();
  });

  it('hides desktop navigation on mobile', () => {
    renderWithRouter(<Header />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('hidden', 'md:flex');
  });

  it('shows theme toggle in mobile menu when opened', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /메뉴 열기/i });
    
    fireEvent.click(menuButton);
    
    // Check if theme toggle appears in the mobile menu
    const mobileThemeButton = screen.getByRole('button', { name: /시스템 설정|다크 모드|라이트 모드/i });
    expect(mobileThemeButton).toBeInTheDocument();
  });

  it('displays user section placeholder in mobile menu', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /메뉴 열기/i });
    
    fireEvent.click(menuButton);
    
    // Check if user section appears
    expect(screen.getByText('로그인하여')).toBeInTheDocument();
    expect(screen.getByText('더 많은 기능을 사용하세요')).toBeInTheDocument();
  });

  it('shows enhanced navigation with icons in mobile menu', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /메뉴 열기/i });
    
    fireEvent.click(menuButton);
    
    // Check navigation items are rendered in mobile menu
    const mobileNavLinks = screen.getAllByRole('link');
    const homeLink = mobileNavLinks.find(link => link.textContent === 'Home');
    const postsLink = mobileNavLinks.find(link => link.textContent === 'Posts');
    
    expect(homeLink).toBeInTheDocument();
    expect(postsLink).toBeInTheDocument();
  });

  it('hamburger menu button shows visual feedback when active', () => {
    renderWithRouter(<Header />);
    const menuButton = screen.getByRole('button', { name: /메뉴 열기/i });
    
    fireEvent.click(menuButton);
    
    // Check if button shows active state
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(menuButton).toHaveAttribute('aria-label', '메뉴 닫기');
  });
});
