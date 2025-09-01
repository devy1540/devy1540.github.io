import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GitHubAuthService } from '@/services/github-auth';
import { GitHubApiService } from '@/services/github-api';
import type { GitHubAuthState, GitHubAuthActions } from '@/types/github';

type GitHubAuthStore = GitHubAuthState & GitHubAuthActions;

const authService = new GitHubAuthService();
const apiService = new GitHubApiService();

export const useGitHubAuthStore = create<GitHubAuthStore>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      user: null,
      repositories: [],
      accessToken: null,
      error: null,
      lastSyncAt: null,
      hasWriteAccess: false,
      permissionCheckAt: null,

      // Actions
      loginWithToken: async (token: string) => {
        try {
          set({ isLoading: true, error: null });

          // Personal Access Token으로 인증
          const result = await authService.authenticateWithToken(token);

          if (!result.success) {
            throw new Error(result.error || '토큰 인증에 실패했습니다.');
          }

          // API 서비스 초기화
          apiService.initialize(token);

          // 사용자 정보 가져오기
          const user = await apiService.getCurrentUser();
          const repositories = await apiService.getUserRepositories();

          set({
            isAuthenticated: true,
            isLoading: false,
            user,
            repositories,
            accessToken: token,
            lastSyncAt: new Date(),
            error: null,
          });

          // 첫 번째 저장소가 있다면 권한 확인
          if (repositories.length > 0) {
            const firstRepo = repositories[0];
            const [owner, repo] = firstRepo.full_name.split('/');
            await get().checkWritePermission(owner, repo);
          }
        } catch (error) {
          console.error('Token login failed:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Personal Access Token 인증에 실패했습니다.',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // 토큰 삭제
          authService.clearToken();
          apiService.destroy();

          // 상태 초기화
          set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            repositories: [],
            accessToken: null,
            error: null,
            lastSyncAt: null,
            hasWriteAccess: false,
            permissionCheckAt: null,
          });
        } catch (error) {
          console.error('Logout failed:', error);
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      fetchUserInfo: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ error: 'No access token available' });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          apiService.initialize(accessToken);
          const user = await apiService.getCurrentUser();

          set({
            user,
            isLoading: false,
            lastSyncAt: new Date(),
          });
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch user info';

          // 인증 오류인 경우 로그아웃 처리
          if (errorMessage.includes('authentication expired')) {
            get().logout();
          } else {
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        }
      },

      fetchRepositories: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ error: 'No access token available' });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          apiService.initialize(accessToken);
          const repositories = await apiService.getUserRepositories();

          set({
            repositories,
            isLoading: false,
            lastSyncAt: new Date(),
          });
        } catch (error) {
          console.error('Failed to fetch repositories:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch repositories';

          // 인증 오류인 경우 로그아웃 처리
          if (errorMessage.includes('authentication expired')) {
            get().logout();
          } else {
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        }
      },

      refreshToken: async () => {
        try {
          set({ isLoading: true, error: null });

          const storedToken = authService.getStoredToken();

          if (!storedToken) {
            throw new Error('No stored token found');
          }

          // 토큰 유효성 검사
          const isValid = await authService.validateToken(storedToken);

          if (!isValid) {
            throw new Error('Token is no longer valid');
          }

          // API 서비스 재초기화
          apiService.initialize(storedToken);

          // 사용자 정보 및 저장소 갱신
          const [user, repositories] = await Promise.all([
            apiService.getCurrentUser(),
            apiService.getUserRepositories(),
          ]);

          set({
            isAuthenticated: true,
            isLoading: false,
            user,
            repositories,
            accessToken: storedToken,
            lastSyncAt: new Date(),
            error: null,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);

          // 토큰이 만료되었거나 유효하지 않은 경우 로그아웃 처리
          get().logout();
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkWritePermission: async (owner: string, repo: string) => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ error: 'No access token available for permission check' });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          apiService.initialize(accessToken);
          const permissionResult = await apiService.checkRepositoryPermission(
            owner,
            repo
          );

          set({
            hasWriteAccess: permissionResult.hasWriteAccess,
            permissionCheckAt: permissionResult.checkedAt,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to check write permission:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to check repository permission';

          // 권한 확인 실패 시 기본적으로 읽기 전용 모드
          set({
            hasWriteAccess: false,
            permissionCheckAt: new Date(),
            error: errorMessage,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'github-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        repositories: state.repositories,
        lastSyncAt: state.lastSyncAt,
        hasWriteAccess: state.hasWriteAccess,
        permissionCheckAt: state.permissionCheckAt,
        // accessToken은 암호화된 형태로 별도 저장되므로 제외
      }),
    }
  )
);

// 앱 시작 시 저장된 토큰으로 인증 상태 복원
export const initializeGitHubAuth = async () => {
  const store = useGitHubAuthStore.getState();

  try {
    const storedToken = authService.getStoredToken();

    if (storedToken && !store.isAuthenticated) {
      // 토큰이 있지만 인증 상태가 아닌 경우 토큰 검증 후 상태 복원
      const isValid = await authService.validateToken(storedToken);

      if (isValid) {
        apiService.initialize(storedToken);

        store.setLoading(true);

        try {
          const [user, repositories] = await Promise.all([
            apiService.getCurrentUser(),
            apiService.getUserRepositories(),
          ]);

          useGitHubAuthStore.setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            repositories,
            accessToken: storedToken,
            lastSyncAt: new Date(),
            error: null,
          });
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          authService.clearToken();
          store.setLoading(false);
        }
      } else {
        // 토큰이 유효하지 않으면 삭제
        authService.clearToken();
      }
    }
  } catch (error) {
    console.error('Auth initialization failed:', error);
    store.setLoading(false);
  }
};
