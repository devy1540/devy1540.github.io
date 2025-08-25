import { vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDraftStore } from '../useDraftStore';
import { draftUtils } from '@/utils/draft';
import type { Draft } from '@/utils/draft';

// Mock the draft utils
vi.mock('@/utils/draft');
const mockDraftUtils = draftUtils as any;

const mockDraft: Draft = {
  id: 'test-draft-1',
  title: 'Test Draft',
  content: '# Test Content',
  metadata: { title: 'Test Draft' },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  isAutoSaved: true,
};

describe('useDraftStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDraftUtils.loadAllDrafts.mockReturnValue([mockDraft]);
    mockDraftUtils.generateId.mockReturnValue('new-draft-id');
    mockDraftUtils.saveDraft.mockImplementation(() => {});
    mockDraftUtils.deleteDraft.mockImplementation(() => {});
    mockDraftUtils.loadDraft.mockReturnValue(mockDraft);
    mockDraftUtils.checkAndCleanStorage.mockImplementation(() => {});
    mockDraftUtils.ensureStorageSpace.mockReturnValue(true);
  });

  it('should load drafts successfully', async () => {
    const { result } = renderHook(() => useDraftStore());

    await act(async () => {
      await result.current.loadDrafts();
    });

    expect(result.current.drafts).toEqual([mockDraft]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockDraftUtils.loadAllDrafts).toHaveBeenCalled();
  });

  it('should handle load error', async () => {
    mockDraftUtils.loadAllDrafts.mockImplementation(() => {
      throw new Error('Failed to load');
    });

    const { result } = renderHook(() => useDraftStore());

    await act(async () => {
      await result.current.loadDrafts();
    });

    expect(result.current.error).toBe('Failed to load');
    expect(result.current.isLoading).toBe(false);
  });

  it('should create a new draft', async () => {
    const { result } = renderHook(() => useDraftStore());

    // Initialize with empty drafts
    act(() => {
      result.current.loadDrafts();
    });

    let draftId: string = '';
    await act(async () => {
      draftId = await result.current.createDraft({
        title: 'New Draft',
        content: '# New Content',
        metadata: { title: 'New Draft' },
      });
    });

    expect(draftId).toBe('new-draft-id');
    expect(mockDraftUtils.generateId).toHaveBeenCalled();
    expect(mockDraftUtils.saveDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'new-draft-id',
        title: 'New Draft',
        content: '# New Content',
        isAutoSaved: true,
      })
    );
    expect(mockDraftUtils.ensureStorageSpace).toHaveBeenCalled();
  });

  it('should update existing draft', async () => {
    const { result } = renderHook(() => useDraftStore());

    // Set initial state with mock draft
    act(() => {
      result.current.loadDrafts();
    });

    await act(async () => {
      await result.current.updateDraft('test-draft-1', {
        title: 'Updated Title',
        content: 'Updated content',
      });
    });

    expect(mockDraftUtils.loadDraft).toHaveBeenCalledWith('test-draft-1');
    expect(mockDraftUtils.saveDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-draft-1',
        title: 'Updated Title',
        content: 'Updated content',
        isAutoSaved: true,
      })
    );
  });

  it('should handle update error when draft not found', async () => {
    mockDraftUtils.loadDraft.mockReturnValue(null);
    
    const { result } = renderHook(() => useDraftStore());

    await act(async () => {
      try {
        await result.current.updateDraft('non-existent', {
          title: 'Updated',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Draft not found');
      }
    });

    expect(result.current.error).toBe('Draft not found');
  });

  it('should delete draft', async () => {
    const { result } = renderHook(() => useDraftStore());

    // Initialize with drafts
    act(() => {
      result.current.loadDrafts();
    });

    await act(async () => {
      await result.current.deleteDraft('test-draft-1');
    });

    expect(mockDraftUtils.deleteDraft).toHaveBeenCalledWith('test-draft-1');
    expect(result.current.drafts).toEqual([]);
  });

  it('should handle delete error', async () => {
    mockDraftUtils.deleteDraft.mockImplementation(() => {
      throw new Error('Delete failed');
    });

    const { result } = renderHook(() => useDraftStore());

    await act(async () => {
      try {
        await result.current.deleteDraft('test-draft-1');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    expect(result.current.error).toBe('Delete failed');
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useDraftStore());

    // Set an error first
    act(() => {
      result.current.loadDrafts();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});