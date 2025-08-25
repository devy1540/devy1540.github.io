import { vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';
import { useEditorStore } from '@/stores/useEditorStore';
import { useDraftStore } from '@/stores/useDraftStore';

// Mock stores
vi.mock('@/stores/useEditorStore');
vi.mock('@/stores/useDraftStore');

const mockUseEditorStore = useEditorStore as any;
const mockUseDraftStore = useDraftStore as any;

describe('useAutoSave', () => {
  const mockCreateDraft = vi.fn();
  const mockUpdateDraft = vi.fn();
  const mockSetAutoSaving = vi.fn();
  const mockSetSaved = vi.fn();
  const mockSetCurrentDraftId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    mockUseEditorStore.mockReturnValue({
      content: 'test content',
      metadata: { title: 'Test Title' },
      isDirty: true,
      currentDraftId: null,
      setAutoSaving: mockSetAutoSaving,
      setSaved: mockSetSaved,
      setCurrentDraftId: mockSetCurrentDraftId,
      isAutoSaving: false,
      lastSaved: null,
      previewMode: 'live',
      updateContent: vi.fn(),
      updateMetadata: vi.fn(),
      setPreviewMode: vi.fn(),
      reset: vi.fn(),
    });

    mockUseDraftStore.mockReturnValue({
      drafts: [],
      isLoading: false,
      error: null,
      loadDrafts: vi.fn(),
      createDraft: mockCreateDraft,
      updateDraft: mockUpdateDraft,
      deleteDraft: vi.fn(),
      clearError: vi.fn(),
    });

    mockCreateDraft.mockResolvedValue('draft-123');
    mockUpdateDraft.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a new draft when no current draft exists', async () => {
    const { result } = renderHook(() => useAutoSave(1000));

    // Wait for the hook to initialize and potentially trigger auto-save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(mockCreateDraft).toHaveBeenCalledWith({
      title: 'Test Title',
      content: 'test content',
      metadata: { title: 'Test Title' },
    });
    expect(mockSetCurrentDraftId).toHaveBeenCalledWith('draft-123');
    expect(mockSetSaved).toHaveBeenCalled();
  });

  it('should update existing draft when current draft exists', async () => {
    mockUseEditorStore.mockReturnValue({
      content: 'updated content',
      metadata: { title: 'Updated Title' },
      isDirty: true,
      currentDraftId: 'existing-draft',
      setAutoSaving: mockSetAutoSaving,
      setSaved: mockSetSaved,
      setCurrentDraftId: mockSetCurrentDraftId,
      isAutoSaving: false,
      lastSaved: null,
      previewMode: 'live',
      updateContent: vi.fn(),
      updateMetadata: vi.fn(),
      setPreviewMode: vi.fn(),
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useAutoSave(1000));

    // Wait for the hook to initialize and potentially trigger auto-save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(mockUpdateDraft).toHaveBeenCalledWith('existing-draft', {
      title: 'Updated Title',
      content: 'updated content',
      metadata: { title: 'Updated Title' },
    });
    expect(mockSetSaved).toHaveBeenCalled();
  });

  it('should not save when content is not dirty', async () => {
    mockUseEditorStore.mockReturnValue({
      content: 'test content',
      metadata: { title: 'Test Title' },
      isDirty: false,
      currentDraftId: null,
      setAutoSaving: mockSetAutoSaving,
      setSaved: mockSetSaved,
      setCurrentDraftId: mockSetCurrentDraftId,
      isAutoSaving: false,
      lastSaved: new Date(),
      previewMode: 'live',
      updateContent: vi.fn(),
      updateMetadata: vi.fn(),
      setPreviewMode: vi.fn(),
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useAutoSave(1000));

    // Wait for potential auto-save triggers but with isDirty = false
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(mockCreateDraft).not.toHaveBeenCalled();
    expect(mockUpdateDraft).not.toHaveBeenCalled();
  });

  it('should handle save errors gracefully', async () => {
    mockCreateDraft.mockRejectedValue(new Error('Save failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAutoSave(1000));

    // Wait for the hook to trigger auto-save and handle the error
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Auto-save failed:', expect.any(Error));
    expect(mockSetAutoSaving).toHaveBeenCalledWith(false);

    consoleSpy.mockRestore();
  });

  it('should provide manual save function', async () => {
    const { result } = renderHook(() => useAutoSave(1000));

    // Call the manual save function
    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockCreateDraft).toHaveBeenCalled();
    expect(mockSetSaved).toHaveBeenCalled();
  });
});