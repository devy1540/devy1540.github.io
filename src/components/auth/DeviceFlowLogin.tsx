import { FC, useEffect, useState } from 'react';
import { Github, ExternalLink, Copy, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';

interface DeviceFlowLoginProps {
  className?: string;
}

export const DeviceFlowLogin: FC<DeviceFlowLoginProps> = ({ className }) => {
  console.log('DeviceFlowLogin component rendered');

  const { loginWithDeviceFlow, cancelDeviceFlow, isLoading, deviceFlow } =
    useGitHubAuthStore();

  console.log('DeviceFlowLogin state:', {
    isLoading,
    deviceFlow: !!deviceFlow,
  });

  const [, forceUpdate] = useState({});

  const handleStartDeviceFlow = async () => {
    try {
      await loginWithDeviceFlow();
    } catch (err) {
      console.error('Device Flow authentication failed:', err);
    }
  };

  const handleCopyUserCode = async () => {
    console.log('Copy button clicked!');
    if (deviceFlow?.userCode) {
      try {
        await navigator.clipboard.writeText(deviceFlow.userCode);
        console.log('User code copied successfully:', deviceFlow.userCode);
      } catch (error) {
        console.error('Failed to copy user code:', error);
        // Fallback: select text for manual copy
        const codeElement = document.querySelector('code');
        if (codeElement) {
          const range = document.createRange();
          range.selectNodeContents(codeElement);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    } else {
      console.error('No user code available to copy');
    }
  };

  const openVerificationUrl = () => {
    console.log('GitHub verification button clicked!');
    console.log('Device flow state:', deviceFlow);

    if (!deviceFlow) {
      console.error('No device flow state available');
      return;
    }

    const verificationUrl =
      deviceFlow.verificationUriComplete || deviceFlow.verificationUri;

    if (!verificationUrl) {
      console.error('No verification URL in device flow state');
      console.error('Available URLs:', {
        verificationUri: deviceFlow.verificationUri,
        verificationUriComplete: deviceFlow.verificationUriComplete,
      });
      return;
    }

    console.log('Opening GitHub verification URL:', verificationUrl);

    try {
      const newWindow = window.open(
        verificationUrl,
        '_blank',
        'noopener,noreferrer'
      );
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed == 'undefined'
      ) {
        console.warn(
          '팝업이 차단되었습니다. 수동으로 링크를 복사해서 새 탭에서 열어주세요.'
        );
        // 팝업이 차단된 경우 사용자에게 알림
        alert(
          '팝업이 차단되었습니다.\n\n1. 아래 링크를 복사하세요:\n' +
            verificationUrl +
            '\n\n2. 새 탭에서 링크를 열고 인증을 완료하세요.\n3. 인증 완료 후 이 페이지로 돌아오세요.'
        );
      } else {
        console.log('GitHub verification page opened successfully');
      }
    } catch (error) {
      console.error('Error opening verification URL:', error);
      // 에러 발생 시에도 사용자에게 수동 방법 안내
      alert(
        '인증 페이지 열기에 실패했습니다.\n\n수동으로 다음 링크를 새 탭에서 열어주세요:\n' +
          verificationUrl
      );
    }
  };

  const formatTimeRemaining = (): string => {
    if (!deviceFlow) return '';

    const now = new Date();
    const expiresAt = new Date(
      deviceFlow.startedAt.getTime() + deviceFlow.expiresIn * 1000
    );
    const remainingMs = expiresAt.getTime() - now.getTime();

    if (remainingMs <= 0) return '만료됨';

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    return `${minutes}분 ${seconds}초`;
  };

  useEffect(() => {
    if (!deviceFlow) return;

    const timer = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(
        deviceFlow.startedAt.getTime() + deviceFlow.expiresIn * 1000
      );

      if (now > expiresAt) {
        clearInterval(timer);
        cancelDeviceFlow();
      } else {
        // 강제 리렌더링으로 시간 업데이트
        forceUpdate({});
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deviceFlow, cancelDeviceFlow, forceUpdate]);

  return (
    <div className={className}>
      <div className="space-y-4">
        {!deviceFlow ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                GitHub 계정으로 직접 로그인하세요. Personal Access Token 생성이
                필요하지 않습니다.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• 안전한 OAuth Device Flow 사용</p>
                <p>• 토큰은 암호화되어 안전하게 저장됩니다</p>
                <p>• repo, user 권한이 자동으로 요청됩니다</p>
              </div>
            </div>

            <Button
              onClick={handleStartDeviceFlow}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              {isLoading ? '초기화 중...' : 'GitHub으로 로그인'}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>인증 대기 중 - 남은 시간: {formatTimeRemaining()}</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">인증 코드:</p>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-background border rounded text-lg font-mono tracking-wider">
                    {deviceFlow.userCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCopyUserCode();
                    }}
                    className="flex items-center gap-1"
                    type="button"
                  >
                    <Copy className="w-3 h-3" />
                    복사
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  아래 버튼을 클릭하여 GitHub에서 인증하세요:
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Button click event triggered');
                      openVerificationUrl();
                    }}
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    type="button"
                  >
                    <ExternalLink className="w-4 h-4" />
                    GitHub에서 인증하기
                  </Button>
                  <Button
                    onClick={cancelDeviceFlow}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    취소
                  </Button>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    또는 수동으로 다음 링크를 새 탭에서 열어주세요:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background border rounded px-2 py-1 flex-1 truncate">
                      {deviceFlow.verificationUriComplete ||
                        deviceFlow.verificationUri}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const url =
                          deviceFlow.verificationUriComplete ||
                          deviceFlow.verificationUri;
                        if (url) {
                          try {
                            await navigator.clipboard.writeText(url);
                          } catch (error) {
                            console.error('Failed to copy URL:', error);
                          }
                        }
                      }}
                      className="flex items-center gap-1"
                      type="button"
                    >
                      <Copy className="w-3 h-3" />
                      복사
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      인증 진행 방법:
                    </p>
                    <ol className="space-y-1 text-blue-700 dark:text-blue-300">
                      <li>1. "GitHub에서 인증하기" 버튼 클릭</li>
                      <li>2. 위의 코드를 GitHub 페이지에 입력</li>
                      <li>3. Authorize 클릭</li>
                      <li>
                        4. 이 페이지로 돌아와서 자동 로그인 완료를 기다리세요
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
