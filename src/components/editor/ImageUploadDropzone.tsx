import { useState, useCallback, useMemo } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUploadStore } from '@/stores/useImageUploadStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageUploadService } from '@/services/image-upload-service';
import { GitHubContentService } from '@/services/github-content';
import { useToastStore } from '@/stores/useToastStore';
import { ImageUploadProgress } from '@/types/image-upload';

interface ImageUploadDropzoneProps {
  className?: string;
  children?: React.ReactNode;
}

export const ImageUploadDropzone = ({ className, children }: ImageUploadDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [, setDragCounter] = useState(0);
  const { success, error } = useToastStore();

  const { 
    setUploadProgress, 
    addImage, 
    setUploading,
    isUploading 
  } = useImageUploadStore();
  
  const { insertImageAtCursor, setImageUploading } = useEditorStore();

  // 서비스 인스턴스를 메모이제이션하여 성능 최적화
  const uploadService = useMemo(() => {
    const githubService = new GitHubContentService();
    return new ImageUploadService(githubService);
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    if (isUploading) return;

    const file = files[0]; // 첫 번째 파일만 처리
    if (!file) return;

    try {
      setUploading(true);
      setImageUploading(true);

      // 업로드 진행 상태 콜백
      const onProgress = (progress: ImageUploadProgress) => {
        setUploadProgress(progress.id, progress);
      };

      // 이미지 업로드 실행 (ImageUploadService 내부에서 파일 검증 수행)
      const result = await uploadService.uploadImage(file, onProgress);

      if (result.success && result.image) {
        // 업로드된 이미지를 스토어에 추가
        addImage(result.image);

        // 마크다운 문법으로 에디터에 삽입
        const imageMarkdown = `![${result.image.originalName}](${result.image.rawUrl})\n`;
        insertImageAtCursor(imageMarkdown);

        success('이미지 업로드 완료', `${result.image.originalName} 파일이 성공적으로 업로드되었습니다.`);
      } else {
        error('이미지 업로드 실패', result.error?.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('이미지 업로드 중 오류:', err);
      error('이미지 업로드 실패', '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setImageUploading(false);
    }
  }, [isUploading, setUploadProgress, addImage, setUploading, insertImageAtCursor, setImageUploading, success, error, uploadService]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  return (
    <div
      className={cn(
        'relative min-h-[200px] border-2 border-dashed transition-all duration-200',
        isDragOver 
          ? 'border-primary bg-primary/5 border-solid' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        isUploading && 'pointer-events-none opacity-50',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {/* 드래그 오버레이 */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-primary">
              이미지를 여기에 드롭하세요
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PNG, JPG, JPEG, GIF, WebP (최대 10MB)
            </p>
          </div>
        </div>
      )}

      {/* 업로드 중 오버레이 */}
      {isUploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
            <p className="text-lg font-medium">
              이미지 업로드 중...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};