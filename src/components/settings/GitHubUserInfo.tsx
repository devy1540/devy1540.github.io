import { FC } from 'react';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
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
    fetchRepositories 
  } = useGitHubAuthStore();

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchUserInfo(),
        fetchRepositories(),
      ]);
    } catch (err) {
      console.error('Failed to refresh GitHub data:', err);
    }
  };

  if (!user) return null;

  const writeableRepos = repositories.filter(repo => repo.permissions.push || repo.permissions.admin);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 사용자 기본 정보 */}
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
          <AvatarFallback>{(user.name || user.login).slice(0, 2).toUpperCase()}</AvatarFallback>
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
            <Button
              variant="outline"
              size="sm"
              asChild
            >
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
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* 저장소 정보 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">연결된 저장소</h4>
          <Badge variant="secondary">
            {writeableRepos.length}개 저장소
          </Badge>
        </div>
        
        {writeableRepos.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {writeableRepos.slice(0, 5).map(repo => (
              <div 
                key={repo.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm truncate">{repo.name}</h5>
                    {repo.private && <Badge variant="outline" className="text-xs">Private</Badge>}
                  </div>
                  
                  {repo.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {repo.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    업데이트: {formatDistanceToNow(new Date(repo.updated_at), { 
                      addSuffix: true, 
                      locale: ko 
                    })}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="ml-2 shrink-0"
                >
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`${repo.name} 저장소 열기`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            ))}
            
            {writeableRepos.length > 5 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                그 외 {writeableRepos.length - 5}개 저장소
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 border rounded-lg text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            쓰기 권한이 있는 저장소가 없습니다.
          </div>
        )}
      </div>

      {/* 마지막 동기화 시간 */}
      {lastSyncAt && (
        <p className="text-xs text-muted-foreground">
          마지막 동기화: {formatDistanceToNow(lastSyncAt, { 
            addSuffix: true, 
            locale: ko 
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