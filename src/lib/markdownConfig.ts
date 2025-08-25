import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { markdownComponents } from '@/components/common/markdownComponents';

/**
 * Shared markdown configuration for consistent rendering
 * Used by both MarkdownRenderer and MarkdownEditor preview
 */
export const markdownConfig = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeRaw,
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'wrap' as const,
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to this section',
        },
      },
    ],
  ],
  components: markdownComponents,
};