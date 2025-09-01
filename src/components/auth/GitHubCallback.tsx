import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const GitHubCallback: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-amber-600" />
          </div>
          <CardTitle>인증 방법이 변경되었습니다</CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              보안 향상을 위해 GitHub 인증 방식이 Device Flow로 변경되었습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              설정 페이지에서 새로운 방식으로 GitHub에 연결해 주세요.
            </p>
            <Button
              onClick={() => navigate('/settings', { replace: true })}
              className="w-full"
            >
              설정 페이지로 이동
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
