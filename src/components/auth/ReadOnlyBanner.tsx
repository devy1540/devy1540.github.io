import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePermissions } from '@/hooks/usePermissions';

export interface ReadOnlyBannerProps {
  owner: string;
  repo: string;
}

export const ReadOnlyBanner = ({ owner, repo }: ReadOnlyBannerProps) => {
  const { isCheckingPermission, retryPermissionCheck } = usePermissions({
    owner,
    repo,
    autoCheck: false,
  });

  const handleRetryPermission = async () => {
    await retryPermissionCheck();
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-orange-800">
          <strong>읽기 전용 모드</strong> - 이 저장소에 대한 편집 권한이
          없습니다.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetryPermission}
          disabled={isCheckingPermission}
          className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          {isCheckingPermission ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              확인 중...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              권한 재확인
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
