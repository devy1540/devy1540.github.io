import { create } from 'zustand';
import type { Post } from '@/types';

export type PreviewMode = 'live' | 'edit' | 'preview';

interface EditorState {
  content: string;
  metadata: Partial<Post>;
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  previewMode: PreviewMode;
  currentDraftId: string | null;
  updateContent: (content: string) => void;
  updateMetadata: (metadata: Partial<Post>) => void;
  setAutoSaving: (isAutoSaving: boolean) => void;
  setSaved: () => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setCurrentDraftId: (id: string | null) => void;
  reset: () => void;
}

const getInitialState = () => ({
  content: '# Hello World\n\nThis is a new post.',
  metadata: {
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    tags: [],
    isDraft: true,
    thumbnail: null,
    metadata: {
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
    },
  } as Partial<Post>,
  isDirty: false,
  isAutoSaving: false,
  lastSaved: null,
  previewMode: 'live' as PreviewMode,
  currentDraftId: null,
});

export const useEditorStore = create<EditorState>((set, get) => ({
  ...getInitialState(),
  updateContent: (content: string) => set({ content, isDirty: true }),
  updateMetadata: (metadata: Partial<Post>) => 
    set({ metadata: { ...get().metadata, ...metadata }, isDirty: true }),
  setAutoSaving: (isAutoSaving: boolean) => set({ isAutoSaving }),
  setSaved: () => set({ lastSaved: new Date(), isDirty: false }),
  setPreviewMode: (mode: PreviewMode) => set({ previewMode: mode }),
  setCurrentDraftId: (id: string | null) => set({ currentDraftId: id }),
  reset: () => set(getInitialState()),
}));