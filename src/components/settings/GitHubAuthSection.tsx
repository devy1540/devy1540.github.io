import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Unlink, GitBranch } from 'lucide-react';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import { useToastStore } from '@/stores/useToastStore';
import { GitHubLoginButton } from './GitHubLoginButton';
import { GitHubUserInfo } from './GitHubUserInfo';

export const GitHubAuthSection: FC = () => {
  const { isAuthenticated, logout, isLoading, user, error, repositories } =
    useGitHubAuthStore();
  const { currentRepository, setCurrentRepository } = useRepositoryStore();
  const { success, error: showError } = useToastStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 디버깅을 위한 로그
  console.log('GitHubAuthSection 렌더링:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    error,
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      success('연결 해제 완료', 'GitHub 계정 연결이 해제되었습니다.');
    } catch (err) {
      console.error('Logout failed:', err);
      showError('연결 해제 실패', '다시 시도해 주세요.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRepositorySelect = (repoFullName: string) => {
    const selectedRepo = repositories.find(
      (repo) => repo.full_name === repoFullName
    );
    if (selectedRepo) {
      setCurrentRepository(selectedRepo);
      success(
        '저장소 선택 완료',
        `${selectedRepo.full_name}이 선택되었습니다.`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub 연동</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            GitHub 계정을 연결하여 저장소에 블로그 콘텐츠를 직접 게시할 수
            있습니다.
          </p>

          {!isAuthenticated && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                연결 시 다음 권한이 필요합니다:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  • <strong>repo</strong>: 저장소 읽기/쓰기 권한
                </li>
                <li>
                  • <strong>user</strong>: 사용자 정보 읽기 권한
                </li>
              </ul>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <GitHubUserInfo />

            {/* Repository Selection */}
            <div className="space-y-3 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  저장소 선택
                </h4>
                <p className="text-xs text-muted-foreground">
                  블로그 콘텐츠를 게시할 저장소를 선택하세요.
                </p>
              </div>

              {repositories.length > 0 ? (
                <Select
                  value={currentRepository?.full_name || ''}
                  onValueChange={handleRepositorySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="저장소를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo) => (
                      <SelectItem key={repo.id} value={repo.full_name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{repo.full_name}</span>
                          {repo.private && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Private)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  저장소를 불러오는 중...
                </p>
              )}

              {currentRepository && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ 선택됨: {currentRepository.full_name}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm">계정 연결 관리</h4>
                <p className="text-xs text-muted-foreground">
                  GitHub 계정 연결을 해제할 수 있습니다.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isLoggingOut || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Unlink className="w-3 h-3" />
                    연결 해제
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>GitHub 연결 해제</AlertDialogTitle>
                    <AlertDialogDescription>
                      GitHub 계정 연결을 해제하시겠습니까? 해제 후에는 저장소에
                      콘텐츠를 게시할 수 없습니다.
                      <br />
                      <br />
                      저장된 인증 토큰과 사용자 정보가 모두 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoggingOut ? '해제 중...' : '연결 해제'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <GitHubLoginButton />
        )}
      </CardContent>
    </Card>
  );
};
