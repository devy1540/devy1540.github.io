import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGitHubAuthStore } from '../useGitHubAuthStore';
import type { GitHubUser, GitHubRepository } from '@/types/github';

// Mock services
vi.mock('@/services/github-auth');
vi.mock('@/services/github-api');

const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: 'https://github.com/avatar.jpg',
  html_url: 'https://github.com/testuser',
  bio: 'Test bio',
  public_repos: 10,
  followers: 5,
  following: 3,
};

const mockRepository: GitHubRepository = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  description: 'Test repository',
  private: false,
  html_url: 'https://github.com/testuser/test-repo',
  clone_url: 'https://github.com/testuser/test-repo.git',
  ssh_url: 'git@github.com:testuser/test-repo.git',
  default_branch: 'main',
  permissions: {
    admin: true,
    push: true,
    pull: true,
  },
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
};

describe('useGitHubAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useGitHubAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      repositories: [],
      accessToken: null,
      error: null,
      lastSyncAt: null,
    });

    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.repositories).toEqual([]);
    expect(result.current.accessToken).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.lastSyncAt).toBeNull();
  });

  it('should handle loginWithToken action', async () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    // Mock successful authentication
    const mockAuthService = await import('@/services/github-auth');
    const mockApiService = await import('@/services/github-api');

    vi.mocked(
      mockAuthService.GitHubAuthService.prototype.authenticateWithToken
    ).mockResolvedValue({ success: true });

    vi.mocked(
      mockApiService.GitHubApiService.prototype.getCurrentUser
    ).mockResolvedValue(mockUser);

    vi.mocked(
      mockApiService.GitHubApiService.prototype.getUserRepositories
    ).mockResolvedValue([mockRepository]);

    await act(async () => {
      await result.current.loginWithToken('test-token');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle successful repositories fetch', async () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    // Set authenticated state first
    act(() => {
      useGitHubAuthStore.setState({
        isAuthenticated: true,
        accessToken: 'test-token',
        user: mockUser,
      });
    });

    const mockApiService = await import('@/services/github-api');
    vi.mocked(
      mockApiService.GitHubApiService.prototype.getUserRepositories
    ).mockResolvedValue([mockRepository]);

    await act(async () => {
      await result.current.fetchRepositories();
    });

    expect(result.current.repositories).toEqual([mockRepository]);
    expect(result.current.error).toBeNull();
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    // Set authenticated state first
    act(() => {
      useGitHubAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        repositories: [mockRepository],
        accessToken: 'test-token',
      });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.repositories).toEqual([]);
    expect(result.current.accessToken).toBeNull();
  });

  it('should fetch user info', async () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    // Set token first
    act(() => {
      useGitHubAuthStore.setState({
        accessToken: 'test-token',
      });
    });

    const mockApiService = await import('@/services/github-api');
    vi.mocked(
      mockApiService.GitHubApiService.prototype.getCurrentUser
    ).mockResolvedValue(mockUser);

    await act(async () => {
      await result.current.fetchUserInfo();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should handle authentication errors in fetch operations', async () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    act(() => {
      useGitHubAuthStore.setState({
        accessToken: 'test-token',
        isAuthenticated: true,
      });
    });

    const mockApiService = await import('@/services/github-api');
    vi.mocked(
      mockApiService.GitHubApiService.prototype.getCurrentUser
    ).mockRejectedValue(new Error('GitHub authentication expired'));

    await act(async () => {
      await result.current.fetchUserInfo();
    });

    // Should logout when authentication expires
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should refresh token', async () => {
    const { result } = renderHook(() => useGitHubAuthStore());

    const mockAuthService = await import('@/services/github-auth');
    const mockApiService = await import('@/services/github-api');

    vi.mocked(
      mockAuthService.GitHubAuthService.prototype.getStoredToken
    ).mockReturnValue('stored-token');

    vi.mocked(
      mockAuthService.GitHubAuthService.prototype.validateToken
    ).mockResolvedValue(true);

    vi.mocked(
      mockApiService.GitHubApiService.prototype.getCurrentUser
    ).mockResolvedValue(mockUser);

    vi.mocked(
      mockApiService.GitHubApiService.prototype.getUserRepositories
    ).mockResolvedValue([mockRepository]);

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.accessToken).toBe('stored-token');
  });
});
