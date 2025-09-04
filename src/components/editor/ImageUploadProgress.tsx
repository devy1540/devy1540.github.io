import { CheckCircle2, XCircle, Upload, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ImageUploadProgress as ProgressType } from '@/types/image-upload';
import { useImageUploadStore } from '@/stores/useImageUploadStore';

interface ImageUploadProgressProps {
  uploads: Record<string, ProgressType>;
  className?: string;
}

export const ImageUploadProgress = ({
  uploads,
  className,
}: ImageUploadProgressProps) => {
  const { removeUpload } = useImageUploadStore();

  const uploadList = Object.values(uploads);

  if (uploadList.length === 0) {
    return null;
  }

  const getStatusIcon = (status: ProgressType['status']) => {
    switch (status) {
      case 'preparing':
        return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'uploading':
      case 'processing':
        return <Upload className="w-4 h-4 text-blue-500 animate-bounce" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: ProgressType['status']) => {
    switch (status) {
      case 'preparing':
        return '준비 중...';
      case 'uploading':
        return '업로드 중...';
      case 'processing':
        return '처리 중...';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: ProgressType['status']) => {
    switch (status) {
      case 'preparing':
      case 'uploading':
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {uploadList.map((upload) => (
        <Card key={upload.id} className="relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {getStatusIcon(upload.status)}
                <span className="text-sm font-medium truncate">
                  {upload.filename}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    getStatusColor(upload.status)
                  )}
                >
                  {getStatusText(upload.status)}
                </span>

                {(upload.status === 'completed' ||
                  upload.status === 'failed') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeUpload(upload.id)}
                  >
                    <XCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* 진행률 표시 */}
            {upload.status !== 'completed' && upload.status !== 'failed' && (
              <div className="space-y-1">
                <Progress value={upload.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{upload.progress}%</span>
                  {upload.status === 'uploading' && (
                    <span>GitHub에 업로드 중...</span>
                  )}
                  {upload.status === 'processing' && (
                    <span>이미지 처리 중...</span>
                  )}
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {upload.status === 'failed' && upload.error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">업로드 실패</p>
                    <p className="text-xs mt-1">{upload.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 완료 메시지 */}
            {upload.status === 'completed' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">
                    이미지가 성공적으로 업로드되었습니다
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
