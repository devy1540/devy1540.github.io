import { Link } from 'react-router-dom';
import type { Post } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatReadingTime } from '@/utils/reading-time';
import { Calendar, Clock, Tag } from 'lucide-react';

interface PostListProps {
  posts: Post[];
  showExcerpt?: boolean;
}

export function PostList({ posts, showExcerpt = true }: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No posts available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.slug}
          to={`/post/${post.slug}`}
          className="block transition-transform hover:scale-[1.02]"
        >
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  {showExcerpt && (
                    <CardDescription className="mt-2 line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  )}
                </div>
                {post.category && (
                  <Badge variant="secondary">{post.category}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatReadingTime(post.readingTime)}</span>
                  </div>
                )}
                {post.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs">
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
