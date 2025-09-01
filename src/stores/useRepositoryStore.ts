import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  GitHubRepository, 
  GitHubRateLimit
} from '@/types/github';
import type { ContentFile, ContentDirectory, BlogPost } from '@/services/github-content';

export interface RepositoryState {
  // Current repository
  currentRepository: GitHubRepository | null;
  
  // Rate limit info
  rateLimit: GitHubRateLimit | null;
  rateLimitLastFetch: number | null;
  
  // Content cache
  contentCache: Map<string, ContentFile>;
  directoryCache: Map<string, ContentDirectory>;
  blogPosts: BlogPost[];
  
  // Loading states
  isLoadingRateLimit: boolean;
  isLoadingContent: boolean;
  isLoadingPosts: boolean;
  
  // Error states
  rateLimitError: string | null;
  contentError: string | null;
  
  // Offline state
  isOffline: boolean;
  lastSyncTime: Date | null;
}

export interface RepositoryActions {
  // Repository management
  setCurrentRepository: (repo: GitHubRepository | null) => void;
  
  // Rate limit management
  setRateLimit: (rateLimit: GitHubRateLimit | null) => void;
  setRateLimitLoading: (loading: boolean) => void;
  setRateLimitError: (error: string | null) => void;
  isRateLimitCacheValid: () => boolean;
  
  // Content management
  setContentFile: (path: string, file: ContentFile) => void;
  getContentFile: (path: string) => ContentFile | null;
  setDirectoryListing: (path: string, directory: ContentDirectory) => void;
  getDirectoryListing: (path: string) => ContentDirectory | null;
  setBlogPosts: (posts: BlogPost[]) => void;
  setContentLoading: (loading: boolean) => void;
  setContentError: (error: string | null) => void;
  setPostsLoading: (loading: boolean) => void;
  
  // Cache management
  clearContentCache: () => void;
  clearAllCaches: () => void;
  
  // Offline management
  setOfflineStatus: (isOffline: boolean) => void;
  updateSyncTime: () => void;
  
  // Utility actions
  reset: () => void;
}

const RATE_LIMIT_CACHE_DURATION = 60 * 1000; // 1 minute

const initialState: RepositoryState = {
  currentRepository: null,
  rateLimit: null,
  rateLimitLastFetch: null,
  contentCache: new Map(),
  directoryCache: new Map(),
  blogPosts: [],
  isLoadingRateLimit: false,
  isLoadingContent: false,
  isLoadingPosts: false,
  rateLimitError: null,
  contentError: null,
  isOffline: false,
  lastSyncTime: null,
};

export const useRepositoryStore = create<RepositoryState & RepositoryActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Repository management
      setCurrentRepository: (repo) => {
        set({ 
          currentRepository: repo,
          // Clear caches when switching repositories
          contentCache: new Map(),
          directoryCache: new Map(),
          blogPosts: [],
          contentError: null,
        });
      },

      // Rate limit management
      setRateLimit: (rateLimit) => {
        set({ 
          rateLimit, 
          rateLimitLastFetch: Date.now(),
          rateLimitError: null,
        });
      },

      setRateLimitLoading: (loading) => {
        set({ isLoadingRateLimit: loading });
      },

      setRateLimitError: (error) => {
        set({ rateLimitError: error, isLoadingRateLimit: false });
      },

      isRateLimitCacheValid: () => {
        const state = get();
        if (!state.rateLimit || !state.rateLimitLastFetch) {
          return false;
        }
        return (Date.now() - state.rateLimitLastFetch) < RATE_LIMIT_CACHE_DURATION;
      },

      // Content management
      setContentFile: (path, file) => {
        set((state) => {
          const newCache = new Map(state.contentCache);
          newCache.set(path, file);
          return { contentCache: newCache };
        });
      },

      getContentFile: (path) => {
        return get().contentCache.get(path) || null;
      },

      setDirectoryListing: (path, directory) => {
        set((state) => {
          const newCache = new Map(state.directoryCache);
          newCache.set(path, directory);
          return { directoryCache: newCache };
        });
      },

      getDirectoryListing: (path) => {
        return get().directoryCache.get(path) || null;
      },

      setBlogPosts: (posts) => {
        set({ blogPosts: posts, isLoadingPosts: false });
      },

      setContentLoading: (loading) => {
        set({ isLoadingContent: loading });
      },

      setContentError: (error) => {
        set({ contentError: error, isLoadingContent: false });
      },

      setPostsLoading: (loading) => {
        set({ isLoadingPosts: loading });
      },

      // Cache management
      clearContentCache: () => {
        set({ 
          contentCache: new Map(),
          directoryCache: new Map(),
          blogPosts: [],
        });
      },

      clearAllCaches: () => {
        set({
          contentCache: new Map(),
          directoryCache: new Map(),
          blogPosts: [],
          rateLimit: null,
          rateLimitLastFetch: null,
        });
      },

      // Offline management
      setOfflineStatus: (isOffline) => {
        set({ isOffline });
      },

      updateSyncTime: () => {
        set({ lastSyncTime: new Date() });
      },

      // Utility actions
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'repository-store',
      partialize: (state) => ({
        // Only persist certain fields
        currentRepository: state.currentRepository,
        rateLimit: state.rateLimit,
        rateLimitLastFetch: state.rateLimitLastFetch,
        contentCache: Array.from(state.contentCache.entries()) as [string, ContentFile][],
        directoryCache: Array.from(state.directoryCache.entries()) as [string, ContentDirectory][],
        blogPosts: state.blogPosts,
        lastSyncTime: state.lastSyncTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore Map instances from serialized arrays
          state.contentCache = new Map(state.contentCache as [string, ContentFile][]);
          state.directoryCache = new Map(state.directoryCache as [string, ContentDirectory][]);
        }
      },
    }
  )
);

// Selectors for better performance
export const useCurrentRepository = () => 
  useRepositoryStore((state) => state.currentRepository);

export const useRateLimit = () => 
  useRepositoryStore((state) => ({
    rateLimit: state.rateLimit,
    isLoading: state.isLoadingRateLimit,
    error: state.rateLimitError,
    isValid: state.isRateLimitCacheValid(),
  }));

export const useBlogPosts = () =>
  useRepositoryStore((state) => ({
    posts: state.blogPosts,
    isLoading: state.isLoadingPosts,
    error: state.contentError,
  }));

export const useOfflineStatus = () =>
  useRepositoryStore((state) => ({
    isOffline: state.isOffline,
    lastSyncTime: state.lastSyncTime,
  }));