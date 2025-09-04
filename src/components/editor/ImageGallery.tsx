import { useState, useEffect, useCallback } from 'react';
import { Image, Search, Copy, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useImageUploadStore } from '@/stores/useImageUploadStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageUploadService } from '@/services/image-upload-service';
import { GitHubContentService } from '@/services/github-content';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';
import type { ImageGalleryItem } from '@/types/image-upload';

interface ImageGalleryProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const ImageGallery = ({ trigger, className }: ImageGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToastStore();

  const { images, setImages, clearSelection, isGalleryOpen, setGalleryOpen } =
    useImageUploadStore();

  const { insertImageAtCursor } = useEditorStore();

  // 이미지 목록 로드
  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const githubService = new GitHubContentService();
      const uploadService = new ImageUploadService(githubService);
      const uploadedImages = await uploadService.getUploadedImages();
      setImages(uploadedImages);
    } catch (err) {
      console.error('이미지 목록 로드 실패:', err);
      error(
        '이미지 목록 로드 실패',
        '이미지 목록을 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [setImages, error]);

  // 갤러리 열릴 때 이미지 목록 로드
  useEffect(() => {
    if (isOpen || isGalleryOpen) {
      loadImages();
    }
  }, [isOpen, isGalleryOpen, loadImages]);

  // 검색 필터링
  const filteredImages = images.filter(
    (image) =>
      image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageSelect = (image: ImageGalleryItem) => {
    const imageMarkdown = `![${image.originalName}](${image.rawUrl})`;
    insertImageAtCursor(imageMarkdown);

    success(
      '이미지 삽입 완료',
      `${image.originalName} 이미지가 에디터에 삽입되었습니다.`
    );

    setIsOpen(false);
    setGalleryOpen(false);
  };

  const handleCopyUrl = async (image: ImageGalleryItem) => {
    try {
      await navigator.clipboard.writeText(image.rawUrl);
      success('URL 복사 완료', '이미지 URL이 클립보드에 복사되었습니다.');
    } catch {
      error('URL 복사 실패', 'URL 복사 중 오류가 발생했습니다.');
    }
  };

  const handleCopyMarkdown = async (image: ImageGalleryItem) => {
    try {
      const markdown = `![${image.originalName}](${image.rawUrl})`;
      await navigator.clipboard.writeText(markdown);
      success(
        '마크다운 복사 완료',
        '이미지 마크다운이 클립보드에 복사되었습니다.'
      );
    } catch {
      error('마크다운 복사 실패', '마크다운 복사 중 오류가 발생했습니다.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Image className="w-4 h-4 mr-2" />
      이미지 갤러리
    </Button>
  );

  return (
    <Dialog
      open={isOpen || isGalleryOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        setGalleryOpen(open);
        if (!open) {
          clearSelection();
        }
      }}
    >
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent
        className={cn('max-w-4xl max-h-[80vh] overflow-hidden', className)}
      >
        <DialogHeader>
          <DialogTitle>이미지 갤러리</DialogTitle>
          <DialogDescription>
            업로드된 이미지를 보고 에디터에 삽입할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 검색 입력 */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="이미지 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={loadImages} variant="outline" size="sm">
            새로고침
          </Button>
        </div>

        {/* 이미지 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            // 로딩 스켈레톤
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            // 빈 상태
            <div className="text-center py-12">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery
                  ? '검색 결과가 없습니다'
                  : '업로드된 이미지가 없습니다'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? '다른 키워드로 검색해보세요'
                  : '이미지를 업로드해보세요'}
              </p>
            </div>
          ) : (
            // 이미지 그리드
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card
                  key={image.id}
                  className="group overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.rawUrl}
                      alt={image.originalName}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImageSelect(image)}
                      >
                        삽입
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopyMarkdown(image)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image.rawUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <p
                      className="text-sm font-medium truncate mb-1"
                      title={image.originalName}
                    >
                      {image.originalName}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(image.size)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyUrl(image)}
                        title="URL 복사"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        {!isLoading && filteredImages.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-3">
            <span>총 {filteredImages.length}개 이미지</span>
            <span>클릭하여 에디터에 삽입</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
