import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';

// Mock the GitHub auth store
vi.mock('@/stores/useGitHubAuthStore');

const mockUseGitHubAuthStore = vi.mocked(useGitHubAuthStore);

// Wrapper component for React Router and SidebarProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <SidebarProvider defaultOpen={true}>
      {children}
    </SidebarProvider>
  </BrowserRouter>
);

describe('AppSidebar Social Links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: false,
      hasWriteAccess: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    });
  });

  it('should render all social links in sidebar footer', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // GitHub, LinkedIn, Twitter, Mail 링크 모두 렌더링 확인 - Story 5.3 개선된 aria-label
    expect(screen.getByRole('link', { name: /GitHub 프로필 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LinkedIn 프로필 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Twitter 프로필 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Email 프로필 보기/ })).toBeInTheDocument();
  });
  
  it('should open links in new tab with correct attributes', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // target="_blank", rel="noopener noreferrer" 확인
    const githubLink = screen.getByRole('link', { name: /GitHub 프로필 보기/ });
    const linkedinLink = screen.getByRole('link', { name: /LinkedIn 프로필 보기/ });
    const twitterLink = screen.getByRole('link', { name: /Twitter 프로필 보기/ });
    const emailLink = screen.getByRole('link', { name: /Email 프로필 보기/ });
    
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/devy1540');
    
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/devy1540');
    
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/devy1540');
    
    // Email link should also have target="_blank" in our implementation
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@devy1540.github.io');
    expect(emailLink).toHaveAttribute('target', '_blank');
    expect(emailLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
  
  it('should adapt layout when sidebar is collapsed', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // 축소 모드에서 세로 배치 확인 - group-data-[collapsible=icon]:flex-col 클래스
    const socialContainer = screen.getByRole('link', { name: /GitHub 프로필 보기/ }).closest('div');
    expect(socialContainer).toHaveClass('group-data-[collapsible=icon]:flex-col');
    expect(socialContainer).toHaveClass('group-data-[collapsible=icon]:gap-2');
  });
  
  it('should be accessible via keyboard and screen readers', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // Tab 네비게이션 및 aria-label 확인
    const githubLink = screen.getByRole('link', { name: /GitHub 프로필 보기/ });
    const linkedinLink = screen.getByRole('link', { name: /LinkedIn 프로필 보기/ });
    const twitterLink = screen.getByRole('link', { name: /Twitter 프로필 보기/ });
    const emailLink = screen.getByRole('link', { name: /Email 프로필 보기/ });
    
    expect(githubLink).toHaveAttribute('aria-label', 'GitHub 프로필 보기 (새 탭에서 열림)');
    expect(linkedinLink).toHaveAttribute('aria-label', 'LinkedIn 프로필 보기 (새 탭에서 열림)');
    expect(twitterLink).toHaveAttribute('aria-label', 'Twitter 프로필 보기 (새 탭에서 열림)');
    expect(emailLink).toHaveAttribute('aria-label', 'Email 프로필 보기 (새 탭에서 열림)');
    
    // Links should be focusable (default behavior, no explicit tabIndex needed)
    expect(githubLink).toBeVisible();
    expect(linkedinLink).toBeVisible();
    expect(twitterLink).toBeVisible();
    expect(emailLink).toBeVisible();
  });

  it('should have proper button styling and sizes', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // With asChild, the Button classes are applied to the link element itself - use improved aria-label
    const githubLink = screen.getByRole('link', { name: /GitHub 프로필 보기/ });
    
    // Button should have correct size classes applied to the link
    expect(githubLink).toHaveClass('h-8', 'w-8');
  });

  it('should display social footer with border separator', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // Should have border-t class for visual separation - use improved aria-label
    const socialFooter = screen.getByRole('link', { name: /GitHub 프로필 보기/ }).closest('[class*="border-t"]');
    expect(socialFooter).toBeInTheDocument();
  });

  it('should display copyright text with proper styling', () => {
    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    );
    
    // Copyright text should be present
    const copyrightText = screen.getByText(/© \d{4} My Blog. All rights reserved./);
    expect(copyrightText).toBeInTheDocument();
    
    // Should have proper styling classes for subtle appearance
    expect(copyrightText).toHaveClass('text-xs', 'text-sidebar-foreground/40');
    
    // Should have class that hides it when sidebar is collapsed
    const copyrightContainer = copyrightText.parentElement;
    expect(copyrightContainer).toHaveClass('group-data-[collapsible=icon]:hidden');
  });
});