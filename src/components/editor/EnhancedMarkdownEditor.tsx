import {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
  forwardRef,
} from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { cn } from '@/lib/utils';

interface EnhancedMarkdownEditorProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const EnhancedMarkdownEditor = memo(
  forwardRef<HTMLTextAreaElement, EnhancedMarkdownEditorProps>(
    (
      { className, placeholder = 'Start writing...', autoFocus = false },
      ref
    ) => {
      const { content, updateContent, previewMode } = useEditorStore();
      const { getEffectiveTheme } = useThemeStore();
      const effectiveTheme = getEffectiveTheme();

      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const isPreviewOnly = previewMode === 'preview';

      // Handle content changes with immediate response (no debouncing)
      const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          updateContent(event.target.value);
        },
        [updateContent]
      );

      // Screen reader announcement helper
      const announceToScreenReader = useCallback((message: string) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }, []);

      // Insert text at cursor position with perfect positioning
      const insertTextAtCursor = useCallback(
        (before: string, after: string = '') => {
          const textarea = textareaRef.current;
          if (!textarea) return;

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selectedText = content.substring(start, end);

          const newText = before + selectedText + after;
          const newContent =
            content.substring(0, start) + newText + content.substring(end);

          // Update content
          updateContent(newContent);

          // Restore cursor position after React re-render
          const timeoutId = setTimeout(() => {
            if (textarea) {
              const newCursorPos = selectedText
                ? start + before.length + selectedText.length + after.length
                : start + before.length;
              textarea.setSelectionRange(newCursorPos, newCursorPos);
              textarea.focus();
            }
          }, 0);

          // Track timeout for cleanup
          const globalTimeouts = globalThis as typeof globalThis & {
            __editorTimeouts?: NodeJS.Timeout[];
          };
          if (!globalTimeouts.__editorTimeouts) {
            globalTimeouts.__editorTimeouts = [];
          }
          globalTimeouts.__editorTimeouts.push(timeoutId);
        },
        [content, updateContent]
      );

      // Handle keyboard shortcuts with accessibility improvements
      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
          const { key, metaKey, ctrlKey, shiftKey } = event;
          const isMod = metaKey || ctrlKey;

          // Enhanced keyboard shortcuts with screen reader announcements
          if (isMod) {
            switch (key) {
              case 'b':
                event.preventDefault();
                insertTextAtCursor('**', '**');
                // Announce action to screen readers
                announceToScreenReader('Bold formatting applied');
                break;
              case 'i':
                event.preventDefault();
                insertTextAtCursor('*', '*');
                announceToScreenReader('Italic formatting applied');
                break;
              case 'k':
                event.preventDefault();
                insertTextAtCursor('[', '](url)');
                announceToScreenReader('Link inserted');
                break;
              case 'u':
                if (shiftKey) {
                  event.preventDefault();
                  insertTextAtCursor('\n- ');
                  announceToScreenReader('Unordered list item added');
                }
                break;
              case 'o':
                if (shiftKey) {
                  event.preventDefault();
                  insertTextAtCursor('\n1. ');
                  announceToScreenReader('Ordered list item added');
                }
                break;
              case 'q':
                if (shiftKey) {
                  event.preventDefault();
                  insertTextAtCursor('\n> ');
                  announceToScreenReader('Quote added');
                }
                break;
              case 's':
                // Let the parent handle save
                break;
              case 'z':
                // Allow default undo/redo behavior
                break;
              case 'Enter':
                if (shiftKey) {
                  event.preventDefault();
                  insertTextAtCursor('\n---\n');
                  announceToScreenReader('Horizontal rule added');
                }
                break;
              default:
                break;
            }
          }

          // Handle Tab for indentation
          if (key === 'Tab' && !isMod) {
            event.preventDefault();
            insertTextAtCursor('  '); // 2 spaces for indentation
            announceToScreenReader('Indentation added');
          }

          // Handle Escape for accessibility
          if (key === 'Escape') {
            announceToScreenReader('Focus returned to editor');
          }
        },
        [announceToScreenReader, insertTextAtCursor]
      );

      // Auto-resize textarea to content
      const autoResize = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
        }
      }, []);

      // Auto-resize on content change with optimized dependency array
      useEffect(() => {
        autoResize();
      }, [content, autoResize]);

      // Optimize re-renders with useMemo for expensive operations
      const shouldRender = useMemo(() => {
        return !isPreviewOnly;
      }, [isPreviewOnly]);

      // Focus management
      useEffect(() => {
        if (autoFocus && textareaRef.current && !isPreviewOnly) {
          textareaRef.current.focus();
        }
      }, [autoFocus, isPreviewOnly]);

      // Cleanup on unmount to prevent memory leaks
      useEffect(() => {
        return () => {
          // Clear any pending timeouts from cursor positioning
          const globalTimeouts = globalThis as typeof globalThis & {
            __editorTimeouts?: NodeJS.Timeout[];
          };
          const timeouts = globalTimeouts.__editorTimeouts || [];
          timeouts.forEach((id: NodeJS.Timeout) => clearTimeout(id));
          globalTimeouts.__editorTimeouts = [];
        };
      }, []);

      // Performance monitoring in development
      useEffect(() => {
        if (process.env.NODE_ENV === 'development' && content.length > 10000) {
          console.log(
            `[Enhanced Editor] Large content detected: ${content.length} characters`
          );
        }
      }, [content.length]);

      // Textarea styles based on theme
      const textareaStyles = useMemo(
        () => ({
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          resize: 'none' as const,
          outline: 'none',
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          width: '100%',
          minHeight: '200px',
          padding: '16px',
        }),
        []
      );

      if (!shouldRender) {
        return null; // Preview will be handled by parent component
      }

      return (
        <div
          className={cn(
            'relative w-full h-full',
            'bg-background text-foreground',
            'border border-border rounded-md',
            'focus-within:ring-2 focus-within:ring-ring focus-within:border-ring',
            effectiveTheme === 'dark' && 'dark',
            className
          )}
          data-color-mode={effectiveTheme}
        >
          <textarea
            ref={(el) => {
              textareaRef.current = el;
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }
            }}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={textareaStyles}
            className={cn(
              'w-full h-full resize-none outline-none',
              'placeholder:text-muted-foreground',
              'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground'
            )}
            data-testid="enhanced-markdown-editor"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            // Accessibility improvements
            role="textbox"
            aria-label="Markdown editor textarea"
            aria-describedby="editor-help"
            aria-multiline="true"
            tabIndex={0}
          />
          {/* Hidden accessibility help text */}
          <div
            id="editor-help"
            className="sr-only"
            role="region"
            aria-label="Markdown editor help"
          >
            Markdown editor. Use keyboard shortcuts: Ctrl+B for bold, Ctrl+I for
            italic, Ctrl+K for links. Use Tab for indentation. Navigate with
            arrow keys and standard text editing commands.
          </div>
        </div>
      );
    }
  )
);

EnhancedMarkdownEditor.displayName = 'EnhancedMarkdownEditor';
