import { FC, useState } from 'react';
import { Github, Eye, EyeOff, ExternalLink, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { GitHubAppAuthService } from '@/services/github-app-auth';

interface GitHubLoginButtonProps {
  className?: string;
}

export const GitHubLoginButton: FC<GitHubLoginButtonProps> = ({
  className,
}) => {
  const { loginWithToken, isLoading, error } = useGitHubAuthStore();

  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [authService] = useState(() => new GitHubAppAuthService());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      return;
    }

    try {
      await loginWithToken(token.trim());
    } catch (err) {
      console.error('GitHub token authentication failed:', err);
    }
  };

  const handleOAuthLogin = () => {
    try {
      authService.startOAuthFlow();
    } catch (err) {
      console.error('OAuth flow start failed:', err);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Github className="w-5 h-5" />
            GitHub 인증
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="oauth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth">GitHub 계정 로그인</TabsTrigger>
              <TabsTrigger value="token">Personal Access Token</TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Github className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      GitHub OAuth 로그인
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    GitHub App을 통해 안전하게 로그인하세요.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      • <strong>필요한 권한:</strong> Contents (Read/Write),
                      Metadata (Read)
                    </p>
                    <p>• GitHub App을 통한 보안 강화된 인증</p>
                    <p>• Personal Access Token 입력 불필요!</p>
                  </div>
                </div>

                <Button
                  onClick={handleOAuthLogin}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Github className="w-4 h-4" />
                  )}
                  GitHub으로 로그인
                </Button>

                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-medium">로그인 방법:</p>
                  <ol className="space-y-1 ml-4">
                    <li>1. "GitHub으로 로그인" 버튼 클릭</li>
                    <li>2. GitHub App 설치 및 권한 승인</li>
                    <li>3. 자동으로 토큰 교환 및 연결 완료</li>
                    <li>4. Personal Access Token 입력 불필요!</li>
                  </ol>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="token" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      Personal Access Token
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    GitHub Personal Access Token을 입력하여 연결하세요.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      • <strong>필요한 권한:</strong> repo, user
                    </p>
                    <p>• 토큰은 암호화되어 안전하게 저장됩니다</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showToken ? 'text' : 'password'}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setShowToken(!showToken)}
                        disabled={isLoading}
                        aria-label={showToken ? 'Hide token' : 'Show token'}
                      >
                        {showToken ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !token.trim()}
                      className="w-full flex items-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <Github className="w-4 h-4" />
                      )}
                      {isLoading ? '연결 중...' : 'GitHub에 연결'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          'https://github.com/settings/tokens/new',
                          '_blank'
                        )
                      }
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Personal Access Token 생성하기
                    </Button>
                  </div>
                </form>

                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-medium">토큰 생성 방법:</p>
                  <ol className="space-y-1 ml-4">
                    <li>1. 위의 "Personal Access Token 생성하기" 버튼 클릭</li>
                    <li>2. Token name: 원하는 이름 입력</li>
                    <li>
                      3. Select scopes에서 <strong>repo</strong>와{' '}
                      <strong>user</strong> 체크
                    </li>
                    <li>4. Generate token 클릭 후 토큰 복사</li>
                    <li>5. 위 입력란에 토큰 붙여넣기</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md mt-4">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
