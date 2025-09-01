import { GitHubContentService } from './github-content';
import {
  UploadedImage,
  ImageUploadProgress,
  ImageUploadError,
  ImageUploadOptions,
  ImageUploadResult,
  SupportedImageFormat,
} from '@/types/image-upload';

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS: SupportedImageFormat[] = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
];
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export class ImageUploadService {
  private githubService: GitHubContentService;
  private options: ImageUploadOptions;

  constructor(githubService: GitHubContentService, options: ImageUploadOptions = {}) {
    this.githubService = githubService;
    this.options = {
      maxSize: DEFAULT_MAX_SIZE,
      supportedFormats: SUPPORTED_FORMATS,
      generateUniqueFilename: true,
      ...options,
    };
  }

  /**
   * 이미지 파일 유효성 검증
   */
  validateImageFile(file: File): ImageUploadError | null {
    // 파일 크기 검증
    if (file.size > (this.options.maxSize || DEFAULT_MAX_SIZE)) {
      return {
        type: 'size',
        message: `파일 크기가 너무 큽니다. 최대 ${Math.round((this.options.maxSize || DEFAULT_MAX_SIZE) / 1024 / 1024)}MB까지 가능합니다.`,
        details: `현재 파일 크기: ${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`,
      };
    }

    // MIME 타입 검증
    const supportedFormats = this.options.supportedFormats || SUPPORTED_FORMATS;
    if (!supportedFormats.includes(file.type as SupportedImageFormat)) {
      return {
        type: 'format',
        message: '지원하지 않는 이미지 형식입니다.',
        details: `지원 형식: ${supportedFormats.join(', ')}`,
      };
    }

    return null;
  }

  /**
   * 파일명 sanitization 및 고유 파일명 생성
   */
  sanitizeFilename(originalName: string): string {
    // 특수문자 제거 및 공백을 하이픈으로 변경
    let sanitized = originalName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 고유 파일명 생성 (타임스탬프 추가)
    if (this.options.generateUniqueFilename) {
      const timestamp = Date.now();
      const lastDotIndex = sanitized.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        const name = sanitized.substring(0, lastDotIndex);
        const extension = sanitized.substring(lastDotIndex);
        sanitized = `${name}-${timestamp}${extension}`;
      } else {
        sanitized = `${sanitized}-${timestamp}`;
      }
    }

    return sanitized;
  }

  /**
   * 파일을 Base64로 인코딩
   */
  private async encodeFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          // "data:image/jpeg;base64," 부분을 제거하고 순수 Base64만 추출
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('파일을 읽을 수 없습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 중 오류가 발생했습니다.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * GitHub raw URL 생성
   */
  private generateRawUrl(filename: string): string {
    const repository = this.githubService.getCurrentRepository();
    if (!repository) {
      throw new Error('GitHub 저장소 정보가 없습니다.');
    }
    return `https://raw.githubusercontent.com/${repository.full_name}/main/public/images/${filename}`;
  }

  /**
   * 재시도 로직이 포함된 비동기 작업 실행
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = MAX_RETRY_ATTEMPTS,
    delay: number = RETRY_DELAY_MS
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
        
        // Rate limit 에러인지 확인
        if (this.isRateLimitError(lastError)) {
          const waitTime = this.extractRetryAfter(lastError) || delay * attempt;
          if (attempt < maxAttempts) {
            await this.sleep(waitTime);
            continue;
          }
        }
        
        // 마지막 시도가 아니라면 대기 후 재시도
        if (attempt < maxAttempts) {
          await this.sleep(delay * attempt);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Rate limit 에러 확인
   */
  private isRateLimitError(error: Error): boolean {
    return error.message.includes('rate limit') || 
           error.message.includes('403') ||
           error.message.includes('API rate limit exceeded');
  }

  /**
   * Retry-After 헤더 값 추출
   */
  private extractRetryAfter(error: Error): number | null {
    // GitHub API는 일반적으로 3600초(1시간) 후 재시도를 권장
    if (this.isRateLimitError(error)) {
      return 60000; // 1분 대기
    }
    return null;
  }

  /**
   * 지정된 시간만큼 대기
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 이미지 업로드 (파일 객체 버전)
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: ImageUploadProgress) => void
  ): Promise<ImageUploadResult> {
    const uploadId = crypto.randomUUID();

    try {
      // 1. 파일 유효성 검증
      const validationError = this.validateImageFile(file);
      if (validationError) {
        return { success: false, error: validationError };
      }

      onProgress?.({
        id: uploadId,
        filename: file.name,
        progress: 10,
        status: 'preparing',
      });

      // 2. 파일명 생성
      const sanitizedFilename = this.sanitizeFilename(file.name);
      const githubPath = `public/images/${sanitizedFilename}`;

      onProgress?.({
        id: uploadId,
        filename: sanitizedFilename,
        progress: 30,
        status: 'uploading',
      });

      // 3. Base64 인코딩
      const base64Content = await this.encodeFileToBase64(file);

      onProgress?.({
        id: uploadId,
        filename: sanitizedFilename,
        progress: 60,
        status: 'processing',
      });

      // 4. GitHub API로 업로드 (재시도 로직 적용)
      const commitResult = await this.executeWithRetry(async () => {
        return await this.githubService.createFile(
          githubPath,
          base64Content,
          `feat: upload image ${sanitizedFilename}`,
          true // isBase64
        );
      });

      onProgress?.({
        id: uploadId,
        filename: sanitizedFilename,
        progress: 100,
        status: 'completed',
      });

      // 5. UploadedImage 객체 생성
      const uploadedImage: UploadedImage = {
        id: uploadId,
        filename: sanitizedFilename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        githubPath,
        rawUrl: this.generateRawUrl(sanitizedFilename),
        uploadedAt: new Date(),
        sha: commitResult.sha,
      };

      return { success: true, image: uploadedImage };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      let errorType: ImageUploadError['type'] = 'upload';

      // 에러 타입 분류
      if (this.isRateLimitError(error as Error)) {
        errorType = 'rate_limit';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'network';
      }

      onProgress?.({
        id: uploadId,
        filename: file.name,
        progress: 0,
        status: 'failed',
        error: errorMessage,
      });

      return {
        success: false,
        error: {
          type: errorType,
          message: this.getErrorMessage(errorType),
          details: errorMessage,
        },
      };
    }
  }

  /**
   * 에러 타입에 따른 사용자 친화적 메시지 반환
   */
  private getErrorMessage(errorType: ImageUploadError['type']): string {
    switch (errorType) {
      case 'size':
        return '파일 크기가 너무 큽니다.';
      case 'format':
        return '지원하지 않는 파일 형식입니다.';
      case 'network':
        return '네트워크 오류로 업로드에 실패했습니다. 인터넷 연결을 확인해주세요.';
      case 'rate_limit':
        return 'GitHub API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      case 'upload':
        return '이미지 업로드에 실패했습니다.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  }

  /**
   * 업로드된 이미지 목록 조회
   */
  async getUploadedImages(): Promise<UploadedImage[]> {
    try {
      const images = await this.githubService.getDirectoryContents('public/images');
      
      return images
        .filter(item => item.type === 'file')
        .map(item => ({
          id: item.sha,
          filename: item.name,
          originalName: item.name,
          size: item.size || 0,
          mimeType: this.getMimeTypeFromFilename(item.name),
          githubPath: item.path,
          rawUrl: this.generateRawUrl(item.name),
          uploadedAt: new Date(), // GitHub API에서는 생성일을 제공하지 않으므로 현재 시간 사용
          sha: item.sha,
        }));
    } catch (error) {
      console.error('이미지 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 파일명으로부터 MIME 타입 추정
   */
  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    
    // MIME 타입 매핑을 객체로 관리하여 유지보수성 향상
    const mimeTypeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    
    return mimeTypeMap[extension || ''] || 'image/jpeg'; // 기본값
  }
}