import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRepositoryStore } from '../useRepositoryStore';
import type { GitHubRepository, GitHubRateLimit } from '@/types/github';
import type { ContentFile, ContentDirectory, BlogPost } from '@/services/github-content';

// Mock Zustand persist
const mockPersist = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

Object.defineProperty(window, 'localStorage', {
  value: mockPersist,
});

describe('useRepositoryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useRepositoryStore.getState().reset();
    });
  });

  afterEach(() => {
    // Clean up after each test
    act(() => {
      useRepositoryStore.getState().reset();
    });
  });

  const createMockRepository = (): GitHubRepository => ({
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
    updated_at: '2023-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
  });

  const createMockRateLimit = (): GitHubRateLimit => ({
    limit: 5000,
    used: 100,
    remaining: 4900,
    reset: Math.floor(Date.now() / 1000) + 3600,
  });

  const createMockContentFile = (): ContentFile => ({
    name: 'test.md',
    path: 'content/test.md',
    sha: 'abc123',
    size: 100,
    type: 'file',
    content: '# Test Content',
  });

  const createMockDirectory = (): ContentDirectory => ({
    path: 'content',
    files: [createMockContentFile()],
    subdirectories: ['posts', 'pages'],
  });

  const createMockBlogPost = (): BlogPost => ({
    ...createMockContentFile(),
    metadata: {
      title: 'Test Post',
      description: 'A test blog post',
      author: 'Test Author',
      date: '2023-01-01',
      category: 'Technology',
      tags: ['test', 'blog'],
      draft: false,
    },
    excerpt: 'This is a test excerpt',
    readingTime: 5,
  });

  describe('Repository Management', () => {
    it('should set and get current repository', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockRepo = createMockRepository();

      act(() => {
        result.current.setCurrentRepository(mockRepo);
      });

      expect(result.current.currentRepository).toEqual(mockRepo);
    });

    it('should clear caches when switching repositories', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockRepo1 = createMockRepository();
      const mockRepo2 = { ...createMockRepository(), id: 2, name: 'repo2' };
      const mockFile = createMockContentFile();

      act(() => {
        result.current.setCurrentRepository(mockRepo1);
        result.current.setContentFile('test.md', mockFile);
      });

      expect(result.current.getContentFile('test.md')).toEqual(mockFile);

      act(() => {
        result.current.setCurrentRepository(mockRepo2);
      });

      expect(result.current.currentRepository).toEqual(mockRepo2);
      expect(result.current.getContentFile('test.md')).toBeNull();
      expect(result.current.blogPosts).toEqual([]);
    });
  });

  describe('Rate Limit Management', () => {
    it('should set and get rate limit', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockRateLimit = createMockRateLimit();

      act(() => {
        result.current.setRateLimit(mockRateLimit);
      });

      expect(result.current.rateLimit).toEqual(mockRateLimit);
      expect(result.current.rateLimitError).toBeNull();
      expect(result.current.rateLimitLastFetch).toBeDefined();
    });

    it('should manage rate limit loading state', () => {
      const { result } = renderHook(() => useRepositoryStore());

      act(() => {
        result.current.setRateLimitLoading(true);
      });

      expect(result.current.isLoadingRateLimit).toBe(true);

      act(() => {
        result.current.setRateLimitLoading(false);
      });

      expect(result.current.isLoadingRateLimit).toBe(false);
    });

    it('should manage rate limit error state', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const errorMessage = 'Rate limit fetch failed';

      act(() => {
        result.current.setRateLimitError(errorMessage);
      });

      expect(result.current.rateLimitError).toBe(errorMessage);
      expect(result.current.isLoadingRateLimit).toBe(false);
    });

    it('should validate rate limit cache', () => {
      const { result } = renderHook(() => useRepositoryStore());

      // No rate limit set
      expect(result.current.isRateLimitCacheValid()).toBe(false);

      const mockRateLimit = createMockRateLimit();
      act(() => {
        result.current.setRateLimit(mockRateLimit);
      });

      // Just set, should be valid
      expect(result.current.isRateLimitCacheValid()).toBe(true);
    });
  });

  describe('Content Management', () => {
    it('should manage content file cache', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockFile = createMockContentFile();
      const filePath = 'content/test.md';

      act(() => {
        result.current.setContentFile(filePath, mockFile);
      });

      expect(result.current.getContentFile(filePath)).toEqual(mockFile);
      expect(result.current.getContentFile('nonexistent.md')).toBeNull();
    });

    it('should manage directory listing cache', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockDirectory = createMockDirectory();
      const dirPath = 'content';

      act(() => {
        result.current.setDirectoryListing(dirPath, mockDirectory);
      });

      expect(result.current.getDirectoryListing(dirPath)).toEqual(mockDirectory);
      expect(result.current.getDirectoryListing('nonexistent')).toBeNull();
    });

    it('should manage blog posts', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockPosts = [createMockBlogPost()];

      act(() => {
        result.current.setBlogPosts(mockPosts);
      });

      expect(result.current.blogPosts).toEqual(mockPosts);
      expect(result.current.isLoadingPosts).toBe(false);
    });

    it('should manage content loading states', () => {
      const { result } = renderHook(() => useRepositoryStore());

      act(() => {
        result.current.setContentLoading(true);
      });

      expect(result.current.isLoadingContent).toBe(true);

      act(() => {
        result.current.setPostsLoading(true);
      });

      expect(result.current.isLoadingPosts).toBe(true);
    });

    it('should manage content error states', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const errorMessage = 'Content fetch failed';

      act(() => {
        result.current.setContentError(errorMessage);
      });

      expect(result.current.contentError).toBe(errorMessage);
      expect(result.current.isLoadingContent).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should clear content cache', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockFile = createMockContentFile();
      const mockDirectory = createMockDirectory();
      const mockPosts = [createMockBlogPost()];

      act(() => {
        result.current.setContentFile('test.md', mockFile);
        result.current.setDirectoryListing('content', mockDirectory);
        result.current.setBlogPosts(mockPosts);
      });

      expect(result.current.getContentFile('test.md')).toEqual(mockFile);
      expect(result.current.blogPosts).toEqual(mockPosts);

      act(() => {
        result.current.clearContentCache();
      });

      expect(result.current.getContentFile('test.md')).toBeNull();
      expect(result.current.getDirectoryListing('content')).toBeNull();
      expect(result.current.blogPosts).toEqual([]);
    });

    it('should clear all caches', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockFile = createMockContentFile();
      const mockRateLimit = createMockRateLimit();

      act(() => {
        result.current.setContentFile('test.md', mockFile);
        result.current.setRateLimit(mockRateLimit);
      });

      expect(result.current.getContentFile('test.md')).toEqual(mockFile);
      expect(result.current.rateLimit).toEqual(mockRateLimit);

      act(() => {
        result.current.clearAllCaches();
      });

      expect(result.current.getContentFile('test.md')).toBeNull();
      expect(result.current.rateLimit).toBeNull();
      expect(result.current.rateLimitLastFetch).toBeNull();
    });
  });

  describe('Offline Management', () => {
    it('should manage offline status', () => {
      const { result } = renderHook(() => useRepositoryStore());

      act(() => {
        result.current.setOfflineStatus(true);
      });

      expect(result.current.isOffline).toBe(true);

      act(() => {
        result.current.setOfflineStatus(false);
      });

      expect(result.current.isOffline).toBe(false);
    });

    it('should update sync time', () => {
      const { result } = renderHook(() => useRepositoryStore());

      expect(result.current.lastSyncTime).toBeNull();

      act(() => {
        result.current.updateSyncTime();
      });

      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });
  });

  describe('Selectors', () => {
    it('should provide current repository selector', () => {
      const { result } = renderHook(() => ({
        store: useRepositoryStore(),
        currentRepo: useRepositoryStore.getState().currentRepository,
      }));

      const mockRepo = createMockRepository();

      act(() => {
        result.current.store.setCurrentRepository(mockRepo);
      });

      expect(useRepositoryStore.getState().currentRepository).toEqual(mockRepo);
    });

    it('should provide rate limit selector', () => {
      const mockRateLimit = createMockRateLimit();

      act(() => {
        useRepositoryStore.getState().setRateLimit(mockRateLimit);
      });

      const rateLimitState = useRepositoryStore.getState();
      expect(rateLimitState.rateLimit).toEqual(mockRateLimit);
      expect(rateLimitState.isLoadingRateLimit).toBe(false);
      expect(rateLimitState.rateLimitError).toBeNull();
    });

    it('should provide blog posts selector', () => {
      const mockPosts = [createMockBlogPost()];

      act(() => {
        useRepositoryStore.getState().setBlogPosts(mockPosts);
      });

      const postsState = useRepositoryStore.getState();
      expect(postsState.blogPosts).toEqual(mockPosts);
      expect(postsState.isLoadingPosts).toBe(false);
    });

    it('should provide offline status selector', () => {
      act(() => {
        useRepositoryStore.getState().setOfflineStatus(true);
        useRepositoryStore.getState().updateSyncTime();
      });

      const offlineState = useRepositoryStore.getState();
      expect(offlineState.isOffline).toBe(true);
      expect(offlineState.lastSyncTime).toBeInstanceOf(Date);
    });
  });

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useRepositoryStore());
      const mockRepo = createMockRepository();
      const mockRateLimit = createMockRateLimit();
      const mockFile = createMockContentFile();

      act(() => {
        result.current.setCurrentRepository(mockRepo);
        result.current.setRateLimit(mockRateLimit);
        result.current.setContentFile('test.md', mockFile);
        result.current.setOfflineStatus(true);
      });

      // Verify data is set
      expect(result.current.currentRepository).toEqual(mockRepo);
      expect(result.current.rateLimit).toEqual(mockRateLimit);
      expect(result.current.getContentFile('test.md')).toEqual(mockFile);
      expect(result.current.isOffline).toBe(true);

      act(() => {
        result.current.reset();
      });

      // Verify everything is reset
      expect(result.current.currentRepository).toBeNull();
      expect(result.current.rateLimit).toBeNull();
      expect(result.current.getContentFile('test.md')).toBeNull();
      expect(result.current.isOffline).toBe(false);
      expect(result.current.blogPosts).toEqual([]);
      expect(result.current.lastSyncTime).toBeNull();
    });
  });
});