import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EnhancedMarkdownEditor } from '../EnhancedMarkdownEditor';
import { EnhancedMarkdownEditorContainer } from '../EnhancedMarkdownEditorContainer';

const mockUpdateContent = vi.fn();
const mockUseEditorStore = vi.fn();

vi.mock('@/stores/useEditorStore', () => ({
  useEditorStore: () => mockUseEditorStore(),
}));

vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: () => ({
    getEffectiveTheme: () => 'light',
  }),
}));

vi.mock('@/components/post/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}));

describe('EnhancedMarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEditorStore.mockReturnValue({
      content: '',
      updateContent: mockUpdateContent,
      previewMode: 'live' as const,
    });
  });

  it('should render textarea with correct attributes', () => {
    render(<EnhancedMarkdownEditor />);

    const textarea = screen.getByTestId('enhanced-markdown-editor');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('spellcheck', 'false');
    expect(textarea).toHaveAttribute('autocomplete', 'off');
    expect(textarea).toHaveAttribute('autocorrect', 'off');
    expect(textarea).toHaveAttribute('autocapitalize', 'off');
  });

  it('should handle text input changes', () => {
    render(<EnhancedMarkdownEditor />);

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;

    // Simulate change event directly
    fireEvent.change(textarea, { target: { value: 'Hello World' } });

    expect(mockUpdateContent).toHaveBeenCalledWith('Hello World');
  });

  it('should handle keyboard shortcuts correctly', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'test text',
      updateContent: mockUpdateContent,
      previewMode: 'live' as const,
    });

    render(<EnhancedMarkdownEditor />);

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;

    // Mock selection
    Object.defineProperty(textarea, 'selectionStart', {
      value: 0,
      writable: true,
    });
    Object.defineProperty(textarea, 'selectionEnd', {
      value: 4,
      writable: true,
    });

    // Test Ctrl+B for bold
    fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true });

    expect(mockUpdateContent).toHaveBeenCalledWith('**test** text');
  });

  it('should handle tab for indentation', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'line 1\n',
      updateContent: mockUpdateContent,
      previewMode: 'live' as const,
    });

    render(<EnhancedMarkdownEditor />);

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;

    // Mock cursor position at end
    Object.defineProperty(textarea, 'selectionStart', {
      value: 7,
      writable: true,
    });
    Object.defineProperty(textarea, 'selectionEnd', {
      value: 7,
      writable: true,
    });

    // Test Tab for indentation
    fireEvent.keyDown(textarea, { key: 'Tab' });

    expect(mockUpdateContent).toHaveBeenCalledWith('line 1\n  ');
  });

  it('should not render in preview-only mode', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'test',
      updateContent: mockUpdateContent,
      previewMode: 'preview' as const,
    });

    render(<EnhancedMarkdownEditor />);

    expect(
      screen.queryByTestId('enhanced-markdown-editor')
    ).not.toBeInTheDocument();
  });

  it('should have auto-resize functionality', () => {
    render(<EnhancedMarkdownEditor />);

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;

    // Textarea should have min height set from styles
    expect(textarea.style.minHeight).toBe('200px');

    // Textarea should have resize: none style for controlled resizing
    expect(textarea.style.resize).toBe('none');

    // Verify content changes trigger re-render (through store mock)
    fireEvent.change(textarea, { target: { value: 'test content' } });
    expect(mockUpdateContent).toHaveBeenCalledWith('test content');
  });
});

describe('EnhancedMarkdownEditorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEditorStore.mockReturnValue({
      content: 'test content',
      updateContent: mockUpdateContent,
      previewMode: 'live' as const,
    });
  });

  it('should render split view in live mode', () => {
    render(<EnhancedMarkdownEditorContainer />);

    expect(screen.getByTestId('editor-container-live')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('should render editor only in edit mode', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'test content',
      updateContent: mockUpdateContent,
      previewMode: 'edit' as const,
    });

    render(<EnhancedMarkdownEditorContainer />);

    expect(screen.getByTestId('editor-container-edit')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-markdown-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
  });

  it('should render preview only in preview mode', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'test content',
      updateContent: mockUpdateContent,
      previewMode: 'preview' as const,
    });

    render(<EnhancedMarkdownEditorContainer />);

    expect(screen.getByTestId('editor-container-preview')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    expect(
      screen.queryByTestId('enhanced-markdown-editor')
    ).not.toBeInTheDocument();
  });
});

describe('Performance Tests', () => {
  it('should handle large content without performance issues', async () => {
    const largeContent = 'a'.repeat(5000);
    mockUseEditorStore.mockReturnValue({
      content: largeContent,
      updateContent: mockUpdateContent,
      previewMode: 'live' as const,
    });

    const startTime = performance.now();
    render(<EnhancedMarkdownEditor />);
    const renderTime = performance.now() - startTime;

    // Should render quickly even with large content
    expect(renderTime).toBeLessThan(100); // Less than 100ms

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(largeContent);
  });

  it('should have immediate typing response', () => {
    render(<EnhancedMarkdownEditor />);

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;

    const startTime = performance.now();

    // Simulate typing "fast" - immediate update without debouncing
    fireEvent.change(textarea, { target: { value: 'fast' } });

    const responseTime = performance.now() - startTime;
    console.log(`Enhanced editor response time: ${responseTime}ms`);

    // Should be immediate response (much less than 100ms)
    expect(responseTime).toBeLessThan(100);

    // Verify content was updated immediately
    expect(mockUpdateContent).toHaveBeenCalledWith('fast');
  });
});
