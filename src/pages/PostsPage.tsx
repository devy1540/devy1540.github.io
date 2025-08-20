import { useEffect, useState } from 'react';
import { PostList } from '@/components/post/PostList';
import { postService } from '@/services/postService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Post } from '@/types';

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await postService.getPosts({ isDraft: false });
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">All Posts</h1>
          <p className="text-muted-foreground text-lg">
            Discover all my thoughts and insights
          </p>
        </div>
        <PostList posts={posts} />
      </div>
    </div>
  );
}
