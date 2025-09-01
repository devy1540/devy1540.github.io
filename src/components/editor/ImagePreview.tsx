import { useState } from 'react';
import { ExternalLink, Copy, Download, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';
import type { ImageGalleryItem } from '@/types/image-upload';

interface ImagePreviewProps {
  image: ImageGalleryItem;
  onSelect?: (image: ImageGalleryItem) => void;
  onCopyUrl?: (image: ImageGalleryItem) => void;
  onCopyMarkdown?: (image: ImageGalleryItem) => void;
  className?: string;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ImagePreview = ({
  image,
  onSelect,
  onCopyUrl,
  onCopyMarkdown,
  className,
  showActions = true,
  size = 'md',
}: ImagePreviewProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { success, error } = useToastStore();

  const sizeClasses = {
    sm: 'aspect-square',
    md: 'aspect-[4/3]',
    lg: 'aspect-[16/9]',
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(image.rawUrl);
      success('URL 복사 완료', '이미지 URL이 클립보드에 복사되었습니다.');
      onCopyUrl?.(image);
    } catch {
      error('URL 복사 실패', 'URL 복사 중 오류가 발생했습니다.');
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdown = `![${image.originalName}](${image.rawUrl})`;
      await navigator.clipboard.writeText(markdown);
      success('마크다운 복사 완료', '이미지 마크다운이 클립보드에 복사되었습니다.');
      onCopyMarkdown?.(image);
    } catch {
      error('마크다운 복사 실패', '마크다운 복사 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.rawUrl;
    link.download = image.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoaded(true);
    setHasError(true);
  };

  return (
    <TooltipProvider>
      <Card className={cn('group overflow-hidden transition-all duration-200', className)}>
        {/* 이미지 영역 */}
        <div className={cn('relative overflow-hidden', sizeClasses[size])}>
          {!isLoaded && !hasError && (
            <Skeleton className="absolute inset-0" />
          )}
          
          {hasError ? (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">이미지를 로드할 수 없습니다</p>
              </div>
            </div>
          ) : (
            <img
              src={image.rawUrl}
              alt={image.originalName}
              className={cn(
                'object-cover w-full h-full transition-all duration-300',
                'group-hover:scale-105 cursor-pointer',
                !isLoaded && 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              onClick={() => onSelect?.(image)}
            />
          )}

          {/* 선택 상태 표시 */}
          {image.selected && (
            <div className="absolute inset-0 bg-primary/20 border-2 border-primary" />
          )}

          {/* 호버 액션 버튼들 */}
          {showActions && isLoaded && !hasError && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSelect?.(image)}
                  >
                    선택
                  </Button>
                </TooltipTrigger>
                <TooltipContent>에디터에 삽입</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyMarkdown}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>마크다운 복사</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(image.rawUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>새 탭에서 열기</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* 파일 형식 배지 */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs uppercase">
              {getFileExtension(image.filename)}
            </Badge>
          </div>
        </div>

        {/* 이미지 정보 */}
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* 파일명 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium truncate cursor-help">
                  {image.originalName}
                </p>
              </TooltipTrigger>
              <TooltipContent>{image.originalName}</TooltipContent>
            </Tooltip>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {formatFileSize(image.size)}
              </Badge>
              
              {showActions && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCopyUrl}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>URL 복사</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleDownload}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>다운로드</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* 업로드 날짜 */}
            <p className="text-xs text-muted-foreground">
              {formatDate(image.uploadedAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};