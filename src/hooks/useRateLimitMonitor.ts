import { useEffect, useCallback, useRef } from 'react';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import { GitHubApiService } from '@/services/github-api';
import type { GitHubRateLimit } from '@/types/github';

export interface UseRateLimitMonitorOptions {
  apiService: GitHubApiService;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onRateLimitChange?: (rateLimit: GitHubRateLimit | null) => void;
  onRateLimitExceeded?: (rateLimit: GitHubRateLimit) => void;
  onRateLimitWarning?: (rateLimit: GitHubRateLimit) => void;
}

export const useRateLimitMonitor = ({
  apiService,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
  onRateLimitChange,
  onRateLimitExceeded,
  onRateLimitWarning,
}: UseRateLimitMonitorOptions) => {
  const {
    rateLimit,
    isLoadingRateLimit,
    rateLimitError,
    setRateLimit,
    setRateLimitLoading,
    setRateLimitError,
    isRateLimitCacheValid,
  } = useRepositoryStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousRateLimitRef = useRef<GitHubRateLimit | null>(null);

  const fetchRateLimit = useCallback(async (force = false) => {
    if (!force && isRateLimitCacheValid()) {
      return rateLimit;
    }

    setRateLimitLoading(true);
    setRateLimitError(null);

    try {
      const rateLimitInfo = await apiService.getRateLimitInfo();
      setRateLimit(rateLimitInfo);

      // Trigger callbacks if rate limit changed
      if (rateLimitInfo && onRateLimitChange) {
        onRateLimitChange(rateLimitInfo);
      }

      // Check for rate limit conditions
      if (rateLimitInfo) {
        const previousRateLimit = previousRateLimitRef.current;
        
        // Rate limit exceeded
        if (rateLimitInfo.remaining === 0 && onRateLimitExceeded) {
          onRateLimitExceeded(rateLimitInfo);
        }
        
        // Rate limit warning (less than 100 remaining, or dropped significantly)
        else if (rateLimitInfo.remaining <= 100) {
          if (onRateLimitWarning) {
            onRateLimitWarning(rateLimitInfo);
          }
        }
        
        // Significant drop in rate limit (more than 50 requests used since last check)
        else if (
          previousRateLimit && 
          (previousRateLimit.remaining - rateLimitInfo.remaining) > 50 &&
          onRateLimitWarning
        ) {
          onRateLimitWarning(rateLimitInfo);
        }

        previousRateLimitRef.current = rateLimitInfo;
      }

      return rateLimitInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rate limit';
      setRateLimitError(errorMessage);
      console.error('Failed to fetch rate limit:', error);
      return null;
    }
  }, [
    apiService,
    isRateLimitCacheValid,
    rateLimit,
    setRateLimit,
    setRateLimitLoading,
    setRateLimitError,
    onRateLimitChange,
    onRateLimitExceeded,
    onRateLimitWarning,
  ]);

  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchRateLimit();
      }, refreshInterval);
    }
  }, [autoRefresh, refreshInterval, fetchRateLimit]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshRateLimit = useCallback(() => {
    return fetchRateLimit(true);
  }, [fetchRateLimit]);

  // Initialize monitoring
  useEffect(() => {
    // Fetch initial rate limit if not cached
    if (!isRateLimitCacheValid()) {
      fetchRateLimit();
    }

    // Start monitoring
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, [fetchRateLimit, startMonitoring, stopMonitoring, isRateLimitCacheValid]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    rateLimit,
    isLoading: isLoadingRateLimit,
    error: rateLimitError,
    refresh: refreshRateLimit,
    startMonitoring,
    stopMonitoring,
    isMonitoring: intervalRef.current !== null,
  };
};

export default useRateLimitMonitor;