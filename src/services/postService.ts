import type { Post } from '@/types';
import { parseMarkdown, generateSlug, extractExcerpt } from '@/utils/markdown';
import { calculateReadingTime } from '@/utils/reading-time';

// In a real implementation, this would fetch from GitHub API or local files
// For now, we'll use mock data that simulates reading from /content/posts

/**
 * Mock post data simulating markdown files in /content/posts/
 */
const MOCK_POSTS_DATA = [
  {
    filename: 'getting-started-with-react.md',
    content: `---
title: "Getting Started with React"
slug: "getting-started-with-react"
isDraft: false
createdAt: "2024-12-19T09:00:00Z"
updatedAt: "2024-12-19T14:30:00Z"
publishedAt: "2024-12-19T10:00:00Z"
category: "Tutorial"
tags: ["react", "javascript", "web development"]
excerpt: "Learn the basics of React and component-based development with this comprehensive guide."
thumbnail: "/images/react-tutorial.png"
---

# Getting Started with React

React is a powerful JavaScript library for building user interfaces. In this tutorial, we'll explore the fundamentals of React and how to get started with component-based development.

## What is React?

React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".

## Key Concepts

### Components

Components are the building blocks of any React application. They are reusable pieces of code that return a React element to be rendered to the page.

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### Props

Props (short for properties) are a way of passing data from parent to child components.

### State

State is similar to props, but it is private and fully controlled by the component.

## Getting Started

To get started with React, you'll need Node.js installed on your machine. Then you can create a new React app using:

\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

This will create a new React application and start the development server.

## Conclusion

React provides a powerful way to build modern web applications. With its component-based architecture and rich ecosystem, you can create anything from simple websites to complex applications.`
  },
  {
    filename: 'typescript-best-practices.md',
    content: `---
title: "TypeScript Best Practices"
slug: "typescript-best-practices"
isDraft: false
createdAt: "2024-12-18T09:00:00Z"
updatedAt: "2024-12-18T14:30:00Z"
publishedAt: "2024-12-18T10:00:00Z"
category: "Development"
tags: ["typescript", "javascript", "best practices"]
excerpt: "Essential TypeScript patterns and best practices for writing clean, maintainable code."
thumbnail: "/images/typescript-guide.png"
---

# TypeScript Best Practices

TypeScript adds static typing to JavaScript, helping you catch errors early and write more maintainable code. Here are some best practices to follow.

## Use Strict Mode

Always enable strict mode in your \`tsconfig.json\`:

\`\`\`json
{
  "compilerOptions": {
    "strict": true
  }
}
\`\`\`

## Define Explicit Types

Don't rely on type inference for public APIs:

\`\`\`typescript
// Bad
function calculate(a, b) {
  return a + b;
}

// Good
function calculate(a: number, b: number): number {
  return a + b;
}
\`\`\`

## Use Interfaces for Object Shapes

Interfaces are more flexible than type aliases for object shapes:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}
\`\`\`

## Avoid \`any\` Type

The \`any\` type defeats the purpose of TypeScript. Use \`unknown\` when you don't know the type:

\`\`\`typescript
// Bad
function process(data: any) {
  // ...
}

// Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Now TypeScript knows data is a string
  }
}
\`\`\`

## Conclusion

Following these TypeScript best practices will help you write more robust and maintainable code.`
  },
  {
    filename: 'building-modern-blog.md',
    content: `---
title: "Building a Modern Blog with React"
slug: "building-modern-blog"
isDraft: false
createdAt: "2024-12-17T09:00:00Z"
updatedAt: "2024-12-17T14:30:00Z"
publishedAt: "2024-12-17T10:00:00Z"
category: "Project"
tags: ["react", "blog", "tutorial", "markdown"]
excerpt: "Step-by-step guide to creating a modern blog with React, TypeScript, and Markdown."
thumbnail: "/images/blog-project.png"
---

# Building a Modern Blog with React

Creating a blog is a great way to learn web development. In this guide, we'll build a modern blog using React, TypeScript, and Markdown.

## Project Setup

First, let's set up our project with Vite:

\`\`\`bash
npm create vite@latest my-blog -- --template react-ts
cd my-blog
npm install
\`\`\`

## Installing Dependencies

We'll need several packages for our blog:

\`\`\`bash
npm install react-router-dom react-markdown gray-matter
npm install -D @types/react-router-dom
\`\`\`

## Project Structure

Organize your project like this:

\`\`\`
src/
├── components/
│   ├── Layout.tsx
│   ├── PostList.tsx
│   └── PostDetail.tsx
├── pages/
│   ├── Home.tsx
│   └── Post.tsx
├── content/
│   └── posts/
│       └── *.md
└── utils/
    └── markdown.ts
\`\`\`

## Creating the Post Component

Here's a simple post component:

\`\`\`tsx
import ReactMarkdown from 'react-markdown';

function PostDetail({ content }: { content: string }) {
  return (
    <article className="prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
\`\`\`

## Routing

Set up routing with React Router:

\`\`\`tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:slug" element={<Post />} />
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

## Conclusion

With these foundations, you can build a fully functional blog. Add features like categories, tags, and search to make it even better!`
  }
];

/**
 * PostManager implementation for managing blog posts
 */
class PostManager {
  private posts: Post[] = [];
  private initialized = false;

  /**
   * Initialize posts from mock data
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    this.posts = MOCK_POSTS_DATA.map(({ content }) => {
      const { data, content: markdownContent } = parseMarkdown(content);
      const readingTime = calculateReadingTime(markdownContent);
      
      return {
        ...data,
        content: markdownContent,
        readingTime,
        excerpt: data.excerpt || extractExcerpt(markdownContent),
      } as Post;
    });

    this.initialized = true;
  }

  /**
   * Get all posts with optional filtering
   */
  async getPosts(filters?: {
    category?: string;
    tag?: string;
    isDraft?: boolean;
  }): Promise<Post[]> {
    await this.initialize();
    
    let filteredPosts = [...this.posts];
    
    if (filters) {
      if (filters.category) {
        filteredPosts = filteredPosts.filter(
          post => post.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }
      
      if (filters.tag) {
        filteredPosts = filteredPosts.filter(
          post => post.tags.some(tag => 
            tag.toLowerCase() === filters.tag?.toLowerCase()
          )
        );
      }
      
      if (filters.isDraft !== undefined) {
        filteredPosts = filteredPosts.filter(
          post => post.isDraft === filters.isDraft
        );
      }
    }
    
    // Sort by published date (newest first)
    return filteredPosts.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Get a single post by slug
   */
  async getPost(slug: string): Promise<Post | null> {
    await this.initialize();
    return this.posts.find(post => post.slug === slug) || null;
  }

  /**
   * Create a new post (for future use)
   */
  async createPost(data: Partial<Post>): Promise<Post> {
    const newPost: Post = {
      title: data.title || 'Untitled',
      slug: data.slug || generateSlug(data.title || 'untitled'),
      isDraft: data.isDraft ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: data.isDraft ? undefined : new Date().toISOString(),
      category: data.category || 'uncategorized',
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      thumbnail: data.thumbnail,
      content: data.content || '',
      readingTime: calculateReadingTime(data.content || ''),
      metadata: data.metadata,
    };
    
    this.posts.push(newPost);
    return newPost;
  }

  /**
   * Update an existing post (for future use)
   */
  async updatePost(slug: string, data: Partial<Post>): Promise<Post | null> {
    const index = this.posts.findIndex(post => post.slug === slug);
    if (index === -1) return null;
    
    const updatedPost = {
      ...this.posts[index],
      ...data,
      updatedAt: new Date().toISOString(),
      readingTime: data.content 
        ? calculateReadingTime(data.content)
        : this.posts[index].readingTime,
    };
    
    this.posts[index] = updatedPost;
    return updatedPost;
  }

  /**
   * Delete a post (for future use)
   */
  async deletePost(slug: string): Promise<boolean> {
    const index = this.posts.findIndex(post => post.slug === slug);
    if (index === -1) return false;
    
    this.posts.splice(index, 1);
    return true;
  }

  /**
   * Toggle draft status (for future use)
   */
  async toggleDraft(slug: string): Promise<Post | null> {
    const post = this.posts.find(p => p.slug === slug);
    if (!post) return null;
    
    post.isDraft = !post.isDraft;
    post.updatedAt = new Date().toISOString();
    
    if (!post.isDraft && !post.publishedAt) {
      post.publishedAt = new Date().toISOString();
    }
    
    return post;
  }
}

// Export singleton instance
export const postService = new PostManager();
