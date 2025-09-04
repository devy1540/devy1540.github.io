import CryptoJS from 'crypto-js';
import type {
  GitHubOAuthConfig,
  GitHubAuthError,
  GitHubTokenValidationResult,
  GitHubTokenAuthResult,
  DeviceFlowState,
  DeviceFlowInitResponse,
  DeviceFlowTokenResponse,
  DeviceFlowError,
} from '@/types/github';

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
const DEVICE_FLOW_KEY = 'github_device_flow';

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
  async validatePersonalAccessToken(
    token: string
  ): Promise<GitHubTokenValidationResult> {
    try {
      // 토큰으로 사용자 정보 가져오기 및 스코프 확인
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

      // 토큰의 스코프 확인
      const scopes = response.headers.get('X-OAuth-Scopes')?.split(', ') || [];

      // 필요한 스코프 확인
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
   * Personal Access Token으로 인증 설정
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

      // 토큰 암호화 저장
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
   * Device Flow 인증 시작
   */
  async startDeviceFlow(): Promise<DeviceFlowState> {
    try {
      // 개발환경에서는 Vite proxy, 프로덕션에서는 Vercel Functions 사용
      const apiUrl = import.meta.env.DEV
        ? '/api/github/login/device/code'
        : `${this.siteUrl}/api/github/login/device/code`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          scope: 'repo user',
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Device flow initialization failed: ${response.status}`
        );
      }

      const data: DeviceFlowInitResponse = await response.json();
      console.log('GitHub Device Flow response:', data);

      const deviceFlowState: DeviceFlowState = {
        isActive: true,
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        verificationUriComplete: data.verification_uri_complete,
        expiresIn: data.expires_in,
        interval: data.interval,
        startedAt: new Date(),
      };

      console.log('Created device flow state:', deviceFlowState);

      this.saveDeviceFlowState(deviceFlowState);
      return deviceFlowState;
    } catch (error) {
      console.error('Device flow start failed:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Device Flow 시작에 실패했습니다.'
      );
    }
  }

  /**
   * Device Flow 토큰 폴링
   */
  async pollForToken(): Promise<string> {
    const deviceFlowState = this.getDeviceFlowState();

    if (!deviceFlowState) {
      throw new Error('Device Flow가 시작되지 않았습니다.');
    }

    // 만료 시간 확인
    const now = new Date();
    const expiresAt = new Date(
      deviceFlowState.startedAt.getTime() + deviceFlowState.expiresIn * 1000
    );

    if (now > expiresAt) {
      this.clearDeviceFlowState();
      throw new Error('Device Flow가 만료되었습니다. 다시 시작해주세요.');
    }

    try {
      // 개발환경에서는 Vite proxy, 프로덕션에서는 Vercel Functions 사용
      const apiUrl = import.meta.env.DEV
        ? '/api/github/login/oauth/access_token'
        : `${this.siteUrl}/api/github/login/oauth/access_token`;

      console.log('🌐 Making token polling request to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          device_code: deviceFlowState.deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('📄 Token polling response:', data);

      if (data.error) {
        const error = data as DeviceFlowError;
        console.log('Device Flow error:', error.error);

        if (error.error === 'authorization_pending') {
          throw new Error('PENDING');
        } else if (error.error === 'slow_down') {
          throw new Error('SLOW_DOWN');
        } else if (error.error === 'expired_token') {
          this.clearDeviceFlowState();
          throw new Error('Device Flow가 만료되었습니다. 다시 시작해주세요.');
        } else if (error.error === 'access_denied') {
          this.clearDeviceFlowState();
          throw new Error('인증이 거부되었습니다.');
        } else {
          this.clearDeviceFlowState();
          throw new Error(error.error_description || '인증에 실패했습니다.');
        }
      }

      const tokenResponse = data as DeviceFlowTokenResponse;
      console.log('Token received successfully!', tokenResponse);
      this.clearDeviceFlowState();

      return tokenResponse.access_token;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'PENDING' || error.message === 'SLOW_DOWN')
      ) {
        throw error;
      }

      console.error('Token polling failed:', error);
      throw new Error(
        error instanceof Error ? error.message : '토큰 획득에 실패했습니다.'
      );
    }
  }

  /**
   * 저장된 토큰 가져오기
   */
  getStoredToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!encryptedToken) return null;

      const decrypted = CryptoJS.AES.decrypt(
        encryptedToken,
        ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);
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
   * Device Flow 상태 저장
   */
  private saveDeviceFlowState(state: DeviceFlowState): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(state),
        ENCRYPTION_KEY
      ).toString();
      sessionStorage.setItem(DEVICE_FLOW_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save device flow state:', error);
      throw new Error('Device Flow 상태 저장에 실패했습니다.');
    }
  }

  /**
   * Device Flow 상태 가져오기
   */
  getDeviceFlowState(): DeviceFlowState | null {
    try {
      const encryptedState = sessionStorage.getItem(DEVICE_FLOW_KEY);
      if (!encryptedState) return null;

      const decrypted = CryptoJS.AES.decrypt(
        encryptedState,
        ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);
      if (!decrypted) return null;

      const parsed = JSON.parse(decrypted);

      // Date 객체 복원
      return {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
      };
    } catch (error) {
      console.error('Failed to get device flow state:', error);
      this.clearDeviceFlowState();
      return null;
    }
  }

  /**
   * Device Flow 상태 삭제
   */
  clearDeviceFlowState(): void {
    sessionStorage.removeItem(DEVICE_FLOW_KEY);
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
