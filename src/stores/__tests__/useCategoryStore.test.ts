import { describe, it, expect, beforeEach } from 'vitest';
import { useCategoryStore } from '../useCategoryStore';

describe('useCategoryStore', () => {
  beforeEach(() => {
    useCategoryStore.getState().reset();
  });

  it('initializes with empty state', () => {
    const state = useCategoryStore.getState();
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('adds a new category', () => {
    const { addItem } = useCategoryStore.getState();
    const newCategory = addItem('Tech', { description: 'Technology posts' });
    expect(newCategory.name).toBe('Tech');
    expect(newCategory.description).toBe('Technology posts');
    const state = useCategoryStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(newCategory);
  });

  it('updates category properties', () => {
    const { addItem, updateItem } = useCategoryStore.getState();
    const category = addItem('Tech');
    updateItem(category.id, { name: 'Technology' });
    const state = useCategoryStore.getState();
    expect(state.items[0].name).toBe('Technology');
  });

  it('deletes a category', () => {
    const { addItem, deleteItem } = useCategoryStore.getState();
    const category = addItem('Tech');
    deleteItem(category.id);
    const state = useCategoryStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('increments post count', () => {
    const { addItem, incrementPostCount } = useCategoryStore.getState();
    const category = addItem('Tech');
    incrementPostCount(category.id);
    const state = useCategoryStore.getState();
    expect(state.items[0].postCount).toBe(1);
  });

  it('gets popular categories', () => {
    const { addItem, incrementPostCount, getPopular } = useCategoryStore.getState();
    const tech = addItem('Tech');
    const travel = addItem('Travel');
    incrementPostCount(travel.id);
    const popular = getPopular();
    expect(popular[0].name).toBe('Travel');
  });
});