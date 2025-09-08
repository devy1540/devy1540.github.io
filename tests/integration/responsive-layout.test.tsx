import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SidebarProvider } from '@/components/ui/sidebar';

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

// 테스트 환경에서 매치미디어 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <SidebarProvider defaultOpen={true}>
      {children}
    </SidebarProvider>
  </BrowserRouter>
);

describe('Responsive Layout', () => {
  it('should render floating button with responsive positioning', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );
    
    const floatingButton = screen.getByRole('button', { name: /테마 선택/ });
    expect(floatingButton).toBeInTheDocument();
    
    // 반응형 클래스 확인
    expect(floatingButton).toHaveClass('fixed');
    expect(floatingButton).toHaveClass('bottom-4');
    expect(floatingButton).toHaveClass('right-4');
    expect(floatingButton).toHaveClass('md:bottom-6');
    expect(floatingButton).toHaveClass('md:right-6');
  });

  it('should maintain touch targets >= 44px on mobile', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );
    
    // 플로팅 버튼 터치 영역 확인
    const floatingButton = screen.getByRole('button', { name: /테마 선택/ });
    expect(floatingButton).toHaveClass('min-h-[44px]');
    expect(floatingButton).toHaveClass('min-w-[44px]');
    
    // 소셜 링크 터치 영역 확인 - 소셜 네비게이션 영역에서만 확인
    const socialNav = screen.getByRole('navigation', { name: /소셜 미디어 링크/ });
    const socialLinks = socialNav.querySelectorAll('a[target="_blank"]');
    socialLinks.forEach(link => {
      // asChild Button의 경우 클래스가 링크 자체에 적용됨
      expect(link).toHaveClass('min-h-[44px]');
      expect(link).toHaveClass('min-w-[44px]');
    });
  });

  it('should adapt social links layout when sidebar is collapsed', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );
    
    const socialContainer = screen.getByRole('navigation', { name: /소셜 미디어 링크/ });
    const socialLinksDiv = socialContainer.querySelector('div');
    
    // 축소 모드 반응형 클래스 확인
    expect(socialLinksDiv).toHaveClass('group-data-[collapsible=icon]:flex-col');
    expect(socialLinksDiv).toHaveClass('group-data-[collapsible=icon]:gap-2');
  });

  it('should have proper z-index for floating elements', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );
    
    const floatingButton = screen.getByRole('button', { name: /테마 선택/ });
    expect(floatingButton).toHaveClass('z-50');
  });
});