import type { Post } from '@/types';

export interface Draft {
  id: string;
  title: string;
  content: string;
  metadata: Partial<Post>;
  createdAt: Date;
  updatedAt: Date;
  isAutoSaved: boolean;
}

const DRAFT_STORAGE_PREFIX = 'drafts:';
const DRAFT_LIST_KEY = 'draft-list';

export const draftUtils = {
  // Generate unique draft ID
  generateId(): string {
    return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get all draft IDs from storage
  getDraftIds(): string[] {
    try {
      const ids = localStorage.getItem(DRAFT_LIST_KEY);
      return ids ? JSON.parse(ids) : [];
    } catch (error) {
      console.error('Failed to get draft IDs:', error);
      return [];
    }
  },

  // Save draft IDs to storage
  saveDraftIds(ids: string[]): void {
    try {
      localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Failed to save draft IDs:', error);
      throw new Error('Failed to save draft list');
    }
  },

  // Load single draft from storage
  loadDraft(id: string): Draft | null {
    try {
      const draftData = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${id}`);
      if (!draftData) return null;
      
      const draft = JSON.parse(draftData);
      // Convert date strings back to Date objects
      draft.createdAt = new Date(draft.createdAt);
      draft.updatedAt = new Date(draft.updatedAt);
      
      return draft;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  },

  // Save single draft to storage
  saveDraft(draft: Draft): void {
    try {
      localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${draft.id}`, JSON.stringify(draft));
      
      // Update draft list
      const ids = this.getDraftIds();
      if (!ids.includes(draft.id)) {
        ids.push(draft.id);
        this.saveDraftIds(ids);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  },

  // Delete single draft from storage
  deleteDraft(id: string): void {
    try {
      localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${id}`);
      
      // Update draft list
      const ids = this.getDraftIds();
      const updatedIds = ids.filter(draftId => draftId !== id);
      this.saveDraftIds(updatedIds);
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw new Error('Failed to delete draft');
    }
  },

  // Load all drafts from storage
  loadAllDrafts(): Draft[] {
    const ids = this.getDraftIds();
    const drafts: Draft[] = [];
    
    for (const id of ids) {
      const draft = this.loadDraft(id);
      if (draft) {
        drafts.push(draft);
      }
    }
    
    // Sort by updatedAt (most recent first)
    return drafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  // Check storage quota and clean if necessary
  checkAndCleanStorage(): void {
    try {
      // Test storage availability
      const testKey = 'storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      // Storage is full, clean old drafts
      this.cleanOldDrafts(20);
    }
  },


  // Get storage usage info
  getStorageInfo(): { used: number; available: number; total: number } {
    let used = 0;
    try {
      for (const key in localStorage) {
        if (key.startsWith(DRAFT_STORAGE_PREFIX) || key === DRAFT_LIST_KEY) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }

    // Estimate total storage (usually 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB estimate
    const available = total - used;

    return { used, available, total };
  },

  // Get storage usage percentage
  getStorageUsagePercentage(): number {
    const info = this.getStorageInfo();
    return (info.used / info.total) * 100;
  },

  // Ensure storage space is available, clean if necessary
  ensureStorageSpace(): boolean {
    const usagePercentage = this.getStorageUsagePercentage();
    
    // If using more than 80% of storage, clean up old drafts
    if (usagePercentage > 80) {
      this.cleanOldDrafts(15); // Keep only 15 most recent drafts
      return this.getStorageUsagePercentage() < 90; // Check if we freed enough space
    }
    
    // If using more than 90%, be more aggressive
    if (usagePercentage > 90) {
      this.cleanOldDrafts(10); // Keep only 10 most recent drafts
      return this.getStorageUsagePercentage() < 95;
    }
    
    return true;
  },

  // Enhanced clean old drafts with configurable keep count
  cleanOldDrafts(keepCount: number = 20): void {
    try {
      const allDrafts = this.loadAllDrafts().sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      if (allDrafts.length > keepCount) {
        const draftsToDelete = allDrafts.slice(keepCount);
        console.log(`Cleaning up ${draftsToDelete.length} old drafts to free space`);
        
        for (const draft of draftsToDelete) {
          this.deleteDraft(draft.id);
        }
      }
    } catch (error) {
      console.error('Failed to clean old drafts:', error);
    }
  }
};