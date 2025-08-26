import { FC, memo, useCallback, useMemo } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Link,
  Quote,
  Code,
  FileCode,
  Image,
  List,
  ListOrdered,
  CheckSquare,
  Split,
  Book,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator as UISeparator } from '@/components/ui/separator';
import { useEditorStore, type PreviewMode } from '@/stores/useEditorStore';
import { combineFrontmatterAndContent } from '@/utils/frontmatter';
import { cn } from '@/lib/utils';

export interface MarkdownToolbarProps {
  className?: string;
  onAction?: (action: string, value?: string | number | boolean | null) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

export const MarkdownToolbar: FC<MarkdownToolbarProps> = memo(
  ({ className, onAction, editorRef }) => {
    const { previewMode, setPreviewMode, metadata, content, updateContent } =
      useEditorStore();

    // Insert text at cursor position
    const insertTextAtCursor = useCallback(
      (before: string, after: string = '') => {
        const textarea = editorRef?.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        const newText = before + selectedText + after;
        const newContent =
          content.substring(0, start) + newText + content.substring(end);

        // Update content through store
        updateContent(newContent);

        // Restore cursor position after React re-render
        setTimeout(() => {
          if (textarea) {
            const newCursorPos = selectedText
              ? start + before.length + selectedText.length + after.length
              : start + before.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
          }
        }, 0);
      },
      [content, updateContent, editorRef]
    );

    // Toolbar action handler
    const handleAction = useCallback(
      (action: string, value?: string | number | boolean | null) => {
        switch (action) {
          case 'bold':
            insertTextAtCursor('**', '**');
            break;
          case 'italic':
            insertTextAtCursor('*', '*');
            break;
          case 'strikethrough':
            insertTextAtCursor('~~', '~~');
            break;
          case 'hr':
            insertTextAtCursor('\n---\n');
            break;
          case 'link':
            insertTextAtCursor('[', '](url)');
            break;
          case 'image':
            insertTextAtCursor('![alt text](', ')');
            break;
          case 'quote':
            insertTextAtCursor('\n> ');
            break;
          case 'code':
            insertTextAtCursor('`', '`');
            break;
          case 'codeBlock':
            insertTextAtCursor('\n```\n', '\n```\n');
            break;
          case 'orderedList':
            insertTextAtCursor('\n1. ');
            break;
          case 'unorderedList':
            insertTextAtCursor('\n- ');
            break;
          case 'checkedList':
            insertTextAtCursor('\n- [ ] ');
            break;
          default:
            break;
        }

        onAction?.(action, value);
      },
      [insertTextAtCursor, onAction]
    );

    // View mode handlers
    const handleViewModeChange = useCallback(
      (mode: PreviewMode) => {
        setPreviewMode(mode);
      },
      [setPreviewMode]
    );

    // Frontmatter preview handler
    const handleFrontmatterPreview = useCallback(() => {
      const fullMarkdown = combineFrontmatterAndContent(metadata, content);

      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      if (previewWindow) {
        previewWindow.document.write(`
        <html>
          <head>
            <title>Frontmatter Preview</title>
            <style>
              body { 
                font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; 
                white-space: pre-wrap; 
                padding: 20px; 
                line-height: 1.6;
                background: #fafafa;
              }
              .frontmatter { 
                background: #f5f5f5; 
                padding: 16px; 
                border-left: 4px solid #007acc; 
                margin-bottom: 20px; 
                border-radius: 4px;
              }
              h1 { 
                color: #333; 
                margin-bottom: 16px; 
              }
            </style>
          </head>
          <body>
            <h1>Full Markdown with Frontmatter</h1>
            <div class="frontmatter">${fullMarkdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </body>
        </html>
      `);
        previewWindow.document.close();
      }
    }, [metadata, content]);

    // Memoize command arrays to avoid recreation on each render
    const basicCommands = useMemo(
      () => [
        {
          name: 'bold',
          icon: <Bold className="w-4 h-4" />,
          title: 'Bold (Ctrl/Cmd + B)',
          action: () => handleAction('bold'),
        },
        {
          name: 'italic',
          icon: <Italic className="w-4 h-4" />,
          title: 'Italic (Ctrl/Cmd + I)',
          action: () => handleAction('italic'),
        },
        {
          name: 'strikethrough',
          icon: <Strikethrough className="w-4 h-4" />,
          title: 'Strikethrough',
          action: () => handleAction('strikethrough'),
        },
        {
          name: 'hr',
          icon: <Minus className="w-4 h-4" />,
          title: 'Horizontal Rule',
          action: () => handleAction('hr'),
        },
      ],
      [handleAction]
    );

    const linkCommands = useMemo(
      () => [
        {
          name: 'link',
          icon: <Link className="w-4 h-4" />,
          title: 'Link (Ctrl/Cmd + K)',
          action: () => handleAction('link'),
        },
        {
          name: 'image',
          icon: <Image className="w-4 h-4" />,
          title: 'Image',
          action: () => handleAction('image'),
        },
      ],
      [handleAction]
    );

    const blockCommands = useMemo(
      () => [
        {
          name: 'quote',
          icon: <Quote className="w-4 h-4" />,
          title: 'Quote',
          action: () => handleAction('quote'),
        },
        {
          name: 'code',
          icon: <Code className="w-4 h-4" />,
          title: 'Inline Code',
          action: () => handleAction('code'),
        },
        {
          name: 'codeBlock',
          icon: <FileCode className="w-4 h-4" />,
          title: 'Code Block',
          action: () => handleAction('codeBlock'),
        },
      ],
      [handleAction]
    );

    const listCommands = useMemo(
      () => [
        {
          name: 'orderedList',
          icon: <ListOrdered className="w-4 h-4" />,
          title: 'Ordered List',
          action: () => handleAction('orderedList'),
        },
        {
          name: 'unorderedList',
          icon: <List className="w-4 h-4" />,
          title: 'Unordered List',
          action: () => handleAction('unorderedList'),
        },
        {
          name: 'checkedList',
          icon: <CheckSquare className="w-4 h-4" />,
          title: 'Task List',
          action: () => handleAction('checkedList'),
        },
      ],
      [handleAction]
    );

    const viewModes = useMemo(
      () => [
        {
          mode: 'edit' as PreviewMode,
          icon: <Code className="w-4 h-4" />,
          title: 'Edit only',
        },
        {
          mode: 'live' as PreviewMode,
          icon: <Split className="w-4 h-4" />,
          title: 'Edit and preview',
        },
        {
          mode: 'preview' as PreviewMode,
          icon: <Book className="w-4 h-4" />,
          title: 'Preview only',
        },
      ],
      []
    );

    return (
      <div
        className={cn(
          'flex items-center gap-1 p-2 border-b border-border bg-background',
          'flex-wrap min-h-[48px]',
          className
        )}
        data-testid="markdown-toolbar"
        role="toolbar"
        aria-label="Markdown formatting toolbar"
        aria-orientation="horizontal"
      >
        {/* Basic formatting */}
        <div className="flex items-center gap-1">
          {basicCommands.map((cmd) => (
            <Button
              key={cmd.name}
              variant="ghost"
              size="sm"
              onClick={cmd.action}
              title={cmd.title}
              className="h-8 w-8 p-0"
              data-testid={`toolbar-${cmd.name}`}
              aria-label={cmd.title}
              role="button"
              tabIndex={0}
            >
              {cmd.icon}
            </Button>
          ))}
        </div>

        <UISeparator orientation="vertical" className="h-6 mx-1" />

        {/* Links and media */}
        <div className="flex items-center gap-1">
          {linkCommands.map((cmd) => (
            <Button
              key={cmd.name}
              variant="ghost"
              size="sm"
              onClick={cmd.action}
              title={cmd.title}
              className="h-8 w-8 p-0"
              data-testid={`toolbar-${cmd.name}`}
              aria-label={cmd.title}
              role="button"
              tabIndex={0}
            >
              {cmd.icon}
            </Button>
          ))}
        </div>

        <UISeparator orientation="vertical" className="h-6 mx-1" />

        {/* Block elements */}
        <div className="flex items-center gap-1">
          {blockCommands.map((cmd) => (
            <Button
              key={cmd.name}
              variant="ghost"
              size="sm"
              onClick={cmd.action}
              title={cmd.title}
              className="h-8 w-8 p-0"
              data-testid={`toolbar-${cmd.name}`}
              aria-label={cmd.title}
              role="button"
              tabIndex={0}
            >
              {cmd.icon}
            </Button>
          ))}
        </div>

        <UISeparator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          {listCommands.map((cmd) => (
            <Button
              key={cmd.name}
              variant="ghost"
              size="sm"
              onClick={cmd.action}
              title={cmd.title}
              className="h-8 w-8 p-0"
              data-testid={`toolbar-${cmd.name}`}
              aria-label={cmd.title}
              role="button"
              tabIndex={0}
            >
              {cmd.icon}
            </Button>
          ))}
        </div>

        <UISeparator orientation="vertical" className="h-6 mx-1" />

        {/* View modes */}
        <div className="flex items-center gap-1">
          {viewModes.map((mode) => (
            <Button
              key={mode.mode}
              variant={previewMode === mode.mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange(mode.mode)}
              title={mode.title}
              className="h-8 w-8 p-0"
              data-testid={`toolbar-view-${mode.mode}`}
              aria-label={`${mode.title}${previewMode === mode.mode ? ' (active)' : ''}`}
              aria-pressed={previewMode === mode.mode}
              role="button"
              tabIndex={0}
            >
              {mode.icon}
            </Button>
          ))}
        </div>

        <UISeparator orientation="vertical" className="h-6 mx-1" />

        {/* Frontmatter preview */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFrontmatterPreview}
          title="View with frontmatter"
          className="h-8 w-8 p-0"
          data-testid="toolbar-frontmatter-preview"
          aria-label="View with frontmatter"
          role="button"
          tabIndex={0}
        >
          <FileText className="w-4 h-4" />
        </Button>
      </div>
    );
  }
);

MarkdownToolbar.displayName = 'MarkdownToolbar';
