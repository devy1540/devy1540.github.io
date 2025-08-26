import { FC, useMemo } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SaveStatus: FC = () => {
  const { isAutoSaving, lastSaved, isDirty } = useEditorStore();

  const statusInfo = useMemo(() => {
    if (isAutoSaving) {
      return {
        icon: Loader2,
        text: '저장 중...',
        tooltip: '현재 자동 저장이 진행 중입니다.',
        className: 'text-blue-600 dark:text-blue-400',
        iconClassName: 'animate-spin',
      };
    }

    if (lastSaved) {
      const timeAgo = new Date().getTime() - lastSaved.getTime();
      const minutes = Math.floor(timeAgo / 60000);

      let timeText = '';
      let tooltipText = '';

      if (minutes < 1) {
        timeText = '방금 저장됨';
        tooltipText = '모든 변경사항이 저장되었습니다.';
      } else if (minutes < 60) {
        timeText = `${minutes}분 전 저장됨`;
        tooltipText = `마지막 저장: ${lastSaved.toLocaleTimeString()}`;
      } else {
        try {
          const relativeTime = formatDistanceToNow(lastSaved, {
            addSuffix: true,
            locale: ko,
          });
          // Ensure consistent formatting by removing "전" and adding "저장됨"
          timeText = relativeTime.replace(' 전', '') + ' 저장됨';
          tooltipText = `마지막 저장: ${lastSaved.toLocaleString()}`;
        } catch {
          timeText = lastSaved.toLocaleTimeString() + ' 저장됨';
          tooltipText = `마지막 저장: ${lastSaved.toLocaleString()}`;
        }
      }

      if (isDirty) {
        tooltipText += ' (저장되지 않은 변경사항 있음)';
      }

      return {
        icon: isDirty ? Clock : CheckCircle,
        text: timeText,
        tooltip: tooltipText,
        className: isDirty
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-green-600 dark:text-green-400',
        iconClassName: '',
      };
    }

    return {
      icon: AlertCircle,
      text: '저장되지 않음',
      tooltip:
        '아직 저장되지 않았습니다. Cmd+S를 누르거나 잠시 기다리면 자동 저장됩니다.',
      className: 'text-red-600 dark:text-red-400',
      iconClassName: '',
    };
  }, [isAutoSaving, lastSaved, isDirty]);

  const Icon = statusInfo.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 text-sm ${statusInfo.className} cursor-help`}
          >
            <Icon className={`h-4 w-4 ${statusInfo.iconClassName}`} />
            <span className="font-medium">{statusInfo.text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
