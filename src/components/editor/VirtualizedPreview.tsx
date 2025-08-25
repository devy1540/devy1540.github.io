import { FC, useMemo, memo, useCallback, useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { MarkdownRenderer } from '@/components/post/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface VirtualizedPreviewProps {
  className?: string;
  threshold?: number; // Character count threshold to enable virtualization
}

// Simple virtualization for very long content (10,000+ characters)
export const VirtualizedPreview: FC<VirtualizedPreviewProps> = memo(({ 
  className,
  threshold = 10000
}) => {
  const { content } = useEditorStore();
  const { getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 1000 });
  const [isVirtualized, setIsVirtualized] = useState(false);

  // Check if content is long enough to require virtualization
  useEffect(() => {
    setIsVirtualized(content.length > threshold);
  }, [content.length, threshold]);

  // Simple viewport tracking for virtualization
  const handleScroll = useCallback(() => {
    if (!isVirtualized || !containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Estimate character position based on scroll position
    // This is a simplified approach - more sophisticated solutions would track actual line heights
    const estimatedCharsPerPixel = content.length / container.scrollHeight;
    const startChar = Math.max(0, Math.floor(scrollTop * estimatedCharsPerPixel) - 500);
    const endChar = Math.min(content.length, Math.floor((scrollTop + containerHeight) * estimatedCharsPerPixel) + 500);
    
    setVisibleRange({ start: startChar, end: endChar });
  }, [content.length, isVirtualized]);

  // Throttled scroll handler
  const throttledScrollHandler = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16); // ~60fps
    };
  }, [handleScroll]);

  // Prepare content for rendering
  const renderContent = useMemo(() => {
    if (!content.trim()) {
      return {
        content: '*Nothing to preview yet...*',
        isEmpty: true
      };
    }

    if (isVirtualized) {
      // For very long content, show only visible portion
      const visibleContent = content.substring(visibleRange.start, visibleRange.end);
      return {
        content: visibleContent || content.substring(0, 1000),
        isEmpty: false,
        isVirtualized: true
      };
    }

    return {
      content,
      isEmpty: false,
      isVirtualized: false
    };
  }, [content, isVirtualized, visibleRange]);

  // Memoized container classes
  const containerClasses = useMemo(() => cn(
    "relative w-full h-full overflow-auto",
    "bg-background text-foreground", 
    "border border-border rounded-md",
    "prose dark:prose-invert prose-sm max-w-none",
    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground",
    effectiveTheme === 'dark' && "dark",
    className
  ), [effectiveTheme, className]);

  // Empty state component
  const EmptyState = useCallback(() => (
    <div className="text-muted-foreground italic text-center py-8">
      {renderContent.content}
    </div>
  ), [renderContent.content]);

  // Performance indicator for development
  const PerformanceIndicator = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-75">
        {isVirtualized ? `Virtual: ${visibleRange.start}-${visibleRange.end}` : `Full: ${content.length}`}
      </div>
    );
  }, [isVirtualized, visibleRange, content.length]);

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      onScroll={throttledScrollHandler}
      data-color-mode={effectiveTheme}
      data-testid="virtualized-preview"
    >
      {PerformanceIndicator}
      <div className="p-4">
        {renderContent.isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {isVirtualized && (
              <div className="mb-2 text-xs text-muted-foreground border-b pb-2">
                Performance Mode: Showing visible content ({visibleRange.start}-{visibleRange.end} of {content.length} chars)
              </div>
            )}
            <MarkdownRenderer content={renderContent.content} />
          </>
        )}
      </div>
    </div>
  );
});

VirtualizedPreview.displayName = 'VirtualizedPreview';