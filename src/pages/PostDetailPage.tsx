import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/post/MarkdownRenderer';
import { TableOfContents } from '@/components/post/TableOfContents';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { postService } from '@/services/postService';
import { formatReadingTime } from '@/utils/reading-time';
import type { Post } from '@/types';
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const showToast = useToastStore(state => state.showToast);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedPost = await postService.getPost(slug);
        
        if (!fetchedPost) {
          setError('Post not found');
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        setError('Failed to load post. Please try again later.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || 'Check out this post';
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        showToast('Link shared successfully!', 'success');
      } catch {
        // Share cancelled or failed - no action needed
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
      } catch {
        showToast('Failed to copy link', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full py-12">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {error || 'Post not found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/posts">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="space-y-6">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main content */}
          <article>
            {/* Post header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              
              {/* Post metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt || post.createdAt}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatReadingTime(post.readingTime)}</span>
                  </div>
                )}
                {post.category && (
                  <Badge variant="secondary">{post.category}</Badge>
                )}
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </header>

            {/* Post thumbnail */}
            {post.thumbnail && (
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full rounded-lg shadow-md mb-8"
                loading="eager"
              />
            )}

            {/* Post content */}
            <Card>
              <CardContent className="py-8">
                <MarkdownRenderer content={post.content || ''} />
              </CardContent>
            </Card>
          </article>

          {/* Sidebar with TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TableOfContents content={post.content || ''} />
            </div>
          </aside>
        </div>

        {/* Mobile TOC */}
        <div className="lg:hidden mt-8">
          <TableOfContents content={post.content || ''} />
        </div>

        {/* Navigation to next/previous posts */}
        <nav className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1">Previous post</p>
              <Link to="/posts" className="text-primary hover:underline">
                ← View all posts
              </Link>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Next post</p>
              <Link to="/posts" className="text-primary hover:underline">
                View all posts →
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
