/**
 * 이미지 업로드 관련 타입 정의
 */

export interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  githubPath: string;
  rawUrl: string;
  uploadedAt: Date;
  sha: string; // GitHub file hash for updates
}

export interface ImageUploadProgress {
  id: string;
  filename: string;
  progress: number; // 0-100
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export type SupportedImageFormat = 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/gif' | 'image/webp';

export interface ImageUploadError {
  type: 'size' | 'format' | 'network' | 'rate_limit' | 'upload' | 'unknown';
  message: string;
  details?: string;
}

export interface ImageUploadOptions {
  maxSize?: number; // bytes
  supportedFormats?: SupportedImageFormat[];
  generateUniqueFilename?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  image?: UploadedImage;
  error?: ImageUploadError;
}

export interface ImageGalleryItem extends UploadedImage {
  thumbnailUrl?: string;
  selected?: boolean;
}