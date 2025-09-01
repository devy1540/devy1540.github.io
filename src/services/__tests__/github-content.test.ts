import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubContentService } from '../github-content';
import type { GitHubRepository } from '@/types/github';

// Mock GitHubApiService
vi.mock('../github-api');

describe('GitHubContentService', () => {
  let service: GitHubContentService;
  let mockApiService: {
    getDirectoryContents: ReturnType<typeof vi.fn>;
    getDirectoryContentsRecursive: ReturnType<typeof vi.fn>;
    getFileContent: ReturnType<typeof vi.fn>;
    getDecodedFileContent: ReturnType<typeof vi.fn>;
    createOrUpdateFile: ReturnType<typeof vi.fn>;
    deleteFile: ReturnType<typeof vi.fn>;
  };
  let mockRepo: GitHubRepository;

  beforeEach(() => {
    mockApiService = {
      getDirectoryContents: vi.fn(),
      getDirectoryContentsRecursive: vi.fn(),
      getFileContent: vi.fn(),
      getDecodedFileContent: vi.fn(),
      createOrUpdateFile: vi.fn(),
      deleteFile: vi.fn(),
    };

    service = new GitHubContentService(mockApiService);

    mockRepo = {
      id: 1,
      name: 'test-blog',
      full_name: 'testuser/test-blog',
      description: 'Test blog repository',
      private: false,
      html_url: 'https://github.com/testuser/test-blog',
      clone_url: 'https://github.com/testuser/test-blog.git',
      ssh_url: 'git@github.com:testuser/test-blog.git',
      default_branch: 'main',
      permissions: {
        admin: true,
        push: true,
        pull: true,
      },
      updated_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
    };

    service.setCurrentRepository(mockRepo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Repository Management', () => {
    it('should set and get current repository', () => {
      expect(service.getCurrentRepository()).toEqual(mockRepo);
    });

    it('should throw error when no repository is set', () => {
      const newService = new GitHubContentService(mockApiService);

      // @ts-expect-error - Testing private method
      expect(() => newService.getOwnerAndRepo()).toThrow(
        'No repository selected. Please set a current repository first.'
      );
    });
  });

  describe('Content Directory Listing', () => {
    it('should get content directory listing', async () => {
      const mockItems = [
        {
          name: 'posts',
          path: 'content/posts',
          sha: 'dir123',
          size: 0,
          type: 'dir',
          url: 'https://api.github.com/test',
          html_url: 'https://github.com/test',
          download_url: null,
          _links: { self: '', git: '', html: '' },
        },
        {
          name: 'config.json',
          path: 'content/config.json',
          sha: 'file123',
          size: 100,
          type: 'file',
          url: 'https://api.github.com/test',
          html_url: 'https://github.com/test',
          download_url: 'https://raw.githubusercontent.com/test',
          _links: { self: '', git: '', html: '' },
        },
      ];

      mockApiService.getDirectoryContents.mockResolvedValueOnce(mockItems);

      const result = await service.getContentDirectoryListing('content');

      expect(result).toEqual({
        path: 'content',
        files: [
          {
            name: 'config.json',
            path: 'content/config.json',
            sha: 'file123',
            size: 100,
            type: 'file',
            downloadUrl: 'https://raw.githubusercontent.com/test',
          },
        ],
        subdirectories: ['posts'],
      });

      expect(mockApiService.getDirectoryContents).toHaveBeenCalledWith(
        'testuser',
        'test-blog',
        'content'
      );
    });

    it('should return empty structure when content folder does not exist', async () => {
      const error = new Error('Not Found');
      (error as unknown as { status: number }).status = 404;
      mockApiService.getDirectoryContents.mockRejectedValueOnce(error);

      const result = await service.getContentDirectoryListing('content');

      expect(result).toEqual({
        path: 'content',
        files: [],
        subdirectories: [],
      });
    });
  });

  describe('File Content Operations', () => {
    it('should get file content', async () => {
      const mockFileContent = {
        name: 'test.md',
        path: 'content/posts/test.md',
        sha: 'file123',
        size: 200,
        url: 'https://api.github.com/test',
        html_url: 'https://github.com/test',
        download_url: 'https://raw.githubusercontent.com/test',
        type: 'file',
        content: 'base64content',
        encoding: 'base64',
      };

      const decodedContent = '# Test Post\n\nThis is a test post.';

      mockApiService.getFileContent.mockResolvedValueOnce(mockFileContent);
      mockApiService.getDecodedFileContent.mockResolvedValueOnce(
        decodedContent
      );

      const result = await service.getFileContent('content/posts/test.md');

      expect(result).toEqual({
        name: 'test.md',
        path: 'content/posts/test.md',
        sha: 'file123',
        size: 200,
        type: 'file',
        content: decodedContent,
        downloadUrl: 'https://raw.githubusercontent.com/test',
      });
    });

    it('should get all content files recursively', async () => {
      const mockFiles = [
        {
          name: 'config.json',
          path: 'content/config.json',
          sha: 'file1',
          size: 100,
          type: 'file',
        },
        {
          name: 'post1.md',
          path: 'content/posts/post1.md',
          sha: 'file2',
          size: 200,
          type: 'file',
        },
      ];

      mockApiService.getDirectoryContentsRecursive.mockResolvedValueOnce(
        mockFiles
      );

      const result = await service.getAllContentFiles('content');

      expect(result).toEqual(mockFiles);
      expect(mockApiService.getDirectoryContentsRecursive).toHaveBeenCalledWith(
        'testuser',
        'test-blog',
        'content'
      );
    });
  });

  describe('Blog Posts', () => {
    it('should get blog posts with metadata', async () => {
      const mockPostsDirectory = {
        name: 'posts',
        path: 'content/posts',
        sha: 'dir123',
        size: 0,
        type: 'dir',
        url: 'https://api.github.com/test',
        html_url: 'https://github.com/test',
        download_url: null,
        _links: { self: '', git: '', html: '' },
      };

      const mockContent = `---
title: "Test Post"
description: "A test blog post"
author: "Test Author"
date: "2023-01-01"
category: "Technology"
tags: ["test", "blog"]
draft: false
---

# Test Post

This is the content of the test post.

Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

      mockApiService.getDirectoryContents.mockResolvedValueOnce([
        {
          ...mockPostsDirectory,
          name: 'test-post.md',
          path: 'content/posts/test-post.md',
          type: 'file',
          size: 500,
        },
      ]);

      mockApiService.getFileContent.mockResolvedValueOnce({
        name: 'test-post.md',
        path: 'content/posts/test-post.md',
        sha: 'file123',
        size: 500,
        type: 'file',
        download_url: 'https://raw.githubusercontent.com/test',
      });

      mockApiService.getDecodedFileContent.mockResolvedValueOnce(mockContent);

      const result = await service.getBlogPosts();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'test-post.md',
        path: 'content/posts/test-post.md',
        content: mockContent,
        metadata: {
          title: 'Test Post',
          description: 'A test blog post',
          author: 'Test Author',
          date: '2023-01-01',
          category: 'Technology',
          tags: ['test', 'blog'],
          draft: false,
        },
      });

      expect(result[0].excerpt).toContain(
        'This is the content of the test post.'
      );
      expect(result[0].readingTime).toBeGreaterThan(0);
    });

    it('should create a new blog post', async () => {
      const mockCommitInfo = {
        sha: 'commit123',
        message: 'Add new blog post: Test Title',
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
      };

      mockApiService.createOrUpdateFile.mockResolvedValueOnce(mockCommitInfo);

      const result = await service.createBlogPost(
        'Test Title',
        'This is the content of the blog post.',
        {
          author: 'Test Author',
          category: 'Technology',
          tags: ['test', 'blog'],
        }
      );

      expect(result).toEqual(mockCommitInfo);
      expect(mockApiService.createOrUpdateFile).toHaveBeenCalledWith(
        'testuser',
        'test-blog',
        expect.stringMatching(
          /content\/posts\/\d{4}-\d{2}-\d{2}-test-title\.md/
        ),
        expect.stringContaining('---\ntitle: "Test Title"'),
        expect.objectContaining({
          message: 'Add new blog post: Test Title',
        })
      );
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract post metadata from front matter', () => {
      const content = `---
title: "Test Post"
description: "A test description"
author: "Test Author"
date: "2023-01-01"
category: "Technology"
tags: ["test", "blog", "javascript"]
draft: true
---

# Post Content

This is the actual content.`;

      // Access private method for testing
      const metadata = (
        service as unknown as {
          extractPostMetadata: (content: string) => Record<string, unknown>;
        }
      ).extractPostMetadata(content);

      expect(metadata).toEqual({
        title: 'Test Post',
        description: 'A test description',
        author: 'Test Author',
        date: '2023-01-01',
        category: 'Technology',
        tags: ['test', 'blog', 'javascript'],
        draft: true,
      });
    });

    it('should extract excerpt from content', () => {
      const content = `---
title: "Test Post"
---

# First Paragraph

This is the first paragraph that should be used as excerpt.

## Second Section

This should not be included in the excerpt.`;

      const excerpt = (
        service as unknown as {
          extractExcerpt: (content: string, length: number) => string;
        }
      ).extractExcerpt(content, 100);

      expect(excerpt).toBe(
        'This is the first paragraph that should be used as excerpt.'
      );
    });

    it('should calculate reading time', () => {
      const shortContent = 'Short content with few words.';
      const longContent = 'Lorem ipsum '.repeat(200); // ~400 words

      const shortTime = (
        service as unknown as {
          calculateReadingTime: (content: string) => number;
        }
      ).calculateReadingTime(shortContent);
      const longTime = (
        service as unknown as {
          calculateReadingTime: (content: string) => number;
        }
      ).calculateReadingTime(longContent);

      expect(shortTime).toBe(1); // Minimum 1 minute
      expect(longTime).toBeGreaterThan(1);
    });
  });

  describe('File Operations', () => {
    it('should create a file', async () => {
      const mockCommitInfo = {
        sha: 'commit123',
        message: 'Create test.md',
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
      };

      mockApiService.createOrUpdateFile.mockResolvedValueOnce(mockCommitInfo);

      const result = await service.createFile(
        'content/pages/about.md',
        '# About Page\n\nThis is the about page.'
      );

      expect(result).toEqual(mockCommitInfo);
      expect(mockApiService.createOrUpdateFile).toHaveBeenCalledWith(
        'testuser',
        'test-blog',
        'content/pages/about.md',
        '# About Page\n\nThis is the about page.',
        expect.objectContaining({
          message: 'Create content/pages/about.md',
        })
      );
    });

    it('should update a file', async () => {
      const mockCommitInfo = {
        sha: 'commit456',
        message: 'Update test.md',
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
      };

      mockApiService.createOrUpdateFile.mockResolvedValueOnce(mockCommitInfo);

      const result = await service.updateFile(
        'content/pages/about.md',
        '# Updated About Page\n\nThis is the updated about page.',
        'file123'
      );

      expect(result).toEqual(mockCommitInfo);
      expect(mockApiService.createOrUpdateFile).toHaveBeenCalledWith(
        'testuser',
        'test-blog',
        'content/pages/about.md',
        '# Updated About Page\n\nThis is the updated about page.',
        expect.objectContaining({
          message: 'Update content/pages/about.md',
          sha: 'file123',
        })
      );
    });

    it('should delete a file', async () => {
      const mockCommitInfo = {
        sha: 'commit789',
        message: 'Delete test.md',
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
      };

      mockApiService.deleteFile.mockResolvedValueOnce(mockCommitInfo);

      const result = await service.deleteFile(
        'content/pages/old-page.md',
        'file123'
      );

      expect(result).toEqual(mockCommitInfo);
      expect(mockApiService.deleteFile).toHaveBeenCalledWith(
        'testuser',
        'test-blog',
        'content/pages/old-page.md',
        'file123',
        expect.objectContaining({
          message: 'Delete content/pages/old-page.md',
        })
      );
    });
  });

  describe('Configuration Files', () => {
    it('should get categories', async () => {
      const mockCategories = [
        { name: 'Technology', slug: 'technology' },
        { name: 'Lifestyle', slug: 'lifestyle' },
      ];

      mockApiService.getFileContent.mockResolvedValueOnce({
        name: 'categories.json',
        path: 'content/categories.json',
        sha: 'file123',
        size: 100,
        type: 'file',
      });

      mockApiService.getDecodedFileContent.mockResolvedValueOnce(
        JSON.stringify(mockCategories)
      );

      const result = await service.getCategories();

      expect(result).toEqual(mockCategories);
    });

    it('should get blog config', async () => {
      const mockConfig = {
        title: 'My Blog',
        description: 'A personal blog',
        author: 'John Doe',
      };

      mockApiService.getFileContent.mockResolvedValueOnce({
        name: 'config.json',
        path: 'content/config.json',
        sha: 'file123',
        size: 100,
        type: 'file',
      });

      mockApiService.getDecodedFileContent.mockResolvedValueOnce(
        JSON.stringify(mockConfig)
      );

      const result = await service.getBlogConfig();

      expect(result).toEqual(mockConfig);
    });

    it('should return empty config when files do not exist', async () => {
      const error = new Error('Not Found');
      (error as unknown as { status: number }).status = 404;
      mockApiService.getFileContent.mockRejectedValue(error);

      const categories = await service.getCategories();
      const config = await service.getBlogConfig();

      expect(categories).toEqual([]);
      expect(config).toEqual({});
    });
  });

  describe('Slug Generation', () => {
    it('should generate proper slugs', () => {
      const testCases = [
        { input: 'Hello World', expected: 'hello-world' },
        { input: 'React & JavaScript Tips', expected: 'react-javascript-tips' },
        { input: '한글 제목 테스트', expected: '한글-제목-테스트' },
        { input: 'Multiple   Spaces', expected: 'multiple-spaces' },
        { input: 'Special-Characters!@#', expected: 'special-characters' },
      ];

      for (const testCase of testCases) {
        const slug = (
          service as unknown as { generateSlug: (input: string) => string }
        ).generateSlug(testCase.input);
        expect(slug).toBe(testCase.expected);
      }
    });
  });
});
