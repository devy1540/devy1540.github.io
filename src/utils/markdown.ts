import matter from 'gray-matter';
import type { Post } from '@/types';

/**
 * Parse markdown file content with frontmatter
 */
export function parseMarkdown(content: string): { data: Partial<Post>; content: string } {
  const { data, content: markdownContent } = matter(content);
  
  return {
    data: {
      title: data.title || 'Untitled',
      slug: data.slug || '',
      isDraft: data.isDraft ?? false,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      publishedAt: data.publishedAt,
      category: data.category || 'uncategorized',
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      thumbnail: data.thumbnail,
      readingTime: data.readingTime,
      metadata: data.metadata,
    },
    content: markdownContent,
  };
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // Allow Korean characters
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract excerpt from markdown content
 */
export function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/```[^`]*```/g, '') // Code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/>\s/g, '') // Blockquotes
    .replace(/[-*+]\s/g, '') // Lists
    .replace(/\n+/g, ' ') // Multiple newlines
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}
