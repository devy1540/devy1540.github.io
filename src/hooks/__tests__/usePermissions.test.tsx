import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { usePermissions } from '../usePermissions';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';

vi.mock('@/stores/useGitHubAuthStore');

const mockUseGitHubAuthStore = useGitHubAuthStore as Mock;

describe('usePermissions', () => {
  const mockCheckWritePermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGitHubAuthStore.mockReturnValue({
      hasWriteAccess: false,
      permissionCheckAt: null,
      isLoading: false,
      error: null,
      checkWritePermission: mockCheckWritePermission,
      isAuthenticated: false,
    });
  });

  it('returns permission state correctly', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      hasWriteAccess: true,
      permissionCheckAt: new Date('2023-01-01'),
      isLoading: false,
      error: null,
      checkWritePermission: mockCheckWritePermission,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasWriteAccess).toBe(true);
    expect(result.current.isCheckingPermission).toBe(false);
    expect(result.current.permissionError).toBe(null);
    expect(result.current.permissionCheckAt).toEqual(new Date('2023-01-01'));
  });

  it('auto-checks permission when authenticated and no previous check', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      hasWriteAccess: false,
      permissionCheckAt: null,
      isLoading: false,
      error: null,
      checkWritePermission: mockCheckWritePermission,
      isAuthenticated: true,
    });

    renderHook(() =>
      usePermissions({
        owner: 'testowner',
        repo: 'testrepo',
        autoCheck: true,
      })
    );

    expect(mockCheckWritePermission).toHaveBeenCalledWith(
      'testowner',
      'testrepo'
    );
  });

  it('does not auto-check when autoCheck is false', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      hasWriteAccess: false,
      permissionCheckAt: null,
      isLoading: false,
      error: null,
      checkWritePermission: mockCheckWritePermission,
      isAuthenticated: true,
    });

    renderHook(() =>
      usePermissions({
        owner: 'testowner',
        repo: 'testrepo',
        autoCheck: false,
      })
    );

    expect(mockCheckWritePermission).not.toHaveBeenCalled();
  });

  it('does not auto-check when not authenticated', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      hasWriteAccess: false,
      permissionCheckAt: null,
      isLoading: false,
      error: null,
      checkWritePermission: mockCheckWritePermission,
      isAuthenticated: false,
    });

    renderHook(() =>
      usePermissions({
        owner: 'testowner',
        repo: 'testrepo',
        autoCheck: true,
      })
    );

    expect(mockCheckWritePermission).not.toHaveBeenCalled();
  });

  it('does not auto-check when permission already checked', () => {
    mockUseGitHubAuthStore.mockReturnValue({
      hasWriteAccess: true,
      permissionCheckAt: new Date(),
      isLoading: false,
      error: null,
      checkWritePermission: mockCheckWritePermission,
      isAuthenticated: true,
    });

    renderHook(() =>
      usePermissions({
        owner: 'testowner',
        repo: 'testrepo',
        autoCheck: true,
      })
    );

    expect(mockCheckWritePermission).not.toHaveBeenCalled();
  });

  it('checkPermission calls store action with correct parameters', async () => {
    const { result } = renderHook(() => usePermissions());

    await act(async () => {
      await result.current.checkPermission('owner', 'repo');
    });

    expect(mockCheckWritePermission).toHaveBeenCalledWith('owner', 'repo');
  });

  it('retryPermissionCheck works when owner and repo are provided', async () => {
    const { result } = renderHook(() =>
      usePermissions({
        owner: 'testowner',
        repo: 'testrepo',
      })
    );

    await act(async () => {
      await result.current.retryPermissionCheck();
    });

    expect(mockCheckWritePermission).toHaveBeenCalledWith(
      'testowner',
      'testrepo'
    );
  });

  it('retryPermissionCheck does not call when owner/repo not provided', async () => {
    const { result } = renderHook(() => usePermissions());

    await act(async () => {
      await result.current.retryPermissionCheck();
    });

    expect(mockCheckWritePermission).not.toHaveBeenCalled();
  });
});
