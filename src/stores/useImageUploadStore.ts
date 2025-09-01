import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ImageUploadProgress, UploadedImage, ImageGalleryItem } from '@/types/image-upload';

interface ImageUploadStore {
  // 업로드 진행 상태
  uploads: Record<string, ImageUploadProgress>;
  
  // 업로드된 이미지 목록
  images: ImageGalleryItem[];
  
  // UI 상태
  isUploading: boolean;
  isGalleryOpen: boolean;
  
  // 업로드 진행 상태 관리
  setUploadProgress: (uploadId: string, progress: ImageUploadProgress) => void;
  removeUpload: (uploadId: string) => void;
  clearUploads: () => void;
  
  // 업로드된 이미지 관리
  addImage: (image: UploadedImage) => void;
  removeImage: (imageId: string) => void;
  setImages: (images: UploadedImage[]) => void;
  selectImage: (imageId: string, selected: boolean) => void;
  getSelectedImages: () => ImageGalleryItem[];
  clearSelection: () => void;
  
  // UI 상태 관리
  setUploading: (uploading: boolean) => void;
  setGalleryOpen: (open: boolean) => void;
}

export const useImageUploadStore = create<ImageUploadStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        uploads: {},
        images: [],
        isUploading: false,
        isGalleryOpen: false,

        // 업로드 진행 상태 관리
        setUploadProgress: (uploadId, progress) =>
          set(
            (state) => ({
              uploads: {
                ...state.uploads,
                [uploadId]: progress,
              },
              isUploading: progress.status === 'uploading' || progress.status === 'processing',
            }),
            false,
            'setUploadProgress'
          ),

        removeUpload: (uploadId) =>
          set(
            (state) => {
              const { [uploadId]: removed, ...remainingUploads } = state.uploads;
              return {
                uploads: remainingUploads,
                isUploading: Object.values(remainingUploads).some(
                  (upload) => upload.status === 'uploading' || upload.status === 'processing'
                ),
              };
            },
            false,
            'removeUpload'
          ),

        clearUploads: () =>
          set(
            { uploads: {}, isUploading: false },
            false,
            'clearUploads'
          ),

        // 업로드된 이미지 관리
        addImage: (image) =>
          set(
            (state) => ({
              images: [
                { ...image, selected: false },
                ...state.images.filter((img) => img.id !== image.id),
              ],
            }),
            false,
            'addImage'
          ),

        removeImage: (imageId) =>
          set(
            (state) => ({
              images: state.images.filter((img) => img.id !== imageId),
            }),
            false,
            'removeImage'
          ),

        setImages: (images) =>
          set(
            {
              images: images.map((img) => ({ ...img, selected: false })),
            },
            false,
            'setImages'
          ),

        selectImage: (imageId, selected) =>
          set(
            (state) => ({
              images: state.images.map((img) =>
                img.id === imageId ? { ...img, selected } : img
              ),
            }),
            false,
            'selectImage'
          ),

        getSelectedImages: () => {
          const { images } = get();
          return images.filter((img) => img.selected);
        },

        clearSelection: () =>
          set(
            (state) => ({
              images: state.images.map((img) => ({ ...img, selected: false })),
            }),
            false,
            'clearSelection'
          ),

        // UI 상태 관리
        setUploading: (uploading) =>
          set({ isUploading: uploading }, false, 'setUploading'),

        setGalleryOpen: (open) =>
          set({ isGalleryOpen: open }, false, 'setGalleryOpen'),
      }),
      {
        name: 'image-upload-store',
        partialize: (state) => ({
          images: state.images, // 이미지 목록만 persist
        }),
      }
    ),
    {
      name: 'ImageUploadStore',
    }
  )
);