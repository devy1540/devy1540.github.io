import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GitHubLoginButton } from '../GitHubLoginButton';

// Mock the GitHub auth store
const mockLoginWithToken = vi.fn();
const mockStore = {
  loginWithToken: mockLoginWithToken,
  isLoading: false,
  error: null,
};

vi.mock('@/stores/useGitHubAuthStore', () => ({
  useGitHubAuthStore: () => mockStore,
}));

describe('GitHubLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store to default state
    mockStore.isLoading = false;
    mockStore.error = null;
  });

  it('should render login button', () => {
    render(<GitHubLoginButton />);

    expect(
      screen.getByRole('button', { name: /GitHub에 연결/i })
    ).toBeInTheDocument();
    expect(screen.getByText('GitHub에 연결')).toBeInTheDocument();
  });

  it('should call loginWithToken when form is submitted', async () => {
    render(<GitHubLoginButton />);

    const tokenInput = screen.getByPlaceholderText('ghp_xxxxxxxxxxxx');
    const loginButton = screen.getByRole('button', { name: /GitHub에 연결/i });

    fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    fireEvent.click(loginButton);

    expect(mockLoginWithToken).toHaveBeenCalledWith('test-token');
  });

  it('should show loading state', () => {
    // Set loading state
    mockStore.isLoading = true;

    render(<GitHubLoginButton />);

    expect(screen.getByText('연결 중...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /연결 중/i })).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'Authentication failed';

    // Set error state
    mockStore.error = errorMessage;

    render(<GitHubLoginButton />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <GitHubLoginButton className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<GitHubLoginButton />);

    const button = screen.getByRole('button', { name: /GitHub에 연결/i });
    expect(button).toHaveAttribute('type', 'submit');
  });
});
