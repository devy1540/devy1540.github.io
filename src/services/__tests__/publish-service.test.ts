import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PublishService } from '../publish-service';
import { GitHubContentService } from '../github-content';
import { PostData, PublishConfig } from '@/types/publish';
import { usePublishStore } from '@/stores/usePublishStore';

// Mock the publish store
vi.mock('@/stores/usePublishStore', () => ({
  usePublishStore: {
    getState: vi.fn(),
  },
}));

// Mock GitHubContentService
const mockContentService = {
  getCurrentRepository: vi.fn(),
  getFileContent: vi.fn(),
  createFile: vi.fn(),
  updateFile: vi.fn(),
} as unknown as GitHubContentService;

describe('PublishService', () => {
  let publishService: PublishService;
  let mockStore: Record<string, unknown>;

  beforeEach(() => {
    publishService = new PublishService(mockContentService);

    mockStore = {
      setPublishing: vi.fn(),
      updatePublishStage: vi.fn(),
      setPublishStatus: vi.fn(),
    };

    (usePublishStore.getState as Mock).mockReturnValue(mockStore);

    vi.clearAllMocks();
  });

  describe('generateFilename', () => {
    it('should generate filename with date and slug', () => {
      const postData: PostData = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        metadata: {
          title: 'Test Post',
          date: '2024-03-15',
        },
      };

      const filename = publishService.generateFilename(postData);
      expect(filename).toBe('2024-03-15-test-post.md');
    });

    it('should use current date if no date provided', () => {
      const postData: PostData = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        metadata: {
          title: 'Test Post',
        },
      };

      const filename = publishService.generateFilename(postData);
      const today = new Date().toISOString().split('T')[0];
      expect(filename).toBe(`${today}-test-post.md`);
    });
  });

  describe('generateCommitMessage', () => {
    it('should generate proper commit message', () => {
      const postData: PostData = {
        title: 'My Test Post',
        content: 'This is a test post with some content',
        slug: 'my-test-post',
        metadata: {
          title: 'My Test Post',
          category: 'tech',
          tags: ['test', 'demo'],
        },
      };

      const message = publishService.generateCommitMessage(postData);

      expect(message).toContain('feat: add new blog post "My Test Post"');
      expect(message).toContain('Category: tech');
      expect(message).toContain('Tags: test, demo');
      expect(message).toContain('Word count: ~');
      expect(message).toContain('Published via Blog CMS');
    });

    it('should handle missing metadata gracefully', () => {
      const postData: PostData = {
        title: 'Simple Post',
        content: 'Simple content',
        slug: 'simple-post',
        metadata: {
          title: 'Simple Post',
        },
      };

      const message = publishService.generateCommitMessage(postData);

      expect(message).toContain('feat: add new blog post "Simple Post"');
      expect(message).toContain('Category: uncategorized');
      expect(message).toContain('Tags: none');
    });
  });

  describe('generateMarkdownContent', () => {
    it('should generate markdown with frontmatter', () => {
      const postData: PostData = {
        title: 'Test Post',
        content: '# Hello World\n\nThis is content.',
        slug: 'test-post',
        metadata: {
          title: 'Test Post',
          description: 'A test post',
          author: 'Test Author',
          date: '2024-03-15',
          category: 'tech',
          tags: ['test', 'demo'],
          draft: false,
        },
      };

      const markdown = publishService.generateMarkdownContent(postData);

      expect(markdown).toContain('---');
      expect(markdown).toContain('title: "Test Post"');
      expect(markdown).toContain('description: "A test post"');
      expect(markdown).toContain('author: "Test Author"');
      expect(markdown).toContain('date: "2024-03-15"');
      expect(markdown).toContain('category: "tech"');
      expect(markdown).toContain('tags: ["test", "demo"]');
      expect(markdown).toContain('draft: false');
      expect(markdown).toContain('# Hello World');
      expect(markdown).toContain('This is content.');
    });

    it('should skip empty metadata fields', () => {
      const postData: PostData = {
        title: 'Minimal Post',
        content: 'Just content',
        slug: 'minimal-post',
        metadata: {
          title: 'Minimal Post',
          description: '',
          tags: [],
        },
      };

      const markdown = publishService.generateMarkdownContent(postData);

      expect(markdown).toContain('title: "Minimal Post"');
      expect(markdown).not.toContain('description:');
      expect(markdown).not.toContain('tags:');
    });
  });

  describe('validatePostData', () => {
    it('should validate complete post data', () => {
      const postData: PostData = {
        title: 'Valid Post',
        content: 'Valid content',
        slug: 'valid-post',
        metadata: {
          title: 'Valid Post',
        },
      };

      const result = publishService.validatePostData(postData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing title', () => {
      const postData: PostData = {
        title: '',
        content: 'Valid content',
        slug: 'valid-post',
        metadata: {},
      };

      const result = publishService.validatePostData(postData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('제목이 필요합니다');
    });

    it('should catch missing content', () => {
      const postData: PostData = {
        title: 'Valid Title',
        content: '',
        slug: 'valid-post',
        metadata: {
          title: 'Valid Title',
        },
      };

      const result = publishService.validatePostData(postData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('내용이 필요합니다');
    });

    it('should catch invalid slug format', () => {
      const postData: PostData = {
        title: 'Valid Title',
        content: 'Valid content',
        slug: 'invalid slug!',
        metadata: {
          title: 'Valid Title',
        },
      };

      const result = publishService.validatePostData(postData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        '슬러그는 영문, 숫자, 한글, 하이픈만 사용 가능합니다'
      );
    });
  });

  describe('publishPost', () => {
    it('should publish new post successfully', async () => {
      const postData: PostData = {
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        metadata: {
          title: 'Test Post',
        },
      };

      const config: PublishConfig = {
        message: 'Test commit',
        branch: 'main',
      };

      const mockRepository = { full_name: 'user/repo' };
      const mockCommitInfo = { sha: 'abc123' };

      (mockContentService.getCurrentRepository as Mock).mockReturnValue(
        mockRepository
      );
      (mockContentService.getFileContent as Mock).mockRejectedValue(
        new Error('File not found')
      );
      (mockContentService.createFile as Mock).mockResolvedValue(mockCommitInfo);

      await publishService.publishPost(postData, config);

      expect(mockStore.setPublishing).toHaveBeenCalledWith(true);
      expect(mockStore.updatePublishStage).toHaveBeenCalledWith(
        'validating',
        '포스트 데이터 검증 중...',
        10
      );
      expect(mockContentService.createFile).toHaveBeenCalled();
    });

    it('should update existing post successfully', async () => {
      const postData: PostData = {
        title: 'Updated Post',
        content: 'Updated content',
        slug: 'updated-post',
        metadata: {
          title: 'Updated Post',
        },
      };

      const config: PublishConfig = {
        message: 'Update post',
        branch: 'main',
      };

      const mockRepository = { full_name: 'user/repo' };
      const mockExistingFile = { sha: 'existing123' };
      const mockCommitInfo = { sha: 'abc123' };

      (mockContentService.getCurrentRepository as Mock).mockReturnValue(
        mockRepository
      );
      (mockContentService.getFileContent as Mock).mockResolvedValue(
        mockExistingFile
      );
      (mockContentService.updateFile as Mock).mockResolvedValue(mockCommitInfo);

      await publishService.publishPost(postData, config);

      expect(mockContentService.updateFile).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const postData: PostData = {
        title: '', // Invalid: empty title
        content: 'Test content',
        slug: 'test-post',
        metadata: {},
      };

      const config: PublishConfig = {
        message: 'Test commit',
      };

      await expect(
        publishService.publishPost(postData, config)
      ).rejects.toThrow('검증 실패');

      expect(mockStore.updatePublishStage).toHaveBeenCalledWith(
        'failed',
        '게시 실패',
        0,
        expect.stringContaining('제목이 필요합니다')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('generateSlugFromTitle', () => {
    it('should generate slug from English title', () => {
      const slug = PublishService.generateSlugFromTitle('My Awesome Blog Post');
      expect(slug).toBe('my-awesome-blog-post');
    });

    it('should generate slug from Korean title', () => {
      const slug = PublishService.generateSlugFromTitle('안녕하세요 블로그');
      expect(slug).toBe('안녕하세요-블로그');
    });

    it('should handle special characters', () => {
      const slug = PublishService.generateSlugFromTitle('Hello, World! & More');
      expect(slug).toBe('hello-world-more');
    });

    it('should handle empty title', () => {
      const slug = PublishService.generateSlugFromTitle('');
      expect(slug).toBe('');
    });
  });
});
