import { vi } from 'vitest';
import { draftUtils, type Draft } from '../draft';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
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
  updatedAt: new Date('2024-01-01T11:00:00Z'),
  isAutoSaved: true,
};

describe('draftUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate unique draft IDs', () => {
      const id1 = draftUtils.generateId();
      const id2 = draftUtils.generateId();

      expect(id1).toMatch(/^draft-\d+-\w+$/);
      expect(id2).toMatch(/^draft-\d+-\w+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('getDraftIds', () => {
    it('should return empty array when no drafts exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const ids = draftUtils.getDraftIds();
      
      expect(ids).toEqual([]);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('draft-list');
    });

    it('should return parsed draft IDs', () => {
      const mockIds = ['draft-1', 'draft-2'];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockIds));
      
      const ids = draftUtils.getDraftIds();
      
      expect(ids).toEqual(mockIds);
    });

    it('should handle JSON parse errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const ids = draftUtils.getDraftIds();
      
      expect(ids).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveDraftIds', () => {
    it('should save draft IDs to localStorage', () => {
      const ids = ['draft-1', 'draft-2'];
      
      draftUtils.saveDraftIds(ids);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'draft-list',
        JSON.stringify(ids)
      );
    });

    it('should handle storage errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => draftUtils.saveDraftIds(['draft-1'])).toThrow('Failed to save draft list');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('loadDraft', () => {
    it('should load and parse draft from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockDraft));
      
      const draft = draftUtils.loadDraft('test-draft-1');
      
      expect(draft).toEqual({
        ...mockDraft,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('drafts:test-draft-1');
    });

    it('should return null when draft not found', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const draft = draftUtils.loadDraft('non-existent');
      
      expect(draft).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const draft = draftUtils.loadDraft('invalid');
      
      expect(draft).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveDraft', () => {
    it('should save draft to localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
      mockLocalStorage.setItem.mockImplementation(() => {}); // Reset mock
      
      draftUtils.saveDraft(mockDraft);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'drafts:test-draft-1',
        JSON.stringify(mockDraft)
      );
    });

    it('should not duplicate draft ID in list', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['test-draft-1']));
      mockLocalStorage.setItem.mockImplementation(() => {});
      
      draftUtils.saveDraft(mockDraft);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'drafts:test-draft-1',
        JSON.stringify(mockDraft)
      );
    });
  });

  describe('deleteDraft', () => {
    it('should delete draft and update list', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['test-draft-1', 'draft-2']));
      mockLocalStorage.setItem.mockImplementation(() => {});
      
      draftUtils.deleteDraft('test-draft-1');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('drafts:test-draft-1');
    });
  });

  describe('loadAllDrafts', () => {
    it('should load all drafts and sort by updatedAt', () => {
      const draft1 = { ...mockDraft, id: 'draft-1', updatedAt: new Date('2024-01-01') };
      const draft2 = { ...mockDraft, id: 'draft-2', updatedAt: new Date('2024-01-02') };
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(['draft-1', 'draft-2'])) // getDraftIds
        .mockReturnValueOnce(JSON.stringify(draft1)) // loadDraft('draft-1')
        .mockReturnValueOnce(JSON.stringify(draft2)); // loadDraft('draft-2')
      
      const drafts = draftUtils.loadAllDrafts();
      
      expect(drafts).toHaveLength(2);
      expect(drafts[0].id).toBe('draft-2'); // Most recent first
      expect(drafts[1].id).toBe('draft-1');
    });

    it('should filter out failed loads', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(['draft-1', 'draft-2']))
        .mockReturnValueOnce(JSON.stringify(mockDraft)) // draft-1 loads successfully
        .mockReturnValueOnce(null); // draft-2 fails to load
      
      const drafts = draftUtils.loadAllDrafts();
      
      expect(drafts).toHaveLength(1);
      expect(drafts[0].id).toBe('test-draft-1');
    });
  });

  describe('checkAndCleanStorage', () => {
    it('should test storage availability', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.removeItem.mockImplementation(() => {});
      
      draftUtils.checkAndCleanStorage();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('storage-test', 'test');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('storage-test');
    });

    it('should clean old drafts when storage is full', () => {
      mockLocalStorage.setItem.mockImplementation((key) => {
        if (key === 'storage-test') {
          throw new Error('Storage full');
        }
      });
      
      // Mock loadAllDrafts to return many drafts
      const manyDrafts = Array.from({ length: 25 }, (_, i) => ({
        ...mockDraft,
        id: `draft-${i}`,
        updatedAt: new Date(2024, 0, i + 1),
      }));
      
      vi.spyOn(draftUtils, 'loadAllDrafts').mockReturnValue(manyDrafts);
      vi.spyOn(draftUtils, 'deleteDraft').mockImplementation(() => {});
      
      draftUtils.checkAndCleanStorage();
      
      // Should delete 5 oldest drafts (keep most recent 20)
      expect(draftUtils.deleteDraft).toHaveBeenCalledTimes(5);
    });
  });

  describe('getStorageInfo', () => {
    it('should calculate storage usage', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('draft data') // 10 chars
        .mockReturnValueOnce('more data'); // 9 chars
      
      // Mock localStorage keys
      Object.defineProperty(mockLocalStorage, Symbol.iterator, {
        value: vi.fn().mockReturnValue(['drafts:1', 'drafts:2', 'draft-list'].values()),
      });
      
      // Mock the for...in loop behavior
      Object.setPrototypeOf(mockLocalStorage, {
        'drafts:1': 'draft data',
        'draft-list': 'more data',
        'other-key': 'should be ignored',
      });
      
      const info = draftUtils.getStorageInfo();
      
      expect(info.total).toBe(5 * 1024 * 1024); // 5MB
      expect(info.used).toBeGreaterThanOrEqual(0);
      expect(info.available).toBe(info.total - info.used);
    });
  });
});