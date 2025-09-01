import { useEffect } from 'react';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';

export interface UsePermissionsOptions {
  owner?: string;
  repo?: string;
  autoCheck?: boolean;
}

export interface UsePermissionsReturn {
  hasWriteAccess: boolean;
  isCheckingPermission: boolean;
  permissionError: string | null;
  permissionCheckAt: Date | null;
  checkPermission: (owner: string, repo: string) => Promise<void>;
  retryPermissionCheck: () => Promise<void>;
}

export const usePermissions = (
  options: UsePermissionsOptions = {}
): UsePermissionsReturn => {
  const {
    hasWriteAccess,
    permissionCheckAt,
    isLoading,
    error,
    checkWritePermission,
    isAuthenticated,
  } = useGitHubAuthStore();

  const { owner, repo, autoCheck = true } = options;

  useEffect(() => {
    if (autoCheck && owner && repo && isAuthenticated && !permissionCheckAt) {
      checkWritePermission(owner, repo);
    }
  }, [
    autoCheck,
    owner,
    repo,
    isAuthenticated,
    permissionCheckAt,
    checkWritePermission,
  ]);

  const checkPermission = async (targetOwner: string, targetRepo: string) => {
    await checkWritePermission(targetOwner, targetRepo);
  };

  const retryPermissionCheck = async () => {
    if (owner && repo) {
      await checkWritePermission(owner, repo);
    }
  };

  return {
    hasWriteAccess,
    isCheckingPermission: isLoading,
    permissionError: error,
    permissionCheckAt,
    checkPermission,
    retryPermissionCheck,
  };
};
