import { FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { useToastStore } from '@/stores/useToastStore';

export const GitHubCallback: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithToken } = useGitHubAuthStore();
  const { success, error } = useToastStore();

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      error(`GitHub 인증 실패: ${errorParam}`);
      navigate('/settings');
    }
  }, [errorParam, error, navigate]);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      error('Personal Access Token을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithToken(token.trim());
      success('GitHub 계정에 성공적으로 연결되었습니다!');
      navigate('/settings');
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
          <CardTitle>GitHub OAuth 인증 완료</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            GitHub 인증이 성공적으로 완료되었습니다!
          </p>

          {code && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                인증 코드:{' '}
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {code}
                </code>
              </p>
              <p className="text-sm text-muted-foreground">
                보안상의 이유로 GitHub에서는 브라우저에서 직접 토큰 교환이
                불가능합니다. 아래에 Personal Access Token을 입력해주세요.
              </p>
            </div>
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
