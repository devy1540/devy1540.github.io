import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { ReadOnlyBanner } from './ReadOnlyBanner';

export interface PermissionGuardProps {
  children: ReactNode;
  owner: string;
  repo: string;
  fallback?: ReactNode;
  showReadOnlyBanner?: boolean;
  requireAuth?: boolean;
}

export const PermissionGuard = ({
  children,
  owner,
  repo,
  fallback,
  showReadOnlyBanner = true,
  requireAuth = true,
}: PermissionGuardProps) => {
  const { isAuthenticated } = useGitHubAuthStore();
  const { hasWriteAccess, isCheckingPermission } = usePermissions({
    owner,
    repo,
    autoCheck: true,
  });

  // 인증이 필요하지만 인증되지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  // 권한 확인 중인 경우 로딩 상태 표시
  if (isAuthenticated && isCheckingPermission) {
    return fallback || null;
  }

  // 인증되었지만 write 권한이 없는 경우
  if (isAuthenticated && !hasWriteAccess) {
    return (
      <>
        {showReadOnlyBanner && <ReadOnlyBanner owner={owner} repo={repo} />}
        {fallback || null}
      </>
    );
  }

  // write 권한이 있는 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};
