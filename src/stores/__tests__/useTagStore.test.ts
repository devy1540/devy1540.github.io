import { describe, it, expect, beforeEach } from 'vitest';
import { useTagStore } from '../useTagStore';

describe('useTagStore', () => {
  beforeEach(() => {
    useTagStore.getState().reset();
  });

  it('initializes with empty state', () => {
    const state = useTagStore.getState();
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('adds a new tag', () => {
    const { addItem } = useTagStore.getState();
    const newTag = addItem('React');
    expect(newTag.name).toBe('React');
    const state = useTagStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(newTag);
  });

  it('updates tag properties', () => {
    const { addItem, updateItem } = useTagStore.getState();
    const tag = addItem('React');
    updateItem(tag.id, { name: 'React.js' });
    const state = useTagStore.getState();
    expect(state.items[0].name).toBe('React.js');
  });

  it('deletes a tag', () => {
    const { addItem, deleteItem } = useTagStore.getState();
    const tag = addItem('React');
    deleteItem(tag.id);
    const state = useTagStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('increments post count', () => {
    const { addItem, incrementPostCount } = useTagStore.getState();
    const tag = addItem('React');
    incrementPostCount(tag.id);
    const state = useTagStore.getState();
    expect(state.items[0].postCount).toBe(1);
  });

  it('gets popular tags', () => {
    const { addItem, incrementPostCount, getPopular } = useTagStore.getState();
    addItem('React');
    const vue = addItem('Vue');
    incrementPostCount(vue.id);
    const popular = getPopular();
    expect(popular[0].name).toBe('Vue');
  });
});
