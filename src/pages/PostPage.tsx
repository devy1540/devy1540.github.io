import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import { getPostBySlug, getAdjacentPosts } from "@/lib/posts"
import { getReadingTime } from "@/lib/reading-time"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TableOfContents } from "@/components/TableOfContents"
import { CodeBlock } from "@/components/CodeBlock"
import { Comments } from "@/components/Comments"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined
  const { prev, next } = slug ? getAdjacentPosts(slug) : { prev: null, next: null }

  useEffect(() => {
    document.title = post ? `${post.title} | Devy's Blog` : "Devy's Blog"
    return () => {
      document.title = "Devy's Blog"
    }
  }, [post])

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">글을 찾을 수 없습니다</h1>
        <Button asChild variant="ghost">
          <Link to="/" viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto flex gap-16 xl:gap-24">
      <article className="min-w-0 flex-1 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/" viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Link>
        </Button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.date}>{post.date}</time>
            <span aria-hidden>·</span>
            <span>{getReadingTime(post.content)}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <Separator className="mb-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{ pre: CodeBlock }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {(prev || next) && (
          <>
            <Separator className="my-10" />
            <div className="flex justify-between gap-4">
              {prev ? (
                <Link
                  to={`/posts/${prev.slug}`} viewTransition
                  className="group flex flex-col gap-1 max-w-[45%]"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowLeft className="size-3" />
                    이전 글
                  </span>
                  <span className="text-sm font-medium group-hover:text-foreground/80 transition-colors truncate">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  to={`/posts/${next.slug}`} viewTransition
                  className="group flex flex-col items-end gap-1 max-w-[45%]"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    다음 글
                    <ArrowRight className="size-3" />
                  </span>
                  <span className="text-sm font-medium group-hover:text-foreground/80 transition-colors truncate">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </>
        )}

        <Comments />
      </article>

      <TableOfContents />
    </div>
  )
}
