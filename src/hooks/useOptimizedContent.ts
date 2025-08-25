import { useMemo, useRef, useCallback } from 'react';

interface OptimizedContentOptions {
  debounceMs?: number;
  chunkSize?: number;
  maxLength?: number;
}

/**
 * Custom hook for optimizing large content handling
 * Provides debouncing, chunking, and memory optimization
 */
export const useOptimizedContent = (
  content: string, 
  options: OptimizedContentOptions = {}
) => {
  const { 
    debounceMs = 100, 
    chunkSize = 5000,
    maxLength = 50000
  } = options;

  const lastProcessedRef = useRef<string>('');
  const processingRef = useRef<boolean>(false);

  // Memoize content analysis
  const contentMetrics = useMemo(() => {
    const length = content.length;
    const lines = content.split('\n').length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    
    return {
      length,
      lines,
      words,
      isLarge: length > maxLength,
      needsChunking: length > chunkSize,
      estimatedRenderTime: Math.ceil(length / 1000) // rough estimate in ms
    };
  }, [content, maxLength, chunkSize]);

  // Chunk content for processing
  const contentChunks = useMemo(() => {
    if (!contentMetrics.needsChunking) {
      return [content];
    }

    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.substring(i, i + chunkSize));
    }
    return chunks;
  }, [content, contentMetrics.needsChunking, chunkSize]);

  // Optimized content processing
  const processContent = useCallback((rawContent: string) => {
    if (processingRef.current) return rawContent;
    
    processingRef.current = true;
    
    try {
      // For very large content, limit processing
      if (rawContent.length > maxLength) {
        console.warn(`Content exceeds recommended length (${rawContent.length} > ${maxLength})`);
        return rawContent.substring(0, maxLength) + '\n\n...(content truncated for performance)';
      }

      lastProcessedRef.current = rawContent;
      return rawContent;
    } finally {
      processingRef.current = false;
    }
  }, [maxLength]);

  // Memory-efficient content getter
  const getOptimizedContent = useCallback(() => {
    return processContent(content);
  }, [content, processContent]);

  // Performance recommendations
  const performanceRecommendations = useMemo(() => {
    const recommendations: string[] = [];
    
    if (contentMetrics.isLarge) {
      recommendations.push('Consider enabling virtualization for better performance');
    }
    
    if (contentMetrics.lines > 1000) {
      recommendations.push('Large number of lines detected - consider lazy loading');
    }
    
    if (contentMetrics.estimatedRenderTime > 100) {
      recommendations.push('Consider debouncing content updates');
    }

    return recommendations;
  }, [contentMetrics]);

  return {
    content: getOptimizedContent(),
    chunks: contentChunks,
    metrics: contentMetrics,
    recommendations: performanceRecommendations,
    isProcessing: processingRef.current,
  };
};

/**
 * Hook for optimizing editor state updates
 */
export const useOptimizedEditor = (
  content: string,
  updateContent: (content: string) => void,
  debounceMs: number = 100
) => {
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<string>(content);

  const debouncedUpdate = useCallback((newContent: string) => {
    // Skip identical updates
    if (newContent === lastUpdateRef.current) {
      return;
    }

    clearTimeout(updateTimeoutRef.current);
    
    updateTimeoutRef.current = setTimeout(() => {
      updateContent(newContent);
      lastUpdateRef.current = newContent;
    }, debounceMs);
  }, [updateContent, debounceMs]);

  const immediateUpdate = useCallback((newContent: string) => {
    clearTimeout(updateTimeoutRef.current);
    updateContent(newContent);
    lastUpdateRef.current = newContent;
  }, [updateContent]);

  return {
    debouncedUpdate,
    immediateUpdate,
  };
};