import { describe, it, expect, vi } from 'vitest';
import {
  parseFrontmatter,
  combineFrontmatterAndContent,
  generateSlug,
  calculateReadingTime,
  validateMetadata,
} from '../frontmatter';
import type { Post } from '@/types';

describe('frontmatter utilities', () => {
  describe('parseFrontmatter', () => {
    it('parses valid frontmatter using gray-matter', () => {
      const markdown = `---
title: Test Post
slug: test-post
isDraft: false
tags:
  - react
  - typescript
---

# Test Content

This is the content.`;

      const result = parseFrontmatter(markdown);

      expect(result.metadata.title).toBe('Test Post');
      expect(result.metadata.slug).toBe('test-post');
      expect(result.metadata.isDraft).toBe(false);
      expect(result.metadata.tags).toEqual(['react', 'typescript']);
      expect(result.content.trim()).toBe(
        '# Test Content\n\nThis is the content.'
      );
    });

    it('returns original content when no frontmatter', () => {
      const markdown = '# Just Content\n\nNo frontmatter here.';
      const result = parseFrontmatter(markdown);
      expect(result.metadata).toEqual({});
      expect(result.content).toBe(markdown);
    });

    it('handles YAML parsing errors gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const markdown = `---
title: Test Post
invalid: yaml: content
---

Content here.`;
      const result = parseFrontmatter(markdown);
      expect(result.metadata).toEqual({});
      expect(result.content).toBe(markdown);

      consoleSpy.mockRestore();
    });
  });

  describe('combineFrontmatterAndContent', () => {
    it('combines metadata and content using gray-matter', () => {
      const metadata: Partial<Post> = {
        title: 'Test Post',
        tags: ['react'],
      };
      const content = '# Test Content';

      const result = combineFrontmatterAndContent(metadata, content);

      expect(result).toContain('---');
      expect(result).toContain('title: Test Post');
      expect(result).toContain('tags:\n  - react');
      expect(result).toContain('---');
      expect(result).toContain('# Test Content');
    });

    it('returns just content when metadata is empty', () => {
      const metadata: Partial<Post> = {};
      const content = '# Test Content';
      const result = combineFrontmatterAndContent(metadata, content);
      expect(result).toBe(content);
    });

    it('filters out null and empty values from metadata', () => {
      const metadata: Partial<Post> = {
        title: 'Test Post',
        excerpt: '',
        thumbnail: null,
      };
      const content = '# Test Content';
      const result = combineFrontmatterAndContent(metadata, content);
      expect(result).not.toContain('excerpt');
      expect(result).not.toContain('thumbnail');
    });
  });

  describe('generateSlug', () => {
    it('converts title to slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('handles Korean text', () => {
      expect(generateSlug('리액트 성능 최적화')).toBe('리액트-성능-최적화');
    });

    it('removes special characters but keeps spaces and hyphens for processing', () => {
      expect(generateSlug('Hello@World! (New)')).toBe('helloworld-new');
    });

    it('handles multiple spaces and hyphens', () => {
      expect(generateSlug('Hello   World--Test')).toBe('hello-world-test');
    });
  });

  describe('calculateReadingTime', () => {
    it('calculates reading time correctly', () => {
      const words = Array(200).fill('word').join(' ');
      expect(calculateReadingTime(words)).toBe(1);
    });

    it('returns minimum 1 minute for short text', () => {
      expect(calculateReadingTime('Short text')).toBe(1);
    });
  });

  describe('validateMetadata', () => {
    it('validates required fields successfully', () => {
      const metadata: Partial<Post> = {
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        category: 'tech',
      };
      const result = validateMetadata(metadata);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const metadata: Partial<Post> = { title: '' };
      const result = validateMetadata(metadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('제목은 필수입니다');
      expect(result.errors).toContain('슬러그는 필수입니다');
    });
  });
});
