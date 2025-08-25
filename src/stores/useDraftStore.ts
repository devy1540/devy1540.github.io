import { create } from 'zustand';
import { draftUtils, type Draft } from '@/utils/draft';
import type { Post } from '@/types';

interface DraftState {
  drafts: Draft[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadDrafts: () => Promise<void>;
  createDraft: (data: { title: string; content: string; metadata: Partial<Post> }) => Promise<string>;
  updateDraft: (id: string, updates: Partial<Pick<Draft, 'title' | 'content' | 'metadata'>>) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  drafts: [],
  isLoading: false,
  error: null,

  loadDrafts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const drafts = draftUtils.loadAllDrafts();
      set({ drafts, isLoading: false });
    } catch (error) {
      console.error('Failed to load drafts:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load drafts', 
        isLoading: false 
      });
    }
  },

  createDraft: async (data) => {
    set({ error: null });
    
    try {
      // Ensure storage space is available
      if (!draftUtils.ensureStorageSpace()) {
        throw new Error('Storage full - unable to create new draft. Please delete some old drafts.');
      }
      
      const now = new Date();
      const draft: Draft = {
        id: draftUtils.generateId(),
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        createdAt: now,
        updatedAt: now,
        isAutoSaved: true,
      };
      
      draftUtils.saveDraft(draft);
      
      // Update store state
      const currentDrafts = get().drafts;
      const updatedDrafts = [draft, ...currentDrafts].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
      
      set({ drafts: updatedDrafts });
      
      return draft.id;
    } catch (error) {
      console.error('Failed to create draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create draft';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateDraft: async (id, updates) => {
    set({ error: null });
    
    try {
      const existingDraft = draftUtils.loadDraft(id);
      if (!existingDraft) {
        throw new Error('Draft not found');
      }
      
      const updatedDraft: Draft = {
        ...existingDraft,
        ...updates,
        updatedAt: new Date(),
        isAutoSaved: true,
      };
      
      draftUtils.saveDraft(updatedDraft);
      
      // Update store state
      const currentDrafts = get().drafts;
      const updatedDrafts = currentDrafts
        .map(draft => draft.id === id ? updatedDraft : draft)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      set({ drafts: updatedDrafts });
    } catch (error) {
      console.error('Failed to update draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update draft';
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteDraft: async (id) => {
    set({ error: null });
    
    try {
      draftUtils.deleteDraft(id);
      
      // Update store state
      const currentDrafts = get().drafts;
      const updatedDrafts = currentDrafts.filter(draft => draft.id !== id);
      
      set({ drafts: updatedDrafts });
    } catch (error) {
      console.error('Failed to delete draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete draft';
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));