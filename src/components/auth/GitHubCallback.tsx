import { FC, useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { GitHubAppAuthService } from '@/services/github-app-auth';

export const GitHubCallback: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authService] = useState(() => new GitHubAppAuthService());
  const { setUser } = useGitHubAuthStore();
  const { success, error } = useToastStore();

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const handleGitHubAppAuth = useCallback(
    async (code: string, state: string) => {
      setIsLoading(true);
      try {
        const result = await authService.handleOAuthCallback(code, state);

        if (result.success && result.user) {
          setUser(result.user);
          success('GitHub App 인증이 완료되었습니다!');
          navigate('/settings');
        } else {
          error(result.error || 'GitHub App 인증에 실패했습니다.');
        }
      } catch (err) {
        console.error('GitHub App authentication failed:', err);
        error('GitHub App 인증 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [authService, setUser, success, error, navigate]
  );

  useEffect(() => {
    console.log('GitHubCallback useEffect:', { code, state, errorParam });

    if (errorParam) {
      error(`GitHub 인증 실패: ${errorParam}`);
      navigate('/settings');
      return;
    }

    // GitHub App 자동 인증 처리
    if (code && state) {
      console.log('Starting GitHub App authentication...');
      handleGitHubAppAuth(code, state);
    } else {
      console.log('Missing code or state:', { code: !!code, state: !!state });
    }
  }, [code, state, errorParam, error, navigate, handleGitHubAppAuth]);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      error('Personal Access Token을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.authenticateWithToken(token.trim());
      if (result.success && result.user) {
        setUser(result.user);
        success('GitHub 계정에 성공적으로 연결되었습니다!');
        navigate('/settings');
      } else {
        error(result.error || '인증에 실패했습니다. 토큰을 확인해주세요.');
      }
    } catch (err) {
      error('인증에 실패했습니다. 토큰을 확인해주세요.');
      console.error('Token authentication failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (errorParam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <CardTitle className="text-destructive">인증 실패</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              GitHub 인증 중 오류가 발생했습니다.
            </p>
            <Button onClick={() => navigate('/settings')}>
              설정으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle>
            GitHub App 인증 {isLoading ? '진행 중' : '완료'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-muted-foreground text-center">
                GitHub App 인증을 처리하는 중입니다...
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-center">
                GitHub App 인증이 완료되었습니다!
              </p>

              {code && !isLoading && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    인증이 자동으로 처리되지 않았다면, 아래에 Personal Access
                    Token을 입력해주세요.
                  </p>
                </div>
              )}
            </>
          )}

          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                Personal Access Token
              </label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                GitHub Settings → Developer settings → Personal access
                tokens에서 repo, user 권한으로 생성해주세요.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !token.trim()}
                className="flex-1"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                인증 완료
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/settings')}
              >
                나중에
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
