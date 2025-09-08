import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

// Mock the GitHub auth store
vi.mock('@/stores/useGitHubAuthStore', () => ({
  useGitHubAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    hasWriteAccess: false,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuthStatus: vi.fn(),
  })),
}));

// Mock the theme store
vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: vi.fn(() => ({
    theme: 'system',
    accentColor: 'blue',
    setTheme: vi.fn(),
    setAccentColor: vi.fn(),
    toggleTheme: vi.fn(),
    applyCurrentTheme: vi.fn(),
    getEffectiveTheme: vi.fn(() => 'light'),
  })),
}));

// Wrapper component for React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Layout Footer Removal Integration', () => {
  it('should not render Footer component', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </RouterWrapper>
    );
    
    // Footer 컴포넌트의 특징적인 background 클래스가 없어야 함
    expect(document.querySelector('.bg-muted\\/30')).not.toBeInTheDocument();
    
    // Footer 컴포넌트가 DOM에 없음을 확인 (footer 태그 자체가 없어야 함)
    expect(document.querySelector('footer')).not.toBeInTheDocument();
    
    // Copyright는 이제 사이드바에 있어야 함 (Footer에서 사이드바로 이동)
    const copyrightInSidebar = screen.getByText(/© \d{4} My Blog. All rights reserved./);
    expect(copyrightInSidebar).toBeInTheDocument();
    expect(copyrightInSidebar.closest('[data-slot="sidebar"]')).toBeInTheDocument();
  });
  
  it('should expand content area after footer removal', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div data-testid="main-content">Test content</div>
        </Layout>
      </RouterWrapper>
    );
    
    // 메인 콘텐츠 영역이 flex-1 클래스를 가져 확장됨을 확인 - Layout의 main element 선택
    const mainContent = screen.getByTestId('main-content').closest('main');
    expect(mainContent).toHaveClass('flex-1');
    
    // Test content should be rendered
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('should render social links in sidebar instead of footer', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </RouterWrapper>
    );
    
    // 사이드바에 소셜 링크들이 있는지 확인 - Story 5.3에서 개선된 aria-label 반영
    expect(screen.getByRole('link', { name: /GitHub 프로필 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LinkedIn 프로필 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Twitter 프로필 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Email 프로필 보기/ })).toBeInTheDocument();
    
    // 이 링크들이 사이드바 내부에 있는지 확인
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    expect(sidebar).toBeInTheDocument();
    
    // 소셜 링크가 사이드바 내부에 있는지 확인
    const githubLink = screen.getByRole('link', { name: /GitHub 프로필 보기/ });
    expect(sidebar).toContainElement(githubLink);
  });

  it('should maintain proper layout structure without footer', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </RouterWrapper>
    );
    
    // SidebarProvider should be present - look for the wrapper div
    expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeInTheDocument();
    
    // SidebarInset should have proper flex classes - look for the correct data attribute
    const sidebarInset = document.querySelector('[data-slot="sidebar-inset"]');
    expect(sidebarInset).toHaveClass('flex', 'flex-col', 'flex-1');
    
    // Main content should be properly structured
    const mainContent = screen.getByText('Test content').closest('main');
    expect(mainContent).toHaveClass('flex-1');
    expect(mainContent).toContainElement(screen.getByText('Test content'));
  });

  it('should have theme toggle floating button', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </RouterWrapper>
    );
    
    // ThemeToggleFloating should be present
    // It should be a button with theme selection aria-label
    const themeButton = screen.getByRole('button', { name: /테마 선택/ });
    expect(themeButton).toBeInTheDocument();
    expect(themeButton).toHaveClass('fixed');
  });
});