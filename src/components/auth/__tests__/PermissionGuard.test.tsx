import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { PermissionGuard } from '../PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';

vi.mock('@/hooks/usePermissions');
vi.mock('@/stores/useGitHubAuthStore');
vi.mock('../ReadOnlyBanner', () => ({
  ReadOnlyBanner: ({ owner, repo }: { owner: string; repo: string }) => (
    <div data-testid="read-only-banner">
      Read Only Banner for {owner}/{repo}
    </div>
  ),
}));

const mockUsePermissions = usePermissions as Mock;
const mockUseGitHubAuthStore = useGitHubAuthStore as Mock;

describe('PermissionGuard', () => {
  const defaultProps = {
    owner: 'testowner',
    repo: 'testrepo',
    children: <div data-testid="protected-content">Protected Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated with write access', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
    });

    mockUsePermissions.mockReturnValue({
      hasWriteAccess: true,
      isCheckingPermission: false,
    });

    render(<PermissionGuard {...defaultProps} />);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('read-only-banner')).not.toBeInTheDocument();
  });

  it('shows fallback when not authenticated and requireAuth is true', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: false,
    });

    const fallback = <div data-testid="fallback">Please login</div>;

    render(
      <PermissionGuard
        {...defaultProps}
        fallback={fallback}
        requireAuth={true}
      />
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows fallback when permission check is in progress', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
    });

    mockUsePermissions.mockReturnValue({
      hasWriteAccess: false,
      isCheckingPermission: true,
    });

    const fallback = <div data-testid="fallback">Loading...</div>;

    render(<PermissionGuard {...defaultProps} fallback={fallback} />);

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows read-only banner and fallback when authenticated but no write access', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
    });

    mockUsePermissions.mockReturnValue({
      hasWriteAccess: false,
      isCheckingPermission: false,
    });

    const fallback = <div data-testid="fallback">No access</div>;

    render(<PermissionGuard {...defaultProps} fallback={fallback} />);

    expect(screen.getByTestId('read-only-banner')).toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('hides read-only banner when showReadOnlyBanner is false', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
    });

    mockUsePermissions.mockReturnValue({
      hasWriteAccess: false,
      isCheckingPermission: false,
    });

    const fallback = <div data-testid="fallback">No access</div>;

    render(
      <PermissionGuard
        {...defaultProps}
        fallback={fallback}
        showReadOnlyBanner={false}
      />
    );

    expect(screen.queryByTestId('read-only-banner')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('allows access when requireAuth is false and user is not authenticated', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: false,
    });

    mockUsePermissions.mockReturnValue({
      hasWriteAccess: true,
      isCheckingPermission: false,
    });

    render(<PermissionGuard {...defaultProps} requireAuth={false} />);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('calls usePermissions with correct parameters', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
    });

    mockUsePermissions.mockReturnValue({
      hasWriteAccess: true,
      isCheckingPermission: false,
    });

    render(<PermissionGuard {...defaultProps} />);

    expect(mockUsePermissions).toHaveBeenCalledWith({
      owner: 'testowner',
      repo: 'testrepo',
      autoCheck: true,
    });
  });
});
