import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GitHubApiService } from '../github-api';

describe('GitHubApiService - Permission Checks', () => {
  let service: GitHubApiService;
  let mockOctokit: {
    rest: {
      repos: {
        getCollaboratorPermissionLevel: Mock;
      };
      users: {
        getAuthenticated: Mock;
      };
    };
  };

  beforeEach(() => {
    service = new GitHubApiService();

    mockOctokit = {
      rest: {
        repos: {
          getCollaboratorPermissionLevel: vi.fn(),
        },
        users: {
          getAuthenticated: vi.fn(),
        },
        rateLimit: {
          get: vi.fn().mockResolvedValue({
            data: {
              rate: {
                limit: 5000,
                used: 100,
                remaining: 4900,
                reset: Date.now() / 1000 + 3600,
              },
            },
          }),
        },
      },
    };

    // Mock the private octokit property
    (service as unknown as { octokit: typeof mockOctokit }).octokit =
      mockOctokit;
    (service as unknown as { token: string }).token = 'test-token';
  });

  describe('checkRepositoryPermission', () => {
    it('returns write access for admin permission', async () => {
      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockResolvedValue({
        data: { permission: 'admin' },
      });

      const result = await service.checkRepositoryPermission(
        'owner',
        'repo',
        'user'
      );

      expect(result.hasWriteAccess).toBe(true);
      expect(result.permission).toBe('admin');
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('returns write access for write permission', async () => {
      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockResolvedValue({
        data: { permission: 'write' },
      });

      const result = await service.checkRepositoryPermission(
        'owner',
        'repo',
        'user'
      );

      expect(result.hasWriteAccess).toBe(true);
      expect(result.permission).toBe('write');
    });

    it('returns no write access for read permission', async () => {
      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockResolvedValue({
        data: { permission: 'read' },
      });

      const result = await service.checkRepositoryPermission(
        'owner',
        'repo',
        'user'
      );

      expect(result.hasWriteAccess).toBe(false);
      expect(result.permission).toBe('read');
    });

    it('returns no write access for none permission', async () => {
      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockResolvedValue({
        data: { permission: 'none' },
      });

      const result = await service.checkRepositoryPermission(
        'owner',
        'repo',
        'user'
      );

      expect(result.hasWriteAccess).toBe(false);
      expect(result.permission).toBe('none');
    });

    it('uses current user when username not provided', async () => {
      mockOctokit.rest.users.getAuthenticated.mockResolvedValue({
        data: { login: 'currentuser' },
      });

      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockResolvedValue({
        data: { permission: 'write' },
      });

      await service.checkRepositoryPermission('owner', 'repo');

      expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
      expect(
        mockOctokit.rest.repos.getCollaboratorPermissionLevel
      ).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        username: 'currentuser',
      });
    });

    it('handles 404 error gracefully', async () => {
      const error = new Error('Not Found');
      (error as unknown as { status: number }).status = 404;

      // Mock handleApiError to return the expected error format
      const handleApiErrorSpy = vi
        .spyOn(service, 'handleApiError')
        .mockReturnValue(
          Object.assign(new Error('GitHub resource not found.'), {
            status: 404,
          })
        );

      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockRejectedValue(
        error
      );

      const result = await service.checkRepositoryPermission(
        'owner',
        'repo',
        'user'
      );

      expect(result.hasWriteAccess).toBe(false);
      expect(result.permission).toBe('none');
      expect(result.checkedAt).toBeInstanceOf(Date);

      handleApiErrorSpy.mockRestore();
    });

    it('handles 403 error gracefully', async () => {
      const error = new Error('Forbidden');
      (error as unknown as { status: number }).status = 403;

      // Mock handleApiError to return the expected error format
      const handleApiErrorSpy = vi
        .spyOn(service, 'handleApiError')
        .mockReturnValue(
          Object.assign(
            new Error(
              'GitHub API rate limit exceeded. Please try again later.'
            ),
            { status: 403 }
          )
        );

      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockRejectedValue(
        error
      );

      const result = await service.checkRepositoryPermission(
        'owner',
        'repo',
        'user'
      );

      expect(result.hasWriteAccess).toBe(false);
      expect(result.permission).toBe('none');

      handleApiErrorSpy.mockRestore();
    });

    it('throws other errors', async () => {
      const error = new Error('Server Error');
      (error as unknown as { status: number }).status = 500;

      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockRejectedValue(
        error
      );

      await expect(
        service.checkRepositoryPermission('owner', 'repo', 'user')
      ).rejects.toThrow();
    });

    it('throws error when not authenticated', async () => {
      const unauthenticatedService = new GitHubApiService();

      await expect(
        unauthenticatedService.checkRepositoryPermission(
          'owner',
          'repo',
          'user'
        )
      ).rejects.toThrow('GitHub API client is not authenticated');
    });
  });
});
