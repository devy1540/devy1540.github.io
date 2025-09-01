import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { GitHubRateLimit } from '@/types/github';

export interface RateLimitStatusProps {
  rateLimit: GitHubRateLimit | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
  compact?: boolean;
}

export const RateLimitStatus = ({ 
  rateLimit, 
  isLoading = false,
  onRefresh,
  className,
  compact = false
}: RateLimitStatusProps) => {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    if (!rateLimit) return;

    const updateTimeUntilReset = () => {
      const now = Date.now();
      const resetTime = rateLimit.reset * 1000;
      const timeDiff = resetTime - now;

      if (timeDiff <= 0) {
        setTimeUntilReset('Reset available');
        if (onRefresh) {
          onRefresh();
        }
        return;
      }

      const minutes = Math.floor(timeDiff / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (minutes > 0) {
        setTimeUntilReset(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilReset(`${seconds}s`);
      }
    };

    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 1000);

    return () => clearInterval(interval);
  }, [rateLimit, onRefresh]);

  const getStatusInfo = () => {
    if (!rateLimit) {
      return {
        status: 'unknown',
        color: 'secondary',
        icon: Clock,
        message: 'Rate limit info unavailable',
      };
    }

    const usagePercentage = ((rateLimit.limit - rateLimit.remaining) / rateLimit.limit) * 100;

    if (rateLimit.remaining === 0) {
      return {
        status: 'exhausted',
        color: 'destructive',
        icon: AlertTriangle,
        message: 'Rate limit exhausted',
        usagePercentage,
      };
    }

    if (rateLimit.remaining <= 100) {
      return {
        status: 'warning',
        color: 'warning',
        icon: AlertTriangle,
        message: 'Rate limit running low',
        usagePercentage,
      };
    }

    return {
      status: 'good',
      color: 'success',
      icon: CheckCircle,
      message: 'Rate limit healthy',
      usagePercentage,
    };
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full" />
            <div className="w-32 h-4 bg-gray-300 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Badge variant={statusInfo.color === 'destructive' ? 'destructive' : 'secondary'}>
          <IconComponent className="w-3 h-3 mr-1" />
          {rateLimit ? `${rateLimit.remaining}/${rateLimit.limit}` : 'N/A'}
        </Badge>
        {rateLimit && rateLimit.remaining <= 100 && (
          <span className="text-xs text-muted-foreground">
            Reset in {timeUntilReset}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-2">
            <IconComponent className={cn(
              'w-4 h-4',
              statusInfo.status === 'exhausted' && 'text-destructive',
              statusInfo.status === 'warning' && 'text-orange-500',
              statusInfo.status === 'good' && 'text-green-500'
            )} />
            <span>GitHub API Rate Limit</span>
          </div>
          {rateLimit && (
            <Badge variant={statusInfo.color === 'destructive' ? 'destructive' : 'secondary'}>
              {rateLimit.remaining} / {rateLimit.limit}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rateLimit ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span>{Math.round(statusInfo.usagePercentage || 0)}%</span>
              </div>
              <Progress 
                value={statusInfo.usagePercentage || 0}
                className={cn(
                  'h-2',
                  statusInfo.status === 'exhausted' && '[&>div]:bg-destructive',
                  statusInfo.status === 'warning' && '[&>div]:bg-orange-500'
                )}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Reset in</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{timeUntilReset}</span>
              </div>
            </div>

            {statusInfo.status !== 'good' && (
              <Alert variant={statusInfo.status === 'exhausted' ? 'destructive' : 'default'}>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {statusInfo.status === 'exhausted' 
                    ? `API rate limit exceeded. Please wait ${timeUntilReset} before making more requests.`
                    : `Rate limit is running low (${rateLimit.remaining} requests remaining). Consider reducing API usage.`
                  }
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Rate limit information unavailable</p>
            <p className="text-xs">Check your GitHub authentication</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RateLimitStatus;