import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PostList } from './PostList';
import type { Post } from '@/types';

const mockPosts: Post[] = [
  {
    title: 'Test Post 1',
    slug: 'test-post-1',
    isDraft: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    publishedAt: '2024-01-01T00:00:00Z',
    category: 'Test',
    tags: ['test', 'sample'],
    excerpt: 'This is a test excerpt',
    readingTime: 5,
  },
  {
    title: 'Test Post 2',
    slug: 'test-post-2',
    isDraft: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    publishedAt: '2024-01-02T00:00:00Z',
    category: 'Development',
    tags: ['dev'],
    excerpt: 'Another test excerpt',
    readingTime: 3,
  },
];

describe('PostList', () => {
  it('renders posts correctly', () => {
    render(
      <BrowserRouter>
        <PostList posts={mockPosts} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('shows excerpts when showExcerpt is true', () => {
    render(
      <BrowserRouter>
        <PostList posts={mockPosts} showExcerpt={true} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
    expect(screen.getByText('Another test excerpt')).toBeInTheDocument();
  });

  it('hides excerpts when showExcerpt is false', () => {
    render(
      <BrowserRouter>
        <PostList posts={mockPosts} showExcerpt={false} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('This is a test excerpt')).not.toBeInTheDocument();
    expect(screen.queryByText('Another test excerpt')).not.toBeInTheDocument();
  });

  it('displays empty state when no posts', () => {
    render(
      <BrowserRouter>
        <PostList posts={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('No posts available yet.')).toBeInTheDocument();
  });

  it('displays reading time', () => {
    render(
      <BrowserRouter>
        <PostList posts={mockPosts} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('3 min read')).toBeInTheDocument();
  });

  it('displays categories', () => {
    render(
      <BrowserRouter>
        <PostList posts={mockPosts} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('displays tags', () => {
    render(
      <BrowserRouter>
        <PostList posts={mockPosts} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#sample')).toBeInTheDocument();
    expect(screen.getByText('#dev')).toBeInTheDocument();
  });
});
