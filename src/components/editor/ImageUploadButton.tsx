import { useRef, useMemo } from 'react';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUploadStore } from '@/stores/useImageUploadStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageUploadService } from '@/services/image-upload-service';
import { GitHubContentService } from '@/services/github-content';
import { useToastStore } from '@/stores/useToastStore';
import { ImageUploadProgress } from '@/types/image-upload';

interface ImageUploadButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ImageUploadButton = ({ 
  className, 
  variant = 'outline', 
  size = 'sm' 
}: ImageUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    try {
      setUploading(true);
      setImageUploading(true);

      // 업로드 진행 상태 콜백
      const onProgress = (progress: ImageUploadProgress) => {
        setUploadProgress(progress.id, progress);
      };

      // 이미지 업로드 실행
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
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            업로드 중...
          </>
        ) : (
          <>
            <Image className="w-4 h-4 mr-2" />
            이미지 업로드
          </>
        )}
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        onChange={handleFileSelect}
      />
    </>
  );
};