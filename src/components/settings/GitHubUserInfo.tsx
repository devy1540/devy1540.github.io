import { FC, useState } from 'react';
import {
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Settings,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import {
  useCurrentRepository,
  useRepositoryStore,
} from '@/stores/useRepositoryStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GitHubUserInfoProps {
  className?: string;
}

export const GitHubUserInfo: FC<GitHubUserInfoProps> = ({ className }) => {
  const {
    user,
    repositories,
    lastSyncAt,
    isLoading,
    error,
    fetchUserInfo,
    fetchRepositories,
  } = useGitHubAuthStore();

  const currentRepository = useCurrentRepository();
  const { setCurrentRepository } = useRepositoryStore();
  const [showAllRepos, setShowAllRepos] = useState(false);

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchUserInfo(), fetchRepositories()]);
    } catch (err) {
      console.error('Failed to refresh GitHub data:', err);
    }
  };

  const handleRepositoryChange = (repo: (typeof repositories)[0]) => {
    setCurrentRepository(repo);
    console.log('✅ 저장소 변경:', repo.full_name);
  };

  if (!user) return null;

  const writeableRepos = repositories.filter(
    (repo) => repo.permissions.push || repo.permissions.admin
  );
  const targetBlogRepo = writeableRepos.find(
    (repo) =>
      repo.full_name === 'devy1540/devy1540.github.io' ||
      repo.name === 'devy1540.github.io'
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 사용자 기본 정보 */}
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
          <AvatarFallback>
            {(user.name || user.login).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold text-lg">{user.name || user.login}</h3>
            <p className="text-sm text-muted-foreground">@{user.login}</p>
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{user.public_repos} 공개 저장소</span>
            <span>{user.followers} 팔로워</span>
            <span>{user.following} 팔로잉</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                GitHub 프로필 <ExternalLink className="w-3 h-3" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw
                className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
              />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* 현재 선택된 저장소 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            블로그 저장소 설정
          </h4>
          <Badge variant="secondary">{writeableRepos.length}개 사용 가능</Badge>
        </div>

        <div className="space-y-3">
          {!targetBlogRepo ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    블로그 저장소를 찾을 수 없습니다
                  </h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    <strong>devy1540.github.io</strong> 저장소가 필요합니다.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    GitHub Pages 블로그를 위해 해당 저장소를 생성하거나 접근
                    권한을 확인해주세요.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                블로그 저장소가 자동으로 선택되었습니다:
              </p>

              {currentRepository && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      <strong>{currentRepository.name}</strong> 저장소가 선택됨
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {targetBlogRepo && writeableRepos.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                다른 저장소 선택 (선택사항):
              </p>

              {writeableRepos
                .slice(0, showAllRepos ? writeableRepos.length : 3)
                .map((repo) => (
                  <div
                    key={repo.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentRepository?.id === repo.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleRepositoryChange(repo)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{repo.name}</h5>
                        {repo.private && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                        {currentRepository?.id === repo.id && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>

                      {repo.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

              {writeableRepos.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRepos(!showAllRepos)}
                  className="w-full"
                >
                  {showAllRepos
                    ? `숨기기`
                    : `${writeableRepos.length - 3}개 더 보기`}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 저장소가 없는 경우 */}
      {writeableRepos.length === 0 && (
        <div className="flex items-center gap-2 p-4 border rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          쓰기 권한이 있는 저장소가 없습니다.
        </div>
      )}

      {/* 마지막 동기화 시간 */}
      {lastSyncAt && (
        <p className="text-xs text-muted-foreground">
          마지막 동기화:{' '}
          {formatDistanceToNow(lastSyncAt, {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="flex items-center gap-2 p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};
