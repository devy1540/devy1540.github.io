// Core types for the blog application

export interface Post {
  title: string;
  slug: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  category: string;
  tags: string[];
  excerpt: string;
  thumbnail?: string;
  readingTime?: number;
  content?: string;
  metadata?: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
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