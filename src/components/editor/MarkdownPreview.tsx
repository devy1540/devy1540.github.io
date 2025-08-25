import { FC, useMemo, memo, useCallback } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { MarkdownRenderer } from '@/components/post/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  className?: string;
}

export const MarkdownPreview: FC<MarkdownPreviewProps> = memo(({ className }) => {
  const { content } = useEditorStore();
  const { getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();

  // Memoize the preview content to avoid unnecessary re-renders
  const previewContent = useMemo(() => {
    if (!content.trim()) {
      return {
        content: '*Nothing to preview yet...*',
        isEmpty: true
      };
    }
    
    return {
      content,
      isEmpty: false
    };
  }, [content]);

  // Memoize the class names to avoid recalculation
  const containerClasses = useMemo(() => cn(
    "relative w-full h-full overflow-auto",
    "bg-background text-foreground",
    "border border-border rounded-md",
    "prose dark:prose-invert prose-sm max-w-none",
    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground",
    effectiveTheme === 'dark' && "dark",
    className
  ), [effectiveTheme, className]);

  // Optimize empty state rendering
  const renderEmptyState = useCallback(() => (
    <div className="text-muted-foreground italic text-center py-8">
      {previewContent.content}
    </div>
  ), [previewContent.content]);

  // Optimize content rendering
  const renderContent = useCallback(() => (
    <MarkdownRenderer content={previewContent.content} />
  ), [previewContent.content]);

  return (
    <div 
      className={containerClasses}
      data-color-mode={effectiveTheme}
      data-testid="markdown-preview"
    >
      <div className="p-4">
        {previewContent.isEmpty ? renderEmptyState() : renderContent()}
      </div>
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';