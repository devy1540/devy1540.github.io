import { FC, memo, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { EnhancedMarkdownEditor } from './EnhancedMarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { MarkdownToolbar } from './MarkdownToolbar';

export const EnhancedMarkdownEditorContainer: FC = memo(() => {
  const { previewMode } = useEditorStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Handle toolbar actions by delegating to the editor component
  const handleToolbarAction = useCallback(
    (action: string, value?: string | number) => {
      // The actual toolbar action handling is done within the EnhancedMarkdownEditor component
      // This is just a pass-through handler for the toolbar component
      console.log('Toolbar action:', action, value);
    },
    []
  );

  if (previewMode === 'edit') {
    // Edit only mode with toolbar
    return (
      <div
        className="w-full h-full flex flex-col"
        data-testid="editor-container-edit"
      >
        <MarkdownToolbar onAction={handleToolbarAction} editorRef={editorRef} />
        <div className="flex-1 min-h-0">
          <EnhancedMarkdownEditor
            ref={editorRef}
            onToolbarAction={handleToolbarAction}
          />
        </div>
      </div>
    );
  }

  if (previewMode === 'preview') {
    // Preview only mode with toolbar (for view switching)
    return (
      <div
        className="w-full h-full flex flex-col"
        data-testid="editor-container-preview"
      >
        <MarkdownToolbar onAction={handleToolbarAction} editorRef={editorRef} />
        <div className="flex-1 min-h-0">
          <MarkdownPreview />
        </div>
      </div>
    );
  }

  // Live mode - split view with toolbar
  return (
    <div
      className="w-full h-full flex flex-col"
      data-testid="editor-container-live"
    >
      <MarkdownToolbar onAction={handleToolbarAction} editorRef={editorRef} />
      <div className="flex-1 min-h-0 flex gap-2">
        <div className="flex-1 min-w-0">
          <EnhancedMarkdownEditor
            ref={editorRef}
            onToolbarAction={handleToolbarAction}
          />
        </div>
        <div className="flex-1 min-w-0">
          <MarkdownPreview />
        </div>
      </div>
    </div>
  );
});

EnhancedMarkdownEditorContainer.displayName = 'EnhancedMarkdownEditorContainer';
