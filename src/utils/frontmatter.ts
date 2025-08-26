import matter from 'gray-matter';
import type { Post } from '@/types';

/**
 * Parses YAML frontmatter from markdown content using gray-matter.
 */
export function parseFrontmatter(markdown: string): {
  metadata: Partial<Post>;
  content: string;
} {
  try {
    const { data, content } = matter(markdown);
    return { metadata: data as Partial<Post>, content };
  } catch (error) {
    console.warn('Failed to parse frontmatter:', error);
    return { metadata: {}, content: markdown };
  }
}

/**
 * Combines frontmatter and content into a complete markdown string using gray-matter.
 */
export function combineFrontmatterAndContent(
  metadata: Partial<Post>,
  content: string
): string {
  // Filter out empty or null values from metadata before stringifying
  const filteredMetadata = Object.fromEntries(
    Object.entries(metadata).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    )
  );

  if (Object.keys(filteredMetadata).length === 0) {
    return content;
  }

  return matter.stringify(content, filteredMetadata);
}

/**
 * Generates a slug from a title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // Allow spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculates reading time in minutes.
 */
export function calculateReadingTime(content: string): number {
  const plainText = content
    .replace(/!(\[[^\]]*\])(\([^)]*\))/g, '') // Remove images
    .replace(/(\[[^\]]*\])(\([^)]*\))/g, '') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/#+\s/g, '') // Remove headers
    .replace(/[*_~]/g, '') // Remove emphasis
    .replace(/\n/g, ' '); // Replace newlines with spaces

  const words = plainText.trim().split(/\s+/).filter(Boolean);
  const wordsPerMinute = 200; // Average reading speed

  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

/**
 * Validates metadata for completeness.
 */
export function validateMetadata(metadata: Partial<Post>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.title?.trim()) {
    errors.push('제목은 필수입니다');
  }

  if (!metadata.slug?.trim()) {
    errors.push('슬러그는 필수입니다');
  }

  if (!metadata.excerpt?.trim()) {
    errors.push('요약은 필수입니다');
  }

  if (!metadata.category?.trim()) {
    errors.push('카테고리는 필수입니다');
  }

  // Validate slug format
  if (metadata.slug && !/^[a-z0-9가-힣-]+$/.test(metadata.slug)) {
    errors.push('슬러그는 영문, 숫자, 한글, 하이픈만 사용할 수 있습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
