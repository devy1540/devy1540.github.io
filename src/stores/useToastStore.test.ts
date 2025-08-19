import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore } from './useToastStore';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it('should add toast to store when showToast is called', () => {
    const { showToast } = useToastStore.getState();
    
    showToast('success', 'Test Title', 'Test Description');
    
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].title).toBe('Test Title');
    expect(toasts[0].description).toBe('Test Description');
  });

  it('should provide convenience methods for different toast types', () => {
    const { success, error, warning, info } = useToastStore.getState();
    
    success('Success');
    error('Error');
    warning('Warning'); 
    info('Info');
    
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(4);
    expect(toasts.map(t => t.type)).toEqual(['success', 'error', 'warning', 'info']);
  });

  it('should remove toast from store', () => {
    const { showToast, removeToast } = useToastStore.getState();
    
    showToast('info', 'Test');
    const { toasts } = useToastStore.getState();
    const toastId = toasts[0].id;
    
    removeToast(toastId);
    
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    const { showToast, clearAll } = useToastStore.getState();
    
    showToast('info', 'Test 1');
    showToast('info', 'Test 2');
    
    expect(useToastStore.getState().toasts).toHaveLength(2);
    
    clearAll();
    
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});