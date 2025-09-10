import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GitHubAuthService } from '@/services/github-auth';
import { GitHubApiService } from '@/services/github-api';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import type { GitHubAuthState, GitHubAuthActions } from '@/types/github';

type GitHubAuthStore = GitHubAuthState & GitHubAuthActions;

let authService: GitHubAuthService | null = null;
let apiService: GitHubApiService | null = null;

const getAuthService = () => {
  if (!authService) {
    try {
      authService = new GitHubAuthService();
    } catch (error) {
      console.warn('GitHub Client ID not configured:', error);
      return null;
    }
  }
  return authService;
};

const getApiService = () => {
  if (!apiService) {
    apiService = new GitHubApiService();
  }
  return apiService;
};

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
      deviceFlow: null,
      authMethod: null,

      // Actions
      loginWithToken: async (token: string) => {
        try {
          set({ isLoading: true, error: null });

          const authSvc = getAuthService();
          if (!authSvc) {
            throw new Error('GitHub authentication service not available');
          }

          // Personal Access Token으로 인증
          const result = await authSvc.authenticateWithToken(token);

          if (!result.success) {
            throw new Error(result.error || '토큰 인증에 실패했습니다.');
          }

          const apiSvc = getApiService();

          // API 서비스 초기화
          apiSvc.initialize(token);

          // 사용자 정보 가져오기
          const user = await apiSvc.getCurrentUser();
          const repositories = await apiSvc.getUserRepositories();

          set({
            isAuthenticated: true,
            isLoading: false,
            user,
            repositories,
            accessToken: token,
            lastSyncAt: new Date(),
            error: null,
            authMethod: 'token',
          });

          // devy1540.github.io 저장소 우선 선택, 없으면 선택하지 않음
          console.log(
            '🔍 저장소 목록에서 블로그 저장소 찾기:',
            repositories.map((r) => r.full_name)
          );

          const targetRepo = repositories.find(
            (repo) =>
              repo.full_name === 'devy1540/devy1540.github.io' ||
              repo.name === 'devy1540.github.io' ||
              repo.full_name.endsWith('.github.io')
          );

          console.log(
            '🎯 찾은 블로그 저장소:',
            targetRepo?.full_name || 'null'
          );

          if (targetRepo) {
            const [owner, repo] = targetRepo.full_name.split('/');

            // devy1540.github.io 저장소로 설정
            useRepositoryStore.getState().setCurrentRepository(targetRepo);
            console.log('✅ 블로그 저장소 자동 선택:', targetRepo.full_name);

            await get().checkWritePermission(owner, repo);
          } else {
            console.log(
              'ℹ️ 블로그 저장소를 찾을 수 없어 자동 선택하지 않습니다. 사용자가 수동으로 선택해야 합니다.'
            );
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

      loginWithDeviceFlow: async () => {
        try {
          set({ isLoading: true, error: null, deviceFlow: null });

          const authSvc = getAuthService();
          if (!authSvc) {
            throw new Error('GitHub authentication service not available');
          }

          // Device Flow 시작
          console.log('Starting GitHub Device Flow...');
          const deviceFlowState = await authSvc.startDeviceFlow();
          console.log('Device Flow started successfully:', deviceFlowState);

          set({
            deviceFlow: deviceFlowState,
            isLoading: false,
          });

          // 토큰 폴링 시작 - Memory Leak 방지를 위한 interval 참조 저장
          console.log(
            `🔄 Starting token polling every ${deviceFlowState.interval} seconds...`
          );
          const pollInterval = setInterval(async () => {
            try {
              console.log('🔍 Polling for Device Flow token...');
              const token = await authSvc.pollForToken();
              console.log(
                '🎉 Token received from polling!',
                token ? '✅ Token obtained' : '❌ No token'
              );

              // 토큰을 받았으면 폴링 중단하고 인증 완료 처리
              clearInterval(pollInterval);
              clearTimeout(expirationTimeout);

              // 토큰으로 인증 완료
              console.log('Authenticating with received token...');
              const result = await authSvc.authenticateWithToken(token);

              if (!result.success) {
                console.error('Token authentication failed:', result.error);
                throw new Error(result.error || '토큰 인증에 실패했습니다.');
              }

              console.log(
                'Token authentication successful, fetching user data...'
              );
              const apiSvc = getApiService();
              apiSvc.initialize(token);

              const user = await apiSvc.getCurrentUser();
              const repositories = await apiSvc.getUserRepositories();
              console.log('User data fetched successfully:', {
                user: user.login,
                repoCount: repositories.length,
              });

              set({
                isAuthenticated: true,
                isLoading: false,
                user,
                repositories,
                accessToken: token,
                lastSyncAt: new Date(),
                error: null,
                deviceFlow: null,
                authMethod: 'device_flow',
              });

              // devy1540.github.io 저장소 우선 선택, 없으면 선택하지 않음
              console.log(
                '🔍 Device Flow - 저장소 목록에서 블로그 저장소 찾기:',
                repositories.map((r) => r.full_name)
              );

              const targetRepo = repositories.find(
                (repo) =>
                  repo.full_name === 'devy1540/devy1540.github.io' ||
                  repo.name === 'devy1540.github.io' ||
                  repo.full_name.endsWith('.github.io')
              );

              console.log(
                '🎯 Device Flow - 찾은 블로그 저장소:',
                targetRepo?.full_name || 'null'
              );

              if (targetRepo) {
                const [owner, repo] = targetRepo.full_name.split('/');

                // devy1540.github.io 저장소로 설정
                useRepositoryStore.getState().setCurrentRepository(targetRepo);
                console.log(
                  '✅ 블로그 저장소 자동 선택 (Device Flow):',
                  targetRepo.full_name
                );

                await get().checkWritePermission(owner, repo);
              } else {
                console.log(
                  'ℹ️ Device Flow - 블로그 저장소를 찾을 수 없어 자동 선택하지 않습니다. 사용자가 수동으로 선택해야 합니다.'
                );
              }
            } catch (error) {
              if (error instanceof Error) {
                if (error.message === 'PENDING') {
                  // 계속 대기
                  console.log('⏳ Authorization still pending...');
                  return;
                } else if (error.message === 'SLOW_DOWN') {
                  // 간격 증가 (실제로는 GitHub에서 권장하는 interval * 2)
                  console.log('🐌 Slowing down polling...');
                  return;
                } else {
                  // 다른 에러는 폴링 중단
                  clearInterval(pollInterval);
                  clearTimeout(expirationTimeout);
                  console.error('❌ Device flow authentication failed:', error);
                  set({
                    error: error.message,
                    isLoading: false,
                    deviceFlow: null,
                  });
                }
              }
            }
          }, deviceFlowState.interval * 1000);

          // 만료 시간에 자동으로 폴링 중단
          const expirationTimeout = setTimeout(() => {
            clearInterval(pollInterval);
            const currentState = get();
            if (currentState.deviceFlow && !currentState.isAuthenticated) {
              set({
                error: 'Device Flow가 만료되었습니다. 다시 시도해주세요.',
                isLoading: false,
                deviceFlow: null,
              });
            }
          }, deviceFlowState.expiresIn * 1000);
        } catch (error) {
          console.error('Device Flow login failed:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Device Flow 인증에 실패했습니다.',
            isLoading: false,
            deviceFlow: null,
          });
        }
      },

      cancelDeviceFlow: () => {
        const authSvc = getAuthService();
        if (authSvc) {
          authSvc.clearDeviceFlowState();
        }

        set({
          deviceFlow: null,
          isLoading: false,
          error: null,
        });
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // 토큰 및 Device Flow 상태 삭제
          const authSvc = getAuthService();
          const apiSvc = getApiService();

          if (authSvc) {
            authSvc.clearToken();
            authSvc.clearDeviceFlowState();
          }
          if (apiSvc) apiSvc.destroy();

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
            deviceFlow: null,
            authMethod: null,
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

          const apiSvc = getApiService();
          if (!apiSvc) {
            throw new Error('GitHub API service not available');
          }

          apiSvc.initialize(accessToken);
          const user = await apiSvc.getCurrentUser();

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

          const apiSvc = getApiService();
          if (!apiSvc) {
            throw new Error('GitHub API service not available');
          }

          apiSvc.initialize(accessToken);
          const repositories = await apiSvc.getUserRepositories();

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

          const authSvc = getAuthService();
          if (!authSvc) {
            throw new Error('GitHub authentication service not available');
          }

          const storedToken = authSvc.getStoredToken();

          if (!storedToken) {
            throw new Error('No stored token found');
          }

          // 토큰 유효성 검사
          const isValid = await authSvc.validateToken(storedToken);

          if (!isValid) {
            throw new Error('Token is no longer valid');
          }

          // API 서비스 재초기화
          const apiSvc = getApiService();
          if (!apiSvc) {
            throw new Error('GitHub API service not available');
          }

          apiSvc.initialize(storedToken);

          // 사용자 정보 및 저장소 갱신
          const [user, repositories] = await Promise.all([
            apiSvc.getCurrentUser(),
            apiSvc.getUserRepositories(),
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

          const apiSvc = getApiService();
          if (!apiSvc) {
            throw new Error('GitHub API service not available');
          }

          apiSvc.initialize(accessToken);
          const permissionResult = await apiSvc.checkRepositoryPermission(
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

  console.log('🔄 GitHub Auth 초기화 시작');
  console.log('현재 인증 상태:', store.isAuthenticated);

  try {
    const authSvc = getAuthService();
    if (!authSvc) {
      console.warn(
        '⚠️ GitHub authentication service not available during initialization'
      );
      return;
    }

    const storedToken = authSvc.getStoredToken();
    console.log('저장된 토큰 존재:', !!storedToken);

    if (storedToken && !store.isAuthenticated) {
      console.log('🔍 토큰이 있고 미인증 상태 - 토큰 검증 시작');

      // 토큰이 있지만 인증 상태가 아닌 경우 토큰 검증 후 상태 복원
      const isValid = await authSvc.validateToken(storedToken);
      console.log('토큰 유효성 검증 결과:', isValid);

      if (isValid) {
        console.log('✅ 토큰 유효 - 사용자 데이터 복원 시작');

        const apiSvc = getApiService();
        if (!apiSvc) {
          throw new Error('GitHub API service not available');
        }

        apiSvc.initialize(storedToken);

        store.setLoading(true);

        try {
          const [user, repositories] = await Promise.all([
            apiSvc.getCurrentUser(),
            apiSvc.getUserRepositories(),
          ]);

          console.log('✅ 사용자 데이터 복원 완료:', {
            user: user.login,
            repoCount: repositories.length,
          });

          useGitHubAuthStore.setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            repositories,
            accessToken: storedToken,
            lastSyncAt: new Date(),
            error: null,
          });

          // devy1540.github.io 저장소 자동 선택 (현재 선택된 저장소가 없는 경우)
          const currentRepo = useRepositoryStore.getState().currentRepository;
          if (!currentRepo) {
            console.log(
              '🔍 초기화 - 저장소 목록에서 블로그 저장소 찾기:',
              repositories.map((r) => r.full_name)
            );

            const targetRepo = repositories.find(
              (repo) =>
                repo.full_name === 'devy1540/devy1540.github.io' ||
                repo.name === 'devy1540.github.io' ||
                repo.full_name.endsWith('.github.io')
            );

            console.log(
              '🎯 초기화 - 찾은 블로그 저장소:',
              targetRepo?.full_name || 'null'
            );

            if (targetRepo) {
              useRepositoryStore.getState().setCurrentRepository(targetRepo);
              console.log(
                '✅ 블로그 저장소 자동 선택 (초기화):',
                targetRepo.full_name
              );
            } else {
              console.log(
                'ℹ️ 초기화 - 블로그 저장소를 찾을 수 없어 자동 선택하지 않습니다. 사용자가 수동으로 선택해야 합니다.'
              );
            }
          }

          console.log('🎉 GitHub Auth 초기화 성공!');
        } catch (error) {
          console.error('❌ 인증 상태 복원 실패:', error);
          authSvc.clearToken();
          store.setLoading(false);
        }
      } else {
        console.log('❌ 토큰 무효 - 삭제');
        // 토큰이 유효하지 않으면 삭제
        authSvc.clearToken();
      }
    } else if (storedToken && store.isAuthenticated) {
      console.log('✅ 이미 인증된 상태');
    } else {
      console.log('ℹ️ 저장된 토큰 없음');
    }
  } catch (error) {
    console.error('❌ Auth initialization failed:', error);
    store.setLoading(false);
  }
};
