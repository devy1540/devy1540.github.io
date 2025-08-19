import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostList } from '@/components/post/PostList';
import { postService } from '@/services/postService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Post } from '@/types';

export function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const posts = await postService.getPosts({ isDraft: false });
        setRecentPosts(posts.slice(0, 3)); // Show only 3 most recent posts
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to My Blog</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Latest blog posts and updates</CardDescription>
            <CardAction>
              <Link to="/posts">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentPosts.length > 0 ? (
              <PostList posts={recentPosts} showExcerpt={false} />
            ) : (
              <p className="text-muted-foreground">
                No posts available yet. Check back soon!
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>About This Blog</CardTitle>
              <CardDescription>Learn about the technology stack</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A modern blog built with <span className="tech-term">React</span>, <span className="tech-term">TypeScript</span>, and <span className="tech-term">Vite</span>. 
                Featuring a clean design and smooth navigation. Use <kbd>Ctrl</kbd> + <kbd>/</kbd> for keyboard shortcuts.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Updates</CardTitle>
              <CardDescription>What's new and coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay tuned for exciting content coming soon!
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm">Get Notified</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
