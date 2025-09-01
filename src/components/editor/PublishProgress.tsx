import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { usePublishStore } from '@/stores/usePublishStore';
import { 
  CheckCircle, 
  XCircle, 
  GitCommit, 
  Upload, 
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import type { PublishStage } from '@/types/publish';

interface PublishProgressProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry?: () => void;
}

export const PublishProgress: FC<PublishProgressProps> = ({
  open,
  onOpenChange,
  onRetry
}) => {
  const { publishStatus, deploymentStatus, isTrackingDeployment } = usePublishStore();

  if (!publishStatus) {
    return null;
  }

  const getStageIcon = (stage: PublishStage, isActive: boolean) => {
    if (publishStatus.stage === 'failed' && isActive) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    
    if (publishStatus.stage === 'completed' && stage === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (isActive) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
    
    if (shouldShowCompleted(stage)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    // Default inactive icon based on stage
    switch (stage) {
      case 'preparing':
      case 'validating':
        return <GitCommit className="h-5 w-5 text-muted-foreground" />;
      case 'committing':
      case 'pushing':
        return <Upload className="h-5 w-5 text-muted-foreground" />;
      case 'deploying':
        return <RefreshCw className="h-5 w-5 text-muted-foreground" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <GitCommit className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const shouldShowCompleted = (stage: PublishStage): boolean => {
    const stages: PublishStage[] = ['preparing', 'validating', 'committing', 'pushing', 'deploying', 'completed'];
    const currentIndex = stages.indexOf(publishStatus.stage);
    const stageIndex = stages.indexOf(stage);
    
    return currentIndex > stageIndex && publishStatus.stage !== 'failed';
  };

  const getStageLabel = (stage: PublishStage): string => {
    switch (stage) {
      case 'preparing': return '준비';
      case 'validating': return '검증';
      case 'committing': return '커밋';
      case 'pushing': return '푸시';
      case 'deploying': return '배포';
      case 'completed': return '완료';
      case 'failed': return '실패';
      default: return '알 수 없음';
    }
  };

  const isStageActive = (stage: PublishStage): boolean => {
    return publishStatus.stage === stage;
  };

  const stages: PublishStage[] = ['preparing', 'validating', 'committing', 'pushing', 'deploying', 'completed'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {publishStatus.stage === 'failed' ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : publishStatus.stage === 'completed' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            {publishStatus.stage === 'failed' ? '게시 실패' : 
             publishStatus.stage === 'completed' ? '게시 완료' : '게시 진행 중'}
          </DialogTitle>
          <DialogDescription>
            {publishStatus.message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>전체 진행률</span>
              <span>{publishStatus.progress}%</span>
            </div>
            <Progress 
              value={publishStatus.progress} 
              className={`h-2 ${publishStatus.stage === 'failed' ? '[&>div]:bg-destructive' : ''}`}
            />
          </div>

          {/* Stage Details */}
          <div className="space-y-3">
            {stages.map((stage) => (
              <div 
                key={stage}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isStageActive(stage) ? 'bg-muted' : ''
                }`}
              >
                {getStageIcon(stage, isStageActive(stage))}
                <span className={`text-sm font-medium ${
                  isStageActive(stage) ? 'text-foreground' : 
                  shouldShowCompleted(stage) ? 'text-green-600 dark:text-green-400' :
                  'text-muted-foreground'
                }`}>
                  {getStageLabel(stage)}
                </span>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {publishStatus.error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium mb-1">오류 상세:</p>
              <p className="text-sm text-destructive/80">{publishStatus.error}</p>
            </div>
          )}

          {/* Success Links */}
          {publishStatus.stage === 'completed' && (
            <div className="mt-4 space-y-2">
              {publishStatus.commitUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => window.open(publishStatus.commitUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  커밋 보기
                </Button>
              )}
              
              {deploymentStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => window.open(deploymentStatus.htmlUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  배포 상태 보기
                </Button>
              )}
            </div>
          )}

          {/* Deployment Status */}
          {isTrackingDeployment && deploymentStatus && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">GitHub Actions 배포</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  deploymentStatus.status === 'completed' && deploymentStatus.conclusion === 'success' 
                    ? 'bg-green-500' 
                    : deploymentStatus.status === 'in_progress' 
                    ? 'bg-yellow-500 animate-pulse' 
                    : deploymentStatus.conclusion === 'failure'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                }`} />
                <span className="text-sm capitalize">
                  {deploymentStatus.conclusion || deploymentStatus.status}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {publishStatus.stage === 'failed' && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          )}
          
          <Button 
            onClick={() => onOpenChange(false)} 
            variant={publishStatus.stage === 'completed' ? 'default' : 'outline'}
            size="sm"
          >
            {publishStatus.stage === 'completed' ? '완료' : '닫기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};