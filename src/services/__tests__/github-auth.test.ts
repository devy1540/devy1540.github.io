import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubAuthService } from '../github-auth';

// Mock crypto-js
vi.mock('crypto-js', () => ({
  default: {
    AES: {
      encrypt: vi.fn((data: string) => ({ toString: () => `encrypted_${data}` })),
      decrypt: vi.fn((encrypted: string) => ({ 
        toString: () => encrypted.startsWith('encrypted_') ? encrypted.replace('encrypted_', '') : ''
      }))
    },
    enc: {
      Utf8: {}
    }
  }
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
});

describe('GitHubAuthService', () => {
  let authService: GitHubAuthService;
  let localStorageMock: Record<string, string>;
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock import.meta.env for each test
    vi.stubEnv('VITE_GITHUB_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_SITE_URL', 'http://localhost:3000');

    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        })
      },
      writable: true
    });

    // Mock sessionStorage
    sessionStorageMock = {};
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete sessionStorageMock[key];
        })
      },
      writable: true
    });

    authService = new GitHubAuthService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateAuthUrl', () => {
    it('should generate valid OAuth URL', () => {
      const authUrl = authService.generateAuthUrl();
      
      expect(authUrl).toContain('https://github.com/login/oauth/authorize');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgithub%2Fcallback');
      expect(authUrl).toContain('scope=repo+user');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state=');
    });

    it('should save state to session storage', () => {
      authService.generateAuthUrl();
      
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'github_oauth_state',
        expect.any(String)
      );
    });
  });

  describe('exchangeCodeForToken (DEPRECATED)', () => {
    it('should throw error indicating web flow is not supported', async () => {
      // Setup
      sessionStorageMock['github_oauth_state'] = 'test-state';

      await expect(
        authService.exchangeCodeForToken('test-code', 'test-state')
      ).rejects.toThrow('Web-based OAuth flow requires server-side implementation');
    });

    it('should throw error for invalid state', async () => {
      sessionStorageMock['github_oauth_state'] = 'valid-state';

      await expect(
        authService.exchangeCodeForToken('test-code', 'invalid-state')
      ).rejects.toThrow('Invalid OAuth state parameter');
    });

    it('should handle invalid state for web flow', async () => {
      sessionStorageMock['github_oauth_state'] = 'test-state';

      await expect(
        authService.exchangeCodeForToken('test-code', 'test-state')
      ).rejects.toThrow('Web-based OAuth flow requires server-side implementation');
    });
  });

  describe('token management', () => {
    it('should save and retrieve token correctly', () => {
      const testToken = 'test-access-token';
      
      authService.saveToken(testToken);
      const retrievedToken = authService.getStoredToken();
      
      expect(retrievedToken).toBe(testToken);
    });

    it('should clear token correctly', () => {
      authService.saveToken('test-token');
      authService.clearToken();
      
      const retrievedToken = authService.getStoredToken();
      expect(retrievedToken).toBeNull();
    });

    it('should return null for invalid encrypted token', () => {
      // Mock console.error to suppress expected error logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Set invalid encrypted token
      localStorageMock['github_access_token'] = 'invalid-encrypted-data';
      
      // Since CryptoJS.AES.decrypt will throw an error or return invalid data
      const token = authService.getStoredToken();
      expect(token).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser' })
      });

      const isValid = await authService.validateToken('valid-token');
      
      expect(isValid).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          'Authorization': 'Bearer valid-token',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
    });

    it('should return false for invalid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const isValid = await authService.validateToken('invalid-token');
      expect(isValid).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isValid = await authService.validateToken('test-token');
      expect(isValid).toBe(false);
    });
  });

  describe('Personal Access Token Authentication', () => {
    it('should validate valid token with required scopes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser', id: 123 }),
        headers: {
          get: (name: string) => {
            if (name === 'X-OAuth-Scopes') return 'repo, user, read:org';
            return null;
          }
        }
      });

      const result = await authService.validatePersonalAccessToken('valid-token');

      expect(result.isValid).toBe(true);
      expect(result.scopes).toEqual(['repo', 'user', 'read:org']);
      expect(result.user).toEqual({ login: 'testuser', id: 123 });
    });

    it('should reject token with insufficient scopes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser', id: 123 }),
        headers: {
          get: (name: string) => {
            if (name === 'X-OAuth-Scopes') return 'read:user';
            return null;
          }
        }
      });

      const result = await authService.validatePersonalAccessToken('limited-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('토큰에 필요한 권한이 없습니다');
    });

    it('should handle invalid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await authService.validatePersonalAccessToken('invalid-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('유효하지 않은 토큰입니다.');
    });

    it('should authenticate with valid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser', id: 123 }),
        headers: {
          get: (name: string) => {
            if (name === 'X-OAuth-Scopes') return 'repo, user';
            return null;
          }
        }
      });

      const result = await authService.authenticateWithToken('valid-token');

      expect(result.success).toBe(true);
      expect(result.user).toEqual({ login: 'testuser', id: 123 });
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'github_access_token',
        expect.stringContaining('encrypted_')
      );
    });

    it('should handle authentication failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await authService.authenticateWithToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('유효하지 않은 토큰입니다.');
    });
  });

  describe('error handling', () => {
    it('should parse Error objects correctly', () => {
      const error = new Error('Test error message');
      const parsedError = authService.parseError(error);
      
      expect(parsedError).toEqual({
        error: 'authentication_failed',
        error_description: 'Test error message'
      });
    });

    it('should handle unknown errors', () => {
      const parsedError = authService.parseError('unknown error');
      
      expect(parsedError).toEqual({
        error: 'unknown_error',
        error_description: 'An unknown error occurred during authentication'
      });
    });
  });
});