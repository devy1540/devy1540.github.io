// Core types for the blog application

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  isDraft: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  tags: string[];
  thumbnail: string | null;
  readingTime: number;
  metadata: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface NavigationItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  badge?: string;
}

export interface SocialLink {
  href: string;
  label: string;
  icon: React.ComponentType;
  external?: boolean;
}