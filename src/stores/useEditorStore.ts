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
  // 이미지 관련 상태
  cursorPosition: number;
  isImageUploading: boolean;
  // 메서드
  updateContent: (content: string) => void;
  updateMetadata: (metadata: Partial<Post>) => void;
  setAutoSaving: (isAutoSaving: boolean) => void;
  setSaved: () => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setCurrentDraftId: (id: string | null) => void;
  setCursorPosition: (position: number) => void;
  setImageUploading: (uploading: boolean) => void;
  insertImageAtCursor: (imageMarkdown: string) => void;
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
  cursorPosition: 0,
  isImageUploading: false,
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
  setCursorPosition: (position: number) => set({ cursorPosition: position }),
  setImageUploading: (uploading: boolean) => set({ isImageUploading: uploading }),
  insertImageAtCursor: (imageMarkdown: string) => {
    const { content, cursorPosition } = get();
    const newContent = 
      content.slice(0, cursorPosition) + 
      imageMarkdown + 
      content.slice(cursorPosition);
    set({ 
      content: newContent, 
      isDirty: true,
      cursorPosition: cursorPosition + imageMarkdown.length 
    });
  },
  reset: () => set(getInitialState()),
}));