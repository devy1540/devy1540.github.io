import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubAuthService } from '../github-auth';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GitHubAuthService Device Flow', () => {
  let authService: GitHubAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    vi.stubEnv('VITE_GITHUB_CLIENT_ID', 'test-client-id');
    authService = new GitHubAuthService();
  });

  describe('startDeviceFlow', () => {
    it('should start device flow successfully', async () => {
      const mockResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-CODE',
        verification_uri: 'https://github.com/login/device',
        verification_uri_complete:
          'https://github.com/login/device?user_code=TEST-CODE',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const deviceFlowState = await authService.startDeviceFlow();

      expect(fetch).toHaveBeenCalledWith(
        'https://github.com/login/device/code',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams),
        }
      );

      expect(deviceFlowState.isActive).toBe(true);
      expect(deviceFlowState.deviceCode).toBe('test-device-code');
      expect(deviceFlowState.userCode).toBe('TEST-CODE');
      expect(deviceFlowState.verificationUri).toBe(
        'https://github.com/login/device'
      );
      expect(deviceFlowState.expiresIn).toBe(900);
      expect(deviceFlowState.interval).toBe(5);
      expect(deviceFlowState.startedAt).toBeInstanceOf(Date);
    });

    it('should handle device flow initialization errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(authService.startDeviceFlow()).rejects.toThrow(
        'Device flow initialization failed: 400'
      );
    });
  });

  describe('pollForToken', () => {
    it('should return PENDING when authorization is pending', async () => {
      // First start device flow
      const mockInitResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-CODE',
        verification_uri: 'https://github.com/login/device',
        verification_uri_complete:
          'https://github.com/login/device?user_code=TEST-CODE',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInitResponse),
      });

      await authService.startDeviceFlow();

      // Mock pending response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            error: 'authorization_pending',
            error_description:
              'The authorization request is still pending as the user has not yet entered the user code.',
          }),
      });

      await expect(authService.pollForToken()).rejects.toThrow('PENDING');
    });

    it('should return token when authorization succeeds', async () => {
      // First start device flow
      const mockInitResponse = {
        device_code: 'test-device-code',
        user_code: 'TEST-CODE',
        verification_uri: 'https://github.com/login/device',
        verification_uri_complete:
          'https://github.com/login/device?user_code=TEST-CODE',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInitResponse),
      });

      await authService.startDeviceFlow();

      // Mock successful token response
      const mockTokenResponse = {
        access_token: 'gho_test_token',
        token_type: 'bearer',
        scope: 'repo user',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const token = await authService.pollForToken();

      expect(token).toBe('gho_test_token');
      expect(authService.getDeviceFlowState()).toBe(null); // Should be cleared after success
    });
  });

  describe('getDeviceFlowState', () => {
    it('should return null when no device flow state exists', () => {
      const state = authService.getDeviceFlowState();
      expect(state).toBe(null);
    });
  });

  describe('clearDeviceFlowState', () => {
    it('should clear device flow state', () => {
      authService.clearDeviceFlowState();
      expect(authService.getDeviceFlowState()).toBe(null);
    });
  });
});
