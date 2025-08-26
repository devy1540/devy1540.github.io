import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDraftRecovery } from '../useDraftRecovery';
import { useEditorStore } from '@/stores/useEditorStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { draftUtils } from '@/utils/draft';
import type { Draft } from '@/utils/draft';

// Mock stores and utilities
vi.mock('@/stores/useEditorStore');
vi.mock('@/stores/useDraftStore');
vi.mock('@/utils/draft');

const mockUseEditorStore = useEditorStore as vi.MockedFunction<
  typeof useEditorStore
>;
const mockUseDraftStore = useDraftStore as vi.MockedFunction<
  typeof useDraftStore
>;
const mockDraftUtils = draftUtils as vi.Mocked<typeof draftUtils>;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockDraft: Draft = {
  id: 'test-draft-1',
  title: 'Test Draft',
  content: '# Test Content',
  metadata: { title: 'Test Draft' },
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  isAutoSaved: true,
};

describe('useDraftRecovery', () => {
  const mockUpdateContent = vi.fn();
  const mockUpdateMetadata = vi.fn();
  const mockSetCurrentDraftId = vi.fn();
  const mockReset = vi.fn();
  const mockLoadDrafts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseEditorStore.mockReturnValue({
      updateContent: mockUpdateContent,
      updateMetadata: mockUpdateMetadata,
      setCurrentDraftId: mockSetCurrentDraftId,
      reset: mockReset,
      currentDraftId: null,
    });

    // Mock getState method
    mockUseEditorStore.getState = vi.fn().mockReturnValue({
      currentDraftId: 'test-draft-1',
    });

    // Mock subscribe method
    mockUseEditorStore.subscribe = vi.fn().mockReturnValue(() => {});

    mockUseDraftStore.mockReturnValue({
      loadDrafts: mockLoadDrafts,
    });

    mockLoadDrafts.mockResolvedValue(undefined);
    mockDraftUtils.loadDraft.mockReturnValue(mockDraft);
  });

  it('should recover recent draft on mount', async () => {
    mockLocalStorage.getItem.mockReturnValue('test-draft-1');

    renderHook(() => useDraftRecovery());

    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockLoadDrafts).toHaveBeenCalled();
      expect(mockDraftUtils.loadDraft).toHaveBeenCalledWith('test-draft-1');
      expect(mockReset).toHaveBeenCalled();
      expect(mockUpdateContent).toHaveBeenCalledWith(mockDraft.content);
      expect(mockUpdateMetadata).toHaveBeenCalledWith(mockDraft.metadata);
      expect(mockSetCurrentDraftId).toHaveBeenCalledWith(mockDraft.id);
    });
  });

  it('should not recover old draft (older than 1 hour)', async () => {
    const oldDraft = {
      ...mockDraft,
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    };

    mockLocalStorage.getItem.mockReturnValue('test-draft-1');
    mockDraftUtils.loadDraft.mockReturnValue(oldDraft);

    renderHook(() => useDraftRecovery());

    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockLoadDrafts).toHaveBeenCalled();
      expect(mockDraftUtils.loadDraft).toHaveBeenCalledWith('test-draft-1');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'lastEditedDraftId'
      );
      expect(mockReset).not.toHaveBeenCalled();
      expect(mockUpdateContent).not.toHaveBeenCalled();
    });
  });

  it('should handle case when draft no longer exists', async () => {
    mockLocalStorage.getItem.mockReturnValue('non-existent-draft');
    mockDraftUtils.loadDraft.mockReturnValue(null);

    renderHook(() => useDraftRecovery());

    await vi.waitFor(() => {
      expect(mockLoadDrafts).toHaveBeenCalled();
      expect(mockDraftUtils.loadDraft).toHaveBeenCalledWith(
        'non-existent-draft'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'lastEditedDraftId'
      );
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  it('should handle case when no last edited draft ID exists', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    renderHook(() => useDraftRecovery());

    await vi.waitFor(() => {
      expect(mockLoadDrafts).toHaveBeenCalled();
      expect(mockDraftUtils.loadDraft).not.toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  it('should track current draft ID changes', () => {
    const mockUnsubscribe = vi.fn();

    mockUseEditorStore.subscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useDraftRecovery());

    expect(mockUseEditorStore.subscribe).toHaveBeenCalled();

    // Simulate state change
    const stateCallback = mockUseEditorStore.subscribe.mock.calls[0][0];
    stateCallback({ currentDraftId: 'new-draft-id' });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'lastEditedDraftId',
      'new-draft-id'
    );

    // Test cleanup
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle recovery errors gracefully', async () => {
    mockLocalStorage.getItem.mockReturnValue('test-draft-1');
    mockLoadDrafts.mockRejectedValue(new Error('Failed to load drafts'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useDraftRecovery());

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to recover last draft:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should set lastEditedDraftId when current draft ID exists', () => {
    mockUseEditorStore.getState.mockReturnValue({
      currentDraftId: 'existing-draft-id',
    });

    renderHook(() => useDraftRecovery());

    // The effect should set the localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'lastEditedDraftId',
      'existing-draft-id'
    );
  });

  it('should not set lastEditedDraftId when current draft ID is null', () => {
    mockUseEditorStore.getState.mockReturnValue({
      currentDraftId: null,
    });

    renderHook(() => useDraftRecovery());

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('should only run recovery once on mount', async () => {
    mockLocalStorage.getItem.mockReturnValue('test-draft-1');

    const { rerender } = renderHook(() => useDraftRecovery());

    await vi.waitFor(() => {
      expect(mockLoadDrafts).toHaveBeenCalledTimes(1);
    });

    // Rerender should not trigger recovery again
    rerender();

    expect(mockLoadDrafts).toHaveBeenCalledTimes(1);
  });

  it('should log recovery success', async () => {
    mockLocalStorage.getItem.mockReturnValue('test-draft-1');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderHook(() => useDraftRecovery());

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Recovered last edited draft:',
        mockDraft.title
      );
    });

    consoleSpy.mockRestore();
  });
});
