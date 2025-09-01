import { useEffect, useCallback } from 'react';
import { useRepositoryStore } from '@/stores/useRepositoryStore';

export interface UseOfflineDetectionOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  pingUrl?: string;
  pingInterval?: number; // in milliseconds
}

export const useOfflineDetection = ({
  onOnline,
  onOffline,
  pingUrl = 'https://api.github.com/zen',
  pingInterval = 30000, // 30 seconds
}: UseOfflineDetectionOptions = {}) => {
  const { 
    isOffline, 
    setOfflineStatus, 
    updateSyncTime
  } = useRepositoryStore();

  const checkOnlineStatus = useCallback(async () => {
    try {
      await fetch(pingUrl, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      
      // If we can reach the URL, we're online
      const isOnline = true;
      
      if (isOffline && isOnline) {
        // Coming back online
        setOfflineStatus(false);
        updateSyncTime();
        if (onOnline) {
          onOnline();
        }
      }
      
      return isOnline;
    } catch {
      // Network error indicates we're offline
      if (!isOffline) {
        // Going offline
        setOfflineStatus(true);
        if (onOffline) {
          onOffline();
        }
      }
      
      return false;
    }
  }, [isOffline, setOfflineStatus, updateSyncTime, onOnline, onOffline, pingUrl]);

  const handleOnline = useCallback(() => {
    if (isOffline) {
      setOfflineStatus(false);
      updateSyncTime();
      if (onOnline) {
        onOnline();
      }
    }
  }, [isOffline, setOfflineStatus, updateSyncTime, onOnline]);

  const handleOffline = useCallback(() => {
    if (!isOffline) {
      setOfflineStatus(true);
      if (onOffline) {
        onOffline();
      }
    }
  }, [isOffline, setOfflineStatus, onOffline]);

  useEffect(() => {
    // Check initial status
    checkOnlineStatus();

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic connectivity checks
    const intervalId = setInterval(checkOnlineStatus, pingInterval);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [handleOnline, handleOffline, checkOnlineStatus, pingInterval]);

  const forceOffline = useCallback(() => {
    setOfflineStatus(true);
    if (onOffline) {
      onOffline();
    }
  }, [setOfflineStatus, onOffline]);

  const forceOnline = useCallback(() => {
    setOfflineStatus(false);
    updateSyncTime();
    if (onOnline) {
      onOnline();
    }
  }, [setOfflineStatus, updateSyncTime, onOnline]);

  const syncWhenOnline = useCallback(async (syncFn: () => Promise<void>) => {
    if (isOffline) {
      console.warn('Cannot sync while offline. Will retry when connection is restored.');
      return false;
    }

    try {
      await syncFn();
      updateSyncTime();
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Check if failure was due to network issues
      const isOnline = await checkOnlineStatus();
      if (!isOnline) {
        console.warn('Sync failed due to network issues. Marked as offline.');
      }
      
      throw error;
    }
  }, [isOffline, updateSyncTime, checkOnlineStatus]);

  return {
    isOffline,
    checkOnlineStatus,
    forceOffline,
    forceOnline,
    syncWhenOnline,
  };
};

export default useOfflineDetection;