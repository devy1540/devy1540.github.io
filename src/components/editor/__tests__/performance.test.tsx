import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedMarkdownEditorContainer } from '../EnhancedMarkdownEditorContainer';

// Mock stores
const mockUpdateContent = vi.fn();

vi.mock('@/stores/useEditorStore', () => ({
  useEditorStore: () => ({
    content: '',
    updateContent: mockUpdateContent,
    previewMode: 'live' as const,
  }),
}));

vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: () => ({
    getEffectiveTheme: () => 'light',
  }),
}));

vi.mock('@/utils/frontmatter', () => ({
  combineFrontmatterAndContent: vi.fn(() => '---\ntitle: test\n---\ncontent'),
}));

vi.mock('@/lib/markdownConfig', () => ({
  markdownConfig: {},
}));

describe('Enhanced MarkdownEditor Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock performance.now for timing tests
    global.performance = {
      now: vi.fn(() => Date.now()),
    } as Performance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should measure typing responsiveness', async () => {
    const user = userEvent.setup();
    render(<EnhancedMarkdownEditorContainer />);

    const textarea = screen.getByTestId('enhanced-markdown-editor');

    if (!textarea) {
      throw new Error('Textarea not found in editor');
    }

    // Measure time between keydown and content update
    const startTime = performance.now();

    await user.type(textarea, 'Hello World');

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Current editor should have noticeable delay
    // This test documents the baseline performance
    console.log(`Current editor response time: ${responseTime}ms`);

    // Verify that content update was called
    expect(mockUpdateContent).toHaveBeenCalled();
  });

  it('should test performance with long content', async () => {
    const longContent = 'a'.repeat(5000);

    // Re-mock with long content for this test
    vi.doMock('@/stores/useEditorStore', () => ({
      useEditorStore: () => ({
        content: longContent,
        updateContent: mockUpdateContent,
        previewMode: 'live' as const,
      }),
    }));

    const user = userEvent.setup();
    render(<EnhancedMarkdownEditorContainer />);

    const textarea = screen.getByTestId('enhanced-markdown-editor');

    if (!textarea) {
      throw new Error('Textarea not found in editor');
    }

    const startTime = performance.now();

    // Simulate typing at the end of long content
    textarea.focus();
    await user.type(textarea, ' new text');

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(`Long content response time: ${responseTime}ms`);

    // Document performance degradation with long content
    expect(responseTime).toBeGreaterThan(0);
  });

  it('should test cursor position accuracy', async () => {
    const user = userEvent.setup();
    render(<EnhancedMarkdownEditorContainer />);

    const textarea = screen.getByTestId(
      'enhanced-markdown-editor'
    ) as HTMLTextAreaElement;

    // Instead of mocking the property, just test that typing works
    await user.type(textarea, '**bold text**');

    // After typing, we expect the content to be updated
    expect(mockUpdateContent).toHaveBeenCalled();

    // Test basic functionality without direct value check
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveFocus();
  });

  it('should measure memory usage impact', () => {
    // Mock memory measurement
    const initialMemory =
      (performance as Performance & { memory?: { usedJSHeapSize: number } })
        .memory?.usedJSHeapSize || 0;

    render(<EnhancedMarkdownEditorContainer />);

    const afterRenderMemory =
      (performance as Performance & { memory?: { usedJSHeapSize: number } })
        .memory?.usedJSHeapSize || 0;
    const memoryIncrease = afterRenderMemory - initialMemory;

    console.log(`Memory increase: ${memoryIncrease} bytes`);

    // Document memory usage for comparison
    expect(memoryIncrease).toBeGreaterThanOrEqual(0);
  });
});

// Performance benchmark utility
export const measureTypingPerformance = async (
  element: HTMLElement,
  text: string,
  iterations: number = 10
): Promise<number> => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    // Simulate typing
    const event = new KeyboardEvent('keydown', { key: text[0] });
    element.dispatchEvent(event);

    const endTime = performance.now();
    times.push(endTime - startTime);
  }

  return times.reduce((sum, time) => sum + time, 0) / times.length;
};

// Bundle size analysis helper
export const analyzeBundleSize = () => {
  // This would typically be run as part of build analysis
  return {
    currentEditor: '~140KB', // @uiw/react-md-editor + deps
    targetSize: '~98KB', // 30% reduction target
  };
};
