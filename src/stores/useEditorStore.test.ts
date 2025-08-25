import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from './useEditorStore';

describe('useEditorStore', () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().reset();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useEditorStore());
    expect(result.current.content).toBe('# Hello World\n\nThis is a new post.');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.previewMode).toBe('live');
  });

  it('should update content and set isDirty to true', () => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.updateContent('New content');
    });
    expect(result.current.content).toBe('New content');
    expect(result.current.isDirty).toBe(true);
  });

  it('should set preview mode', () => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.setPreviewMode('preview');
    });
    expect(result.current.previewMode).toBe('preview');
  });

  it('should reset the state', () => {
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.updateContent('New content');
      result.current.setPreviewMode('edit');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.content).toBe('# Hello World\n\nThis is a new post.');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.previewMode).toBe('live');
  });
});
