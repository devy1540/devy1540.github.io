import CryptoJS from 'crypto-js';
import type { GitHubOAuthConfig, GitHubAuthError, GitHubTokenValidationResult, GitHubTokenAuthResult } from '@/types/github';

// Generate a unique encryption key based on domain and storage
// This provides basic obfuscation but is not cryptographically secure
// For production, consider using Web Crypto API or server-side encryption
const ENCRYPTION_KEY = (() => {
  const domain = window.location.hostname;
  // Create a pseudo-unique key based on browser/domain context
  let key = 'github-auth-';
  for (let i = 0; i < domain.length; i++) {
    key += domain.charCodeAt(i).toString(16);
  }
  return key.substring(0, 32); // Limit key length
})();
const TOKEN_STORAGE_KEY = 'github_access_token';
const STATE_STORAGE_KEY = 'github_oauth_state';

export class GitHubAuthService {
  private clientId: string;
  private siteUrl: string;

  constructor() {
    this.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    this.siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    if (!this.clientId) {
      throw new Error('GitHub Client ID is not configured');
    }
  }

  /**
   * OAuth URL 생성
   */
  generateAuthUrl(): string {
    const state = this.generateState();
    this.saveState(state);

    const config: GitHubOAuthConfig = {
      clientId: this.clientId,
      redirectUri: `${this.siteUrl}/auth/github/callback`,
      scope: 'repo user',
      state,
    };

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: config.state,
      response_type: 'code',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Personal Access Token 유효성 및 권한 검증
   * 토큰이 필요한 스코프(repo, user)를 가지고 있는지 확인합니다.
   */
  async validatePersonalAccessToken(token: string): Promise<GitHubTokenValidationResult> {
    try {
      // 토큰으로 사용자 정보 가져오기 및 스코프 확인
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { isValid: false, error: '유효하지 않은 토큰입니다.' };
        }
        return { isValid: false, error: `GitHub API 오류: ${response.status}` };
      }

      const user = await response.json();
      
      // 토큰의 스코프 확인
      const scopes = response.headers.get('X-OAuth-Scopes')?.split(', ') || [];
      
      // 필요한 스코프 확인
      const requiredScopes = ['repo', 'user'];
      const hasRequiredScopes = requiredScopes.every(scope => 
        scopes.some(tokenScope => tokenScope.includes(scope))
      );

      if (!hasRequiredScopes) {
        return {
          isValid: false,
          scopes,
          error: `토큰에 필요한 권한이 없습니다. 필요한 권한: ${requiredScopes.join(', ')}`
        };
      }

      return {
        isValid: true,
        scopes,
        user
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { 
        isValid: false, 
        error: '토큰 검증 중 오류가 발생했습니다.' 
      };
    }
  }

  /**
   * Personal Access Token으로 인증 설정
   */
  async authenticateWithToken(token: string): Promise<GitHubTokenAuthResult> {
    try {
      const validation = await this.validatePersonalAccessToken(token);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || '토큰 검증에 실패했습니다.'
        };
      }

      // 토큰 암호화 저장
      this.saveToken(token);
      
      return {
        success: true,
        user: validation.user
      };
    } catch (error) {
      console.error('Token authentication failed:', error);
      return {
        success: false,
        error: '인증 처리 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * DEPRECATED: 웹 플로우는 클라이언트 사이드에서 보안상 사용할 수 없습니다.
   * Device Flow를 사용하거나 서버 사이드 구현이 필요합니다.
   */
  async exchangeCodeForToken(code: string, state: string): Promise<string> {
    // State 검증
    if (!this.verifyState(state)) {
      throw new Error('Invalid OAuth state parameter');
    }

    // CRITICAL SECURITY NOTE: 이 메서드는 보안상 작동하지 않습니다.
    // GitHub OAuth Web Flow는 client_secret이 필요하며, 이는 클라이언트에 노출될 수 없습니다.
    // 대신 Device Flow를 사용하거나 서버 사이드 프록시가 필요합니다.
    
    throw new Error(
      'Web-based OAuth flow requires server-side implementation. ' +
      'Please use Device Flow (startDeviceFlow/pollForToken) for client-side authentication.'
    );
  }

  /**
   * 저장된 토큰 가져오기
   */
  getStoredToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!encryptedToken) return null;

      const decrypted = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (error) {
      console.error('Failed to decrypt token:', error);
      return null;
    }
  }

  /**
   * 토큰 저장 (암호화)
   */
  saveToken(token: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
      localStorage.setItem(TOKEN_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to encrypt and save token:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  /**
   * 토큰 삭제
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
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
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * OAuth state 저장
   */
  private saveState(state: string): void {
    sessionStorage.setItem(STATE_STORAGE_KEY, state);
  }

  /**
   * OAuth state 검증
   */
  private verifyState(state: string): boolean {
    const savedState = sessionStorage.getItem(STATE_STORAGE_KEY);
    return savedState === state;
  }

  /**
   * OAuth state 삭제
   */
  private clearState(): void {
    sessionStorage.removeItem(STATE_STORAGE_KEY);
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