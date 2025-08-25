import { useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { draftUtils } from '@/utils/draft';

export const useDraftRecovery = () => {
  const { updateContent, updateMetadata, setCurrentDraftId, reset } = useEditorStore();
  const { loadDrafts } = useDraftStore();

  useEffect(() => {
    const recoverLastDraft = async () => {
      try {
        // Load all drafts first
        await loadDrafts();
        
        // Try to recover the last edited draft
        const lastDraftId = localStorage.getItem('lastEditedDraftId');
        if (lastDraftId) {
          const draft = draftUtils.loadDraft(lastDraftId);
          if (draft) {
            // Check if this draft was recently edited (within the last hour)
            const timeDiff = Date.now() - draft.updatedAt.getTime();
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
            
            if (timeDiff < oneHour) {
              // Reset editor state first
              reset();
              
              // Load draft content
              updateContent(draft.content);
              updateMetadata(draft.metadata);
              setCurrentDraftId(draft.id);
              
              console.log('Recovered last edited draft:', draft.title);
            } else {
              // Clean up old lastEditedDraftId
              localStorage.removeItem('lastEditedDraftId');
            }
          } else {
            // Draft no longer exists, clean up reference
            localStorage.removeItem('lastEditedDraftId');
          }
        }
      } catch (error) {
        console.error('Failed to recover last draft:', error);
      }
    };

    // Only run recovery on initial load
    recoverLastDraft();
  }, []); // Empty dependency array - only run once on mount

  // Track the current draft ID for future recovery
  useEffect(() => {
    const { currentDraftId } = useEditorStore.getState();
    
    if (currentDraftId) {
      localStorage.setItem('lastEditedDraftId', currentDraftId);
    }
  }, []); // We'll track this differently to avoid infinite loops

  // Subscribe to currentDraftId changes
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe((state) => {
      if (state.currentDraftId) {
        localStorage.setItem('lastEditedDraftId', state.currentDraftId);
      }
    });

    return unsubscribe;
  }, []);
};