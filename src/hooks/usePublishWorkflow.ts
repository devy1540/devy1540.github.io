import { useCallback } from 'react';
import { usePublishStore } from '@/stores/usePublishStore';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import { useToastStore } from '@/stores/useToastStore';
import { PublishService } from '@/services/publish-service';
import { GitHubContentService } from '@/services/github-content';
import { GitHubApiService } from '@/services/github-api';
import type { PostData, PublishConfig } from '@/types/publish';

export const usePublishWorkflow = () => {
  const { isPublishing, updatePublishStage, reset } = usePublishStore();
  const { token } = useGitHubAuthStore();
  const { currentRepo } = useRepositoryStore();
  const { error: showError, success: showSuccess } = useToastStore();

  const publishPost = useCallback(
    async (postData: PostData, config: PublishConfig) => {
      if (isPublishing) {
        return;
      }

      if (!token) {
        showError('GitHub 인증이 필요합니다');
        return;
      }

      if (!currentRepo) {
        showError('저장소를 선택해주세요');
        return;
      }

      try {
        // Initialize services
        const apiService = new GitHubApiService();
        apiService.initialize(token);

        const contentService = new GitHubContentService(apiService);
        contentService.setCurrentRepository(currentRepo);

        const publishService = new PublishService(contentService);

        // Start publishing process
        await publishService.publishPost(postData, config);

        // Show success message
        showSuccess('포스트가 성공적으로 게시되었습니다!');
      } catch (error) {
        console.error('Publishing failed:', error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다';
        showError(`게시 실패: ${errorMessage}`);

        updatePublishStage('failed', '게시 실패', 0, errorMessage);
      }
    },
    [
      isPublishing,
      token,
      currentRepo,
      showError,
      showSuccess,
      updatePublishStage,
    ]
  );

  const retryPublish = useCallback(() => {
    reset();
  }, [reset]);

  return {
    publishPost,
    retryPublish,
    isPublishing,
    reset,
  };
};
