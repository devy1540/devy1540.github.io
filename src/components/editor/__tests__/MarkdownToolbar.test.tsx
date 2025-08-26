import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MarkdownToolbar } from '../MarkdownToolbar';

const mockSetPreviewMode = vi.fn();
const mockUpdateContent = vi.fn();

vi.mock('@/stores/useEditorStore', () => ({
  useEditorStore: () => ({
    previewMode: 'live',
    setPreviewMode: mockSetPreviewMode,
    metadata: {},
    content: 'test content',
    updateContent: mockUpdateContent,
  }),
}));

vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: () => ({
    getEffectiveTheme: () => 'light',
  }),
}));

// Mock window.open for frontmatter preview test
Object.defineProperty(window, 'open', {
  value: vi.fn(() => ({
    document: {
      write: vi.fn(),
      close: vi.fn(),
    },
  })),
  writable: true,
});

describe('MarkdownToolbar', () => {
  const mockEditorRef = { current: null as HTMLTextAreaElement | null };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock textarea element
    mockEditorRef.current = {
      selectionStart: 0,
      selectionEnd: 0,
      setSelectionRange: vi.fn(),
      focus: vi.fn(),
    } as HTMLTextAreaElement;
  });

  it('should render all toolbar buttons', () => {
    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    // Check basic formatting buttons
    expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-italic')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-strikethrough')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-hr')).toBeInTheDocument();

    // Check link and media buttons
    expect(screen.getByTestId('toolbar-link')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-image')).toBeInTheDocument();

    // Check block buttons
    expect(screen.getByTestId('toolbar-quote')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-code')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-codeBlock')).toBeInTheDocument();

    // Check list buttons
    expect(screen.getByTestId('toolbar-orderedList')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-unorderedList')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-checkedList')).toBeInTheDocument();

    // Check view mode buttons
    expect(screen.getByTestId('toolbar-view-edit')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-view-live')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-view-preview')).toBeInTheDocument();

    // Check frontmatter preview button
    expect(
      screen.getByTestId('toolbar-frontmatter-preview')
    ).toBeInTheDocument();
  });

  it('should handle bold formatting', () => {
    mockEditorRef.current!.selectionStart = 5;
    mockEditorRef.current!.selectionEnd = 9;

    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    fireEvent.click(screen.getByTestId('toolbar-bold'));

    expect(mockUpdateContent).toHaveBeenCalledWith('test **cont**ent');
  });

  it('should handle italic formatting', () => {
    mockEditorRef.current!.selectionStart = 0;
    mockEditorRef.current!.selectionEnd = 4;

    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    fireEvent.click(screen.getByTestId('toolbar-italic'));

    expect(mockUpdateContent).toHaveBeenCalledWith('*test* content');
  });

  it('should handle link insertion', () => {
    mockEditorRef.current!.selectionStart = 5;
    mockEditorRef.current!.selectionEnd = 12;

    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    fireEvent.click(screen.getByTestId('toolbar-link'));

    expect(mockUpdateContent).toHaveBeenCalledWith('test [content](url)');
  });

  it('should handle view mode changes', () => {
    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    fireEvent.click(screen.getByTestId('toolbar-view-edit'));
    expect(mockSetPreviewMode).toHaveBeenCalledWith('edit');

    fireEvent.click(screen.getByTestId('toolbar-view-preview'));
    expect(mockSetPreviewMode).toHaveBeenCalledWith('preview');
  });

  it('should handle code block insertion', () => {
    mockEditorRef.current!.selectionStart = 5;
    mockEditorRef.current!.selectionEnd = 5;

    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    fireEvent.click(screen.getByTestId('toolbar-codeBlock'));

    expect(mockUpdateContent).toHaveBeenCalledWith(
      'test \n```\n\n```\ncontent'
    );
  });

  it('should handle list insertions', () => {
    mockEditorRef.current!.selectionStart = 5;
    mockEditorRef.current!.selectionEnd = 5;

    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    // Test unordered list
    fireEvent.click(screen.getByTestId('toolbar-unorderedList'));
    expect(mockUpdateContent).toHaveBeenCalledWith('test \n- content');

    // Reset mock
    mockUpdateContent.mockClear();

    // Test ordered list
    fireEvent.click(screen.getByTestId('toolbar-orderedList'));
    expect(mockUpdateContent).toHaveBeenCalledWith('test \n1. content');

    // Reset mock
    mockUpdateContent.mockClear();

    // Test task list
    fireEvent.click(screen.getByTestId('toolbar-checkedList'));
    expect(mockUpdateContent).toHaveBeenCalledWith('test \n- [ ] content');
  });

  it('should handle frontmatter preview', () => {
    const mockWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
    };

    vi.mocked(window.open).mockReturnValue(mockWindow as Window | null);

    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    fireEvent.click(screen.getByTestId('toolbar-frontmatter-preview'));

    expect(window.open).toHaveBeenCalledWith(
      '',
      '_blank',
      'width=800,height=600'
    );
    expect(mockWindow.document.write).toHaveBeenCalled();
    expect(mockWindow.document.close).toHaveBeenCalled();
  });

  it('should call onAction callback when provided', () => {
    const mockOnAction = vi.fn();

    render(
      <MarkdownToolbar editorRef={mockEditorRef} onAction={mockOnAction} />
    );

    fireEvent.click(screen.getByTestId('toolbar-bold'));

    expect(mockOnAction).toHaveBeenCalledWith('bold', undefined);
  });

  it('should highlight active view mode', () => {
    render(<MarkdownToolbar editorRef={mockEditorRef} />);

    const liveButton = screen.getByTestId('toolbar-view-live');
    const editButton = screen.getByTestId('toolbar-view-edit');

    // Live mode should be active (default variant)
    expect(liveButton).toHaveClass('bg-primary');
    // Edit mode should not be active (ghost variant)
    expect(editButton).not.toHaveClass('bg-primary');
  });
});
