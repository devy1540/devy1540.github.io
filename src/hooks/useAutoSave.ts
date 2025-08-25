import { useEffect, useCallback, useRef } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { useToastStore } from '@/stores/useToastStore';

export const useAutoSave = (interval: number = 5000) => {
  const { 
    content, 
    metadata, 
    isDirty, 
    currentDraftId,
    setAutoSaving, 
    setSaved,
    setCurrentDraftId
  } = useEditorStore();
  
  const { createDraft, updateDraft } = useDraftStore();
  const { error: showErrorToast, success: showSuccessToast, warning: showWarningToast } = useToastStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const saveToLocalStorage = useCallback(async () => {
    if (!isDirty) return;
    
    setAutoSaving(true);
    
    try {
      let draftId = currentDraftId;
      
      // Create new draft if no current draft
      if (!draftId) {
        draftId = await createDraft({
          title: metadata.title || content.split('\n')[0].replace(/^#\s*/, '') || 'Untitled',
          content,
          metadata,
        });
        setCurrentDraftId(draftId);
      } else {
        // Update existing draft
        await updateDraft(draftId, {
          title: metadata.title || content.split('\n')[0].replace(/^#\s*/, '') || 'Untitled',
          content,
          metadata,
        });
      }
      
      setSaved();
      retryCount.current = 0; // Reset retry count on successful save
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      // Handle different types of errors
      const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
      
      if (errorMessage.includes('Storage full')) {
        showWarningToast(
          'Storage Full', 
          'Local storage is full. Old drafts have been cleaned up automatically.',
          6000
        );
      } else if (retryCount.current < maxRetries && process.env.NODE_ENV !== 'test') {
        retryCount.current++;
        showWarningToast(
          'Save Failed', 
          `Retrying auto-save... (${retryCount.current}/${maxRetries})`,
          3000
        );
        // Retry after a short delay
        setTimeout(() => saveToLocalStorage(), 2000);
        return; // Don't set autoSaving to false yet
      } else {
        showErrorToast(
          'Auto-save Failed', 
          'Failed to save draft after multiple attempts. Please save manually.',
          8000
        );
        retryCount.current = 0; // Reset retry count
      }
    } finally {
      if (retryCount.current === 0) { // Only reset if not retrying
        setAutoSaving(false);
        isFirstRender.current = false;
      }
    }
  }, [content, metadata, isDirty, currentDraftId, setAutoSaving, setSaved, setCurrentDraftId, createDraft, updateDraft, showErrorToast, showSuccessToast, showWarningToast]);

  // Set up auto-save interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(saveToLocalStorage, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveToLocalStorage, interval]);

  // Save immediately on content/metadata change after a delay (debounced)
  useEffect(() => {
    if (!isDirty || isFirstRender.current) return;
    
    const timeoutId = setTimeout(saveToLocalStorage, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [content, metadata, saveToLocalStorage]); // Remove isDirty from deps to prevent loops

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty) {
        saveToLocalStorage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, saveToLocalStorage]);

  // Manual save function
  const saveNow = useCallback(() => {
    return saveToLocalStorage();
  }, [saveToLocalStorage]);

  return { saveNow };
};