import { create } from 'zustand';
import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, description?: string, duration?: number) => void;
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  warning: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  
  showToast: (type, title, description, duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const toastMessage: ToastMessage = { id, type, title, description, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toastMessage],
    }));

    // Use Sonner's toast functions
    switch (type) {
      case 'success':
        toast.success(title, { 
          description, 
          duration,
          id,
        });
        break;
      case 'error':
        toast.error(title, { 
          description, 
          duration,
          id,
        });
        break;
      case 'warning':
        toast.warning(title, { 
          description, 
          duration,
          id,
        });
        break;
      case 'info':
      default:
        toast.info(title, { 
          description, 
          duration,
          id,
        });
        break;
    }

    // Auto-remove from store after duration
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  success: (title, description, duration) => {
    get().showToast('success', title, description, duration);
  },

  error: (title, description, duration) => {
    get().showToast('error', title, description, duration);
  },

  warning: (title, description, duration) => {
    get().showToast('warning', title, description, duration);
  },

  info: (title, description, duration) => {
    get().showToast('info', title, description, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
    toast.dismiss(id);
  },

  clearAll: () => {
    set({ toasts: [] });
    toast.dismiss();
  },
}));