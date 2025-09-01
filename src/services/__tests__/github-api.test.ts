import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubApiService } from '../github-api';

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      users: {
        getAuthenticated: vi.fn(),
      },
      repos: {
        listForAuthenticatedUser: vi.fn(),
        getContent: vi.fn(),
        createOrUpdateFileContents: vi.fn(),
        deleteFile: vi.fn(),
      },
      rateLimit: {
        get: vi.fn(),
      },
    },
  })),
}));

describe('GitHubApiService', () => {
  let service: GitHubApiService;
  let mockOctokit: {
    rest: {
      users: { getAuthenticated: ReturnType<typeof vi.fn> };
      repos: {
        listForAuthenticatedUser: ReturnType<typeof vi.fn>;
        getContent: ReturnType<typeof vi.fn>;
        createOrUpdateFileContents: ReturnType<typeof vi.fn>;
        deleteFile: ReturnType<typeof vi.fn>;
      };
      rateLimit: { get: ReturnType<typeof vi.fn> };
    };
  };

  beforeEach(() => {
    service = new GitHubApiService();
    mockOctokit = {
      rest: {
        users: {
          getAuthenticated: vi.fn(),
        },
        repos: {
          listForAuthenticatedUser: vi.fn(),
          getContent: vi.fn(),
          createOrUpdateFileContents: vi.fn(),
          deleteFile: vi.fn(),
        },
        rateLimit: {
          get: vi.fn().mockResolvedValue({
            data: {
              rate: {
                limit: 5000,
                used: 100,
                remaining: 4900,
                reset: Math.floor(Date.now() / 1000) + 3600,
              }
            }
          }),
        },
      },
    };
    
    // @ts-expect-error - Accessing private property for testing
    service.octokit = mockOctokit;
    // @ts-expect-error - Accessing private property for testing
    service.token = 'test-token';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('File CRUD Operations', () => {
    it('should get directory contents', async () => {
      const mockResponse = {
        data: [
          {
            name: 'test.md',
            path: 'content/test.md',
            sha: 'abc123',
            size: 100,
            url: 'https://api.github.com/repos/owner/repo/contents/content/test.md',
            html_url: 'https://github.com/owner/repo/blob/main/content/test.md',
            download_url: 'https://raw.githubusercontent.com/owner/repo/main/content/test.md',
            type: 'file',
            _links: {
              self: 'https://api.github.com/repos/owner/repo/contents/content/test.md',
              git: 'https://api.github.com/repos/owner/repo/git/blobs/abc123',
              html: 'https://github.com/owner/repo/blob/main/content/test.md'
            }
          }
        ]
      };

      mockOctokit.rest.repos.getContent.mockResolvedValueOnce(mockResponse);

      const result = await service.getDirectoryContents('owner', 'repo', 'content');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'test.md',
        path: 'content/test.md',
        type: 'file',
        sha: 'abc123',
        size: 100,
      });
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'content',
        ref: undefined,
      });
    });

    it('should get file content', async () => {
      const mockResponse = {
        data: {
          name: 'test.md',
          path: 'content/test.md',
          sha: 'abc123',
          size: 100,
          url: 'https://api.github.com/repos/owner/repo/contents/content/test.md',
          html_url: 'https://github.com/owner/repo/blob/main/content/test.md',
          download_url: 'https://raw.githubusercontent.com/owner/repo/main/content/test.md',
          type: 'file',
          content: 'VGVzdCBjb250ZW50',
          encoding: 'base64',
        }
      };

      mockOctokit.rest.repos.getContent.mockResolvedValueOnce(mockResponse);

      const result = await service.getFileContent('owner', 'repo', 'content/test.md');

      expect(result).toMatchObject({
        name: 'test.md',
        path: 'content/test.md',
        type: 'file',
        content: 'VGVzdCBjb250ZW50',
        encoding: 'base64',
      });
    });

    it('should create or update file', async () => {
      const mockResponse = {
        data: {
          commit: {
            sha: 'def456',
            message: 'Create content/test.md',
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z',
            },
            committer: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z',
            },
          }
        }
      };

      mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValueOnce(mockResponse);

      const result = await service.createOrUpdateFile(
        'owner',
        'repo',
        'content/test.md',
        'Test content',
        { message: 'Create test file' }
      );

      expect(result).toMatchObject({
        sha: 'def456',
        message: 'Create content/test.md',
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'content/test.md',
        message: 'Create test file',
        content: expect.any(String), // Base64 encoded content
        branch: undefined,
        sha: undefined,
      });
    });

    it('should delete file', async () => {
      const mockResponse = {
        data: {
          commit: {
            sha: 'ghi789',
            message: 'Delete content/test.md',
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z',
            },
            committer: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z',
            },
          }
        }
      };

      mockOctokit.rest.repos.deleteFile.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteFile(
        'owner',
        'repo',
        'content/test.md',
        'abc123',
        { message: 'Remove test file' }
      );

      expect(result).toMatchObject({
        sha: 'ghi789',
        message: 'Delete content/test.md',
      });

      expect(mockOctokit.rest.repos.deleteFile).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'content/test.md',
        message: 'Remove test file',
        sha: 'abc123',
        branch: undefined,
      });
    });

    it('should decode base64 file content', async () => {
      const testContent = 'Hello, World!';
      const encodedContent = btoa(unescape(encodeURIComponent(testContent)));
      
      const mockResponse = {
        data: {
          name: 'test.md',
          path: 'content/test.md',
          sha: 'abc123',
          size: 100,
          url: 'https://api.github.com/repos/owner/repo/contents/content/test.md',
          html_url: 'https://github.com/owner/repo/blob/main/content/test.md',
          download_url: 'https://raw.githubusercontent.com/owner/repo/main/content/test.md',
          type: 'file',
          content: encodedContent,
          encoding: 'base64',
        }
      };

      mockOctokit.rest.repos.getContent.mockResolvedValueOnce(mockResponse);

      const result = await service.getDecodedFileContent('owner', 'repo', 'content/test.md');

      expect(result).toBe(testContent);
    });
  });

  describe('Rate Limit Handling', () => {
    it('should get rate limit info', async () => {
      const mockResponse = {
        data: {
          rate: {
            limit: 5000,
            used: 100,
            remaining: 4900,
            reset: Math.floor(Date.now() / 1000) + 3600,
          }
        }
      };

      mockOctokit.rest.rateLimit.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getRateLimit();

      expect(result).toMatchObject({
        limit: 5000,
        used: 100,
        remaining: 4900,
        reset: expect.any(Number),
      });
    });

    it('should cache rate limit info', async () => {
      const mockResponse = {
        data: {
          rate: {
            limit: 5000,
            used: 100,
            remaining: 4900,
            reset: Math.floor(Date.now() / 1000) + 3600,
          }
        }
      };

      mockOctokit.rest.rateLimit.get.mockResolvedValueOnce(mockResponse);

      // First call should fetch from API
      const result1 = await service.getRateLimitInfo();
      expect(mockOctokit.rest.rateLimit.get).toHaveBeenCalledTimes(1);

      // Second call within cache period should use cache
      const result2 = await service.getRateLimitInfo();
      expect(mockOctokit.rest.rateLimit.get).toHaveBeenCalledTimes(1); // Still 1

      expect(result1).toEqual(result2);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors properly', async () => {
      const error = new Error('Not Found');
      // @ts-expect-error - Adding status property for testing
      error.status = 404;

      mockOctokit.rest.repos.getContent.mockRejectedValue(error);

      // Mock retryWithBackoff to avoid actual retry delays  
      const retryBackoffSpy = vi
        .spyOn(service, 'retryWithBackoff')
        .mockRejectedValue(new Error('GitHub resource not found.'));

      await expect(
        service.getDirectoryContents('owner', 'repo', 'nonexistent')
      ).rejects.toThrow('GitHub resource not found.');

      retryBackoffSpy.mockRestore();
    });

    it('should handle rate limit errors', async () => {
      const error = new Error('API rate limit exceeded');
      // @ts-expect-error - Adding status property for testing
      error.status = 403;

      // Mock all retry attempts to fail
      mockOctokit.rest.repos.getContent
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      // Mock rate limit to avoid long waits in test
      // @ts-expect-error - Accessing private property for testing
      service.rateLimitCache = {
        limit: 5000,
        used: 5000,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + 1, // Reset in 1 second
      };
      // @ts-expect-error - Accessing private property for testing
      service.rateLimitCacheExpiry = Date.now() + 60000; // Valid cache

      // Mock retryWithBackoff to avoid actual retry delays
      const retryBackoffSpy = vi
        .spyOn(service, 'retryWithBackoff')
        .mockRejectedValue(new Error('GitHub API rate limit exceeded. Please try again later.'));

      await expect(
        service.getDirectoryContents('owner', 'repo', 'content')
      ).rejects.toThrow('GitHub API rate limit exceeded. Please try again later.');

      retryBackoffSpy.mockRestore();
    });
  });

  describe('Recursive Directory Traversal', () => {
    it('should traverse directory recursively', async () => {
      const mockRootResponse = {
        data: [
          {
            name: 'posts',
            path: 'content/posts',
            sha: 'dir123',
            size: 0,
            type: 'dir',
            url: 'https://api.github.com/repos/owner/repo/contents/content/posts',
            html_url: 'https://github.com/owner/repo/tree/main/content/posts',
            download_url: null,
            _links: {
              self: 'https://api.github.com/repos/owner/repo/contents/content/posts',
              git: 'https://api.github.com/repos/owner/repo/git/trees/dir123',
              html: 'https://github.com/owner/repo/tree/main/content/posts'
            }
          },
          {
            name: 'config.json',
            path: 'content/config.json',
            sha: 'file123',
            size: 100,
            type: 'file',
            url: 'https://api.github.com/repos/owner/repo/contents/content/config.json',
            html_url: 'https://github.com/owner/repo/blob/main/content/config.json',
            download_url: 'https://raw.githubusercontent.com/owner/repo/main/content/config.json',
            _links: {
              self: 'https://api.github.com/repos/owner/repo/contents/content/config.json',
              git: 'https://api.github.com/repos/owner/repo/git/blobs/file123',
              html: 'https://github.com/owner/repo/blob/main/content/config.json'
            }
          }
        ]
      };

      const mockSubdirResponse = {
        data: [
          {
            name: 'post1.md',
            path: 'content/posts/post1.md',
            sha: 'post123',
            size: 200,
            type: 'file',
            url: 'https://api.github.com/repos/owner/repo/contents/content/posts/post1.md',
            html_url: 'https://github.com/owner/repo/blob/main/content/posts/post1.md',
            download_url: 'https://raw.githubusercontent.com/owner/repo/main/content/posts/post1.md',
            _links: {
              self: 'https://api.github.com/repos/owner/repo/contents/content/posts/post1.md',
              git: 'https://api.github.com/repos/owner/repo/git/blobs/post123',
              html: 'https://github.com/owner/repo/blob/main/content/posts/post1.md'
            }
          }
        ]
      };

      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce(mockRootResponse)
        .mockResolvedValueOnce(mockSubdirResponse);

      const result = await service.getDirectoryContentsRecursive('owner', 'repo', 'content');

      expect(result).toHaveLength(3); // posts dir + config.json + post1.md
      expect(result.find(item => item.name === 'posts')).toBeDefined();
      expect(result.find(item => item.name === 'config.json')).toBeDefined();
      expect(result.find(item => item.name === 'post1.md')).toBeDefined();
    });
  });
});