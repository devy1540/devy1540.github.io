import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute component for protecting routes that require authentication
 * Currently a scaffold - authentication logic will be implemented later
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  // TODO: Implement authentication check logic
  // This will be connected to GitHub OAuth in future stories
  
  // For now, this is just a scaffold that allows all access
  const isAuthenticated = true; // Placeholder - will check actual auth state
  const isAdmin = true; // Placeholder - will check admin privileges
  
  // Future implementation will check:
  // - GitHub OAuth token validity
  // - User permissions
  // - Repository access rights
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
