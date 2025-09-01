import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GitHubLoginButton } from '../GitHubLoginButton';

// Mock the GitHub auth store
const mockLogin = vi.fn();
vi.mock('@/stores/useGitHubAuthStore', () => ({
  useGitHubAuthStore: () => ({
    login: mockLogin,
    isLoading: false,
    error: null
  })
}));

describe('GitHubLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login button', () => {
    render(<GitHubLoginButton />);
    
    expect(screen.getByRole('button', { name: /GitHub로 로그인/i })).toBeInTheDocument();
    expect(screen.getByText('GitHub로 로그인')).toBeInTheDocument();
  });

  it('should call login when clicked', async () => {
    render(<GitHubLoginButton />);
    
    const loginButton = screen.getByRole('button', { name: /GitHub로 로그인/i });
    fireEvent.click(loginButton);
    
    expect(mockLogin).toHaveBeenCalledOnce();
  });

  it('should show loading state', () => {
    vi.doMock('@/stores/useGitHubAuthStore', () => ({
      useGitHubAuthStore: () => ({
        login: mockLogin,
        isLoading: true,
        error: null
      })
    }));

    const { rerender } = render(<GitHubLoginButton />);
    rerender(<GitHubLoginButton />);
    
    expect(screen.getByText('연결 중...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'Authentication failed';
    
    vi.doMock('@/stores/useGitHubAuthStore', () => ({
      useGitHubAuthStore: () => ({
        login: mockLogin,
        isLoading: false,
        error: errorMessage
      })
    }));

    const { rerender } = render(<GitHubLoginButton />);
    rerender(<GitHubLoginButton />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<GitHubLoginButton className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<GitHubLoginButton />);
    
    const button = screen.getByRole('button', { name: /GitHub로 로그인/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});