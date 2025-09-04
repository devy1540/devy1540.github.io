import { generateGitHubAppJWT } from '@/utils/jwt';
import type {
  GitHubAuthError,
  GitHubTokenValidationResult,
  GitHubTokenAuthResult,
} from '@/types/github';

/**
 * GitHub App 응답 타입들
 */
interface GitHubAppInstallation {
  id: number;
  account: {
    login: string;
    id: number;
    type: string;
  };
}

interface GitHubAppTokenResponse {
  token: string;
  expires_at: string;
  permissions: Record<string, string>;
  repository_selection: string;
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
}

export class GitHubAppAuthService {
  private appId: string;
  private clientId: string;
  private privateKey: string;
  private siteUrl: string;

  constructor() {
    this.appId = import.meta.env.VITE_GITHUB_APP_ID;
    this.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    this.privateKey = import.meta.env.VITE_GITHUB_PRIVATE_KEY;
    this.siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    if (!this.appId || !this.clientId || !this.privateKey) {
      throw new Error('GitHub App credentials are not configured');
    }
  }

  /**
   * GitHub App OAuth 인증 URL 생성
   */
  generateAuthUrl(): string {
    const state = this.generateState();
    this.saveState(state);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${this.siteUrl}/auth/github/callback`,
      state,
    });

    return `https://github.com/apps/personal-blog-cms/installations/new?${params.toString()}`;
  }

  /**
   * OAuth 인증 플로우 시작
   */
  startOAuthFlow(): void {
    const authUrl = this.generateAuthUrl();
    window.location.href = authUrl;
  }

  /**
   * OAuth 콜백 처리 및 토큰 교환
   */
  async handleOAuthCallback(
    code: string,
    state: string
  ): Promise<GitHubTokenAuthResult> {
    try {
      // 1. State 검증
      if (!this.verifyState(state)) {
        return {
          success: false,
          error: 'Invalid OAuth state parameter',
        };
      }

      this.clearState();

      // 2. GitHub App installation token 생성 (code는 현재 사용하지 않음)
      const accessToken = await this.exchangeCodeForToken();

      // 3. 사용자 정보 조회
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        return {
          success: false,
          error: 'Failed to fetch user information',
        };
      }

      const user: GitHubUser = await userResponse.json();

      // 4. 토큰 저장
      this.saveToken(accessToken);

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('GitHub App OAuth callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Authorization code를 access token으로 교환
   * 현재는 GitHub App JWT를 사용하여 installation token을 직접 생성
   */
  private async exchangeCodeForToken(): Promise<string> {
    try {
      // 1. GitHub App JWT 생성
      const jwt = await generateGitHubAppJWT(this.appId, this.privateKey);

      // 2. 설치된 앱의 installation ID 조회
      const installationsResponse = await fetch(
        'https://api.github.com/app/installations',
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!installationsResponse.ok) {
        throw new Error('Failed to fetch app installations');
      }

      const installations: GitHubAppInstallation[] =
        await installationsResponse.json();

      if (installations.length === 0) {
        throw new Error('GitHub App is not installed');
      }

      // 첫 번째 설치를 사용 (개인 계정용)
      const installation = installations[0];

      // 3. Installation access token 생성
      const tokenResponse = await fetch(
        `https://api.github.com/app/installations/${installation.id}/access_tokens`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!tokenResponse.ok) {
        throw new Error('Failed to create installation access token');
      }

      const tokenData: GitHubAppTokenResponse = await tokenResponse.json();
      return tokenData.token;
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * Personal Access Token으로 인증 (백업 방법)
   */
  async authenticateWithToken(token: string): Promise<GitHubTokenAuthResult> {
    try {
      const validation = await this.validatePersonalAccessToken(token);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || '토큰 검증에 실패했습니다.',
        };
      }

      this.saveToken(token);

      return {
        success: true,
        user: validation.user,
      };
    } catch (error) {
      console.error('Token authentication failed:', error);
      return {
        success: false,
        error: '인증 처리 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Personal Access Token 유효성 검증
   */
  async validatePersonalAccessToken(
    token: string
  ): Promise<GitHubTokenValidationResult> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { isValid: false, error: '유효하지 않은 토큰입니다.' };
        }
        return { isValid: false, error: `GitHub API 오류: ${response.status}` };
      }

      const user = await response.json();
      const scopes = response.headers.get('X-OAuth-Scopes')?.split(', ') || [];

      const requiredScopes = ['repo', 'user'];
      const hasRequiredScopes = requiredScopes.every((scope) =>
        scopes.some((tokenScope) => tokenScope.includes(scope))
      );

      if (!hasRequiredScopes) {
        return {
          isValid: false,
          scopes,
          error: `토큰에 필요한 권한이 없습니다. 필요한 권한: ${requiredScopes.join(', ')}`,
        };
      }

      return {
        isValid: true,
        scopes,
        user,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return {
        isValid: false,
        error: '토큰 검증 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 저장된 토큰 가져오기
   */
  getStoredToken(): string | null {
    try {
      const token = localStorage.getItem('github_access_token');
      return token;
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  /**
   * 토큰 저장
   */
  private saveToken(token: string): void {
    try {
      localStorage.setItem('github_access_token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  /**
   * 토큰 삭제
   */
  clearToken(): void {
    localStorage.removeItem('github_access_token');
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * 현재 토큰이 유효한지 확인
   */
  async isTokenValid(): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;
    return await this.validateToken(token);
  }

  /**
   * OAuth state 생성
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * OAuth state 저장
   */
  private saveState(state: string): void {
    sessionStorage.setItem('github_oauth_state', state);
  }

  /**
   * OAuth state 검증
   */
  private verifyState(state: string): boolean {
    const savedState = sessionStorage.getItem('github_oauth_state');
    return savedState === state;
  }

  /**
   * OAuth state 삭제
   */
  private clearState(): void {
    sessionStorage.removeItem('github_oauth_state');
  }

  /**
   * 에러 파싱
   */
  parseError(error: unknown): GitHubAuthError {
    if (error instanceof Error) {
      return {
        error: 'authentication_failed',
        error_description: error.message,
      };
    }

    return {
      error: 'unknown_error',
      error_description: 'An unknown error occurred during authentication',
    };
  }
}
