import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ImageUploadService } from '../image-upload-service';
import { GitHubContentService } from '../github-content';
// import { ImageUploadError } from '@/types/image-upload';

// Mock GitHubContentService
const mockGitHubService = {
  getCurrentRepository: vi.fn(),
  createFile: vi.fn(),
  getDirectoryContents: vi.fn(),
} as unknown as GitHubContentService;

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(() => {
    service = new ImageUploadService(mockGitHubService);
    vi.clearAllMocks();
  });

  describe('validateImageFile', () => {
    it('should accept valid image files', () => {
      const validFile = new File([''], 'test.png', { type: 'image/png' });
      Object.defineProperty(validFile, 'size', { value: 5000000 }); // 5MB

      const error = service.validateImageFile(validFile);
      expect(error).toBeNull();
    });

    it('should reject files that are too large', () => {
      const largeFile = new File([''], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 15000000 }); // 15MB

      const error = service.validateImageFile(largeFile);
      expect(error).not.toBeNull();
      expect(error?.type).toBe('size');
      expect(error?.message).toContain('파일 크기가 너무 큽니다');
    });

    it('should reject unsupported file formats', () => {
      const unsupportedFile = new File([''], 'test.txt', {
        type: 'text/plain',
      });

      const error = service.validateImageFile(unsupportedFile);
      expect(error).not.toBeNull();
      expect(error?.type).toBe('format');
      expect(error?.message).toContain('지원하지 않는 이미지 형식');
    });

    it('should accept all supported image formats', () => {
      const formats = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
      ];

      formats.forEach((format) => {
        const file = new File([''], `test.${format.split('/')[1]}`, {
          type: format,
        });
        Object.defineProperty(file, 'size', { value: 1000000 }); // 1MB

        const error = service.validateImageFile(file);
        expect(error).toBeNull();
      });
    });
  });

  describe('sanitizeFilename', () => {
    it('should convert to lowercase', () => {
      const result = service.sanitizeFilename('TEST.PNG');
      expect(result.toLowerCase()).toBe(result);
    });

    it('should replace special characters with hyphens', () => {
      const result = service.sanitizeFilename('test file!@#.png');
      expect(result).toMatch(/test-file.*\.png$/);
    });

    it('should handle Korean characters', () => {
      const result = service.sanitizeFilename('테스트이미지.png');
      expect(result).toContain('테스트이미지');
    });

    it('should add timestamp when generateUniqueFilename is true', () => {
      const service = new ImageUploadService(mockGitHubService, {
        generateUniqueFilename: true,
      });
      const result = service.sanitizeFilename('test.png');

      expect(result).toMatch(/test-\d+\.png$/);
    });

    it('should not add timestamp when generateUniqueFilename is false', () => {
      const service = new ImageUploadService(mockGitHubService, {
        generateUniqueFilename: false,
      });
      const result = service.sanitizeFilename('test.png');

      expect(result).toBe('test.png');
    });
  });

  describe('uploadImage', () => {
    beforeEach(() => {
      // Mock getCurrentRepository
      (mockGitHubService.getCurrentRepository as Mock).mockReturnValue({
        full_name: 'user/repo',
      });

      // Mock createFile
      (mockGitHubService.createFile as Mock).mockResolvedValue({
        sha: 'abc123',
      });

      // Mock crypto.randomUUID for consistent testing
      vi.stubGlobal('crypto', {
        randomUUID: () => 'test-uuid-123',
      });
    });

    it('should upload valid image successfully', async () => {
      const file = new File(['test content'], 'test.png', {
        type: 'image/png',
      });
      Object.defineProperty(file, 'size', { value: 1000000 });

      const mockProgress = vi.fn();
      const result = await service.uploadImage(file, mockProgress);

      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image?.originalName).toBe('test.png');
      expect(result.image?.mimeType).toBe('image/png');
      expect(result.image?.size).toBe(1000000);

      // Check progress callbacks
      expect(mockProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'preparing',
          progress: 10,
        })
      );

      expect(mockProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          progress: 100,
        })
      );
    });

    it('should fail validation for invalid files', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });

      const result = await service.uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('format');
    });

    it('should handle GitHub API errors', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1000000 });

      // Mock createFile to throw error
      (mockGitHubService.createFile as Mock).mockRejectedValue(
        new Error('GitHub API Error')
      );

      const result = await service.uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('upload');
      expect(result.error?.details).toContain('GitHub API Error');
    });

    it('should handle rate limit errors', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1000000 });

      // Mock createFile to throw rate limit error
      const rateLimitError = new Error('API rate limit exceeded');
      (rateLimitError as unknown as { status: number }).status = 403;

      (mockGitHubService.createFile as Mock).mockRejectedValue(rateLimitError);

      // Mock the private sleep method to avoid actual delays
      const sleepSpy = vi
        .spyOn(service as unknown as { sleep: () => Promise<void> }, 'sleep')
        .mockResolvedValue(undefined);

      const result = await service.uploadImage(file);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('rate_limit');

      sleepSpy.mockRestore();
    });
  });

  describe('getUploadedImages', () => {
    it('should return list of uploaded images', async () => {
      // Mock getDirectoryContents
      (mockGitHubService.getDirectoryContents as Mock).mockResolvedValue([
        {
          type: 'file',
          name: 'image1.png',
          path: 'public/images/image1.png',
          sha: 'sha1',
          size: 1000,
        },
        {
          type: 'file',
          name: 'image2.jpg',
          path: 'public/images/image2.jpg',
          sha: 'sha2',
          size: 2000,
        },
        {
          type: 'dir',
          name: 'subdir',
          path: 'public/images/subdir',
          sha: 'sha3',
        },
      ]);

      const result = await service.getUploadedImages();

      expect(result).toHaveLength(2); // Only files, not directories
      expect(result[0].filename).toBe('image1.png');
      expect(result[0].size).toBe(1000);
      expect(result[0].mimeType).toBe('image/png');
      expect(result[1].filename).toBe('image2.jpg');
      expect(result[1].mimeType).toBe('image/jpeg');
    });

    it('should handle empty directory', async () => {
      (mockGitHubService.getDirectoryContents as Mock).mockResolvedValue([]);

      const result = await service.getUploadedImages();

      expect(result).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      (mockGitHubService.getDirectoryContents as Mock).mockRejectedValue(
        new Error('API Error')
      );

      const result = await service.getUploadedImages();

      expect(result).toHaveLength(0);
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed uploads', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1000000 });

      let attemptCount = 0;
      (mockGitHubService.createFile as Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return Promise.resolve({ sha: 'abc123' });
      });

      const result = await service.uploadImage(file);

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Should have retried twice
    });
  });
});
