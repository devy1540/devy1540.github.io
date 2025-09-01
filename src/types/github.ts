export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  permissions: {
    admin: boolean;
    maintain?: boolean;
    push: boolean;
    triage?: boolean;
    pull: boolean;
  };
  updated_at: string;
  created_at: string;
}

export interface GitHubAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GitHubUser | null;
  repositories: GitHubRepository[];
  accessToken: string | null;
  error: string | null;
  lastSyncAt: Date | null;
  hasWriteAccess: boolean;
  permissionCheckAt: Date | null;
}

export interface GitHubAuthActions {
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  fetchRepositories: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  checkWritePermission: (owner: string, repo: string) => Promise<void>;
}

export interface GitHubOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface GitHubTokenValidationResult {
  isValid: boolean;
  scopes?: string[];
  user?: GitHubUser;
  error?: string;
}

export interface GitHubTokenAuthResult {
  success: boolean;
  user?: GitHubUser;
  error?: string;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubDirectoryItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GitHubFileMetadata {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  lastModified?: string;
  downloadUrl?: string;
}

export interface GitHubCommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
}

export interface GitHubRateLimit {
  limit: number;
  used: number;
  remaining: number;
  reset: number;
}

export interface GitHubApiError extends Error {
  status?: number;
  response?: {
    status: number;
    data?: {
      message?: string;
      documentation_url?: string;
    };
  };
}

export interface FileOperationOptions {
  message?: string;
  branch?: string;
  sha?: string;
}

export interface RepositoryPermission {
  permission: 'admin' | 'write' | 'read' | 'none';
  user: {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  };
}

export interface PermissionCheckResult {
  hasWriteAccess: boolean;
  permission: 'admin' | 'write' | 'read' | 'none';
  checkedAt: Date;
}
