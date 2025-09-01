import { useCallback, useEffect } from 'react';
import { usePublishStore } from '@/stores/usePublishStore';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import { GitHubApiService } from '@/services/github-api';
import { GitHubActionsService } from '@/services/github-actions';
import type { DeploymentStatus } from '@/types/publish';

export const useDeploymentStatus = () => {
  const { token } = useGitHubAuthStore();
  const { currentRepo } = useRepositoryStore();
  const { 
    deploymentStatus, 
    isTrackingDeployment,
    setDeploymentStatus,
    setTrackingDeployment,
    publishStatus 
  } = usePublishStore();

  const startTracking = useCallback(async (commitSha: string) => {
    if (!token || !currentRepo || !commitSha) {
      console.warn('Missing requirements for deployment tracking');
      return;
    }

    setTrackingDeployment(true);

    try {
      // Initialize services
      const apiService = new GitHubApiService();
      apiService.initialize(token);
      
      const actionsService = new GitHubActionsService(apiService);
      
      const [owner, repo] = currentRepo.full_name.split('/');

      // Start polling for deployment status
      const finalStatus = await actionsService.pollDeploymentStatus(
        owner,
        repo,
        commitSha,
        (status: DeploymentStatus) => {
          setDeploymentStatus(status);
        },
        300000 // 5 minutes timeout
      );

      if (finalStatus) {
        setDeploymentStatus(finalStatus);
      }

    } catch (error) {
      console.error('Deployment tracking failed:', error);
    } finally {
      setTrackingDeployment(false);
    }
  }, [token, currentRepo, setDeploymentStatus, setTrackingDeployment]);

  const stopTracking = useCallback(() => {
    setTrackingDeployment(false);
    setDeploymentStatus(null);
  }, [setTrackingDeployment, setDeploymentStatus]);

  // Auto-start tracking when publish reaches deploying stage
  useEffect(() => {
    if (
      publishStatus?.stage === 'deploying' && 
      publishStatus.commitUrl &&
      !isTrackingDeployment
    ) {
      // Extract SHA from commit URL
      const match = publishStatus.commitUrl.match(/\/commit\/([a-f0-9]+)$/);
      if (match) {
        const sha = match[1];
        startTracking(sha);
      }
    }
  }, [publishStatus, isTrackingDeployment, startTracking]);

  return {
    deploymentStatus,
    isTrackingDeployment,
    startTracking,
    stopTracking,
  };
};