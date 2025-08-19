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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold mb-8">All Posts</h1>
        <PostList posts={posts} />
      </div>
    </div>
  );
}
