import { FC, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/useEditorStore';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { usePublishStore } from '@/stores/usePublishStore';
import { useToastStore } from '@/stores/useToastStore';
import { Upload, GitCommit } from 'lucide-react';

interface PublishButtonProps {
  onPublish: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const PublishButton: FC<PublishButtonProps> = ({
  onPublish,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const { content, metadata } = useEditorStore();
  const { isAuthenticated } = useGitHubAuthStore();
  const { isPublishing } = usePublishStore();
  const { error: showError } = useToastStore();

  const canPublish = useCallback(() => {
    if (!isAuthenticated) return false;
    if (isPublishing) return false;
    if (!metadata.title?.trim()) return false;
    if (!content?.trim()) return false;
    return true;
  }, [isAuthenticated, isPublishing, metadata.title, content]);

  const handleClick = useCallback(() => {
    if (!canPublish()) {
      if (!isAuthenticated) {
        showError('GitHub 인증이 필요합니다');
        return;
      }

      if (!metadata.title?.trim()) {
        showError('제목을 입력해주세요');
        return;
      }

      if (!content?.trim()) {
        showError('내용을 입력해주세요');
        return;
      }

      return;
    }

    onPublish();
  }, [
    canPublish,
    onPublish,
    isAuthenticated,
    metadata.title,
    content,
    showError,
  ]);

  const getButtonText = () => {
    if (isPublishing) return '게시 중...';
    if (!isAuthenticated) return 'GitHub 로그인 필요';
    if (!metadata.title?.trim() || !content?.trim()) return '게시할 수 없음';
    return '게시';
  };

  const getIcon = () => {
    if (isPublishing) return <GitCommit className="h-4 w-4 animate-spin" />;
    return <Upload className="h-4 w-4" />;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!canPublish()}
      className={`gap-2 ${className}`}
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  );
};
