import { create } from 'zustand';
import { generateSlug } from '@/utils/frontmatter';

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface TaxonomyState<T extends TaxonomyItem> {
  items: T[];
  isLoading: boolean;
  error: string | null;

  setItems: (items: T[]) => void;
  addItem: (name: string, extraData?: Partial<T>) => T;
  updateItem: (id: string, updates: Partial<T>) => void;
  deleteItem: (id: string) => void;
  incrementPostCount: (id: string) => void;
  decrementPostCount: (id: string) => void;
  getSuggestions: (query: string) => T[];
  findByName: (name: string) => T | undefined;
  findById: (id: string) => T | undefined;
  getPopular: (limit?: number) => T[];
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const createInitialState = <T extends TaxonomyItem>() => ({
  items: [] as T[],
  isLoading: false,
  error: null,
});

export const createTaxonomyStore = <T extends TaxonomyItem>(
  createItem: (name: string, extraData?: Partial<T>) => T
) => {
  const initialState = createInitialState<T>();
  return create<TaxonomyState<T>>((set, get) => ({
    ...initialState,

    setItems: (items: T[]) => set({ items }),

    addItem: (name: string, extraData?: Partial<T>) => {
      const existing = get().findByName(name);
      if (existing) return existing;

      const newItem = createItem(name, extraData);
      set(state => ({ items: [...state.items, newItem] }));
      return newItem;
    },

    updateItem: (id: string, updates: Partial<T>) =>
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),

    deleteItem: (id: string) =>
      set(state => ({ items: state.items.filter(item => item.id !== id) })),

    incrementPostCount: (id: string) =>
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, postCount: item.postCount + 1 } : item
        ),
      })),

    decrementPostCount: (id: string) =>
      set(state => ({
        items: state.items.map(item =>
          item.id === id
            ? { ...item, postCount: Math.max(0, item.postCount - 1) }
            : item
        ),
      })),

    getSuggestions: (query: string) => {
      const normalizedQuery = query.toLowerCase().trim();
      if (!normalizedQuery) return [];

      return get()
        .items.filter(
          item =>
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.slug.toLowerCase().includes(normalizedQuery)
        )
        .sort((a, b) => {
          const aExact = a.name.toLowerCase() === normalizedQuery;
          const bExact = b.name.toLowerCase() === normalizedQuery;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return b.postCount - a.postCount;
        })
        .slice(0, 10);
    },

    findByName: (name: string) =>
      get().items.find(
        item => item.name.toLowerCase() === name.toLowerCase().trim()
      ),

    findById: (id: string) => get().items.find(item => item.id === id),

    getPopular: (limit = 10) =>
      [...get().items].sort((a, b) => b.postCount - a.postCount).slice(0, limit),

    setError: (error: string | null) => set({ error }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    reset: () => set(initialState),
  }));
};