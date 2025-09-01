import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireWriteAccess?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireWriteAccess = false,
  redirectTo = '/settings',
}: ProtectedRouteProps) {
  const { isAuthenticated, hasWriteAccess } = useGitHubAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireWriteAccess && !hasWriteAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
