import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import type { Root, Element, Text } from "hast"

/** rehype-raw가 code 블록 안의 <br> 등을 HTML 엘리먼트로 변환하는 것을 원래 텍스트로 복원 */
function rehypeCodeBrFix() {
  return (tree: Root) => {
    ;(function walk(node: Root | Element) {
      if (!("children" in node)) return
      if ((node as Element).tagName === "code") {
        node.children = node.children.map((child) => {
          if (child.type === "element" && (child as Element).tagName === "br") {
            return { type: "text", value: "<br/>" } as Text
          }
          return child
        })
        return
      }
      for (const child of node.children) {
        if (child.type === "element") {
          walk(child as Element)
        }
      }
    })(tree)
  }
}
import { getPostBySlug, getAdjacentPosts } from "@/lib/posts"
import { getReadingTime } from "@/lib/reading-time"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TableOfContents } from "@/components/TableOfContents"
import { CodeBlock } from "@/components/CodeBlock"
import { Comments } from "@/components/Comments"
import { SeriesNavigator } from "@/components/SeriesNavigator"
import { AlertCircle, ArrowLeft, ArrowRight, Clock, Eye } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { usePageViews } from "@/hooks/usePageViews"
import { analytics, trackPageVisit } from "@/lib/analytics"
import { useT } from "@/i18n"

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined
  const { prev, next } = slug ? getAdjacentPosts(slug) : { prev: null, next: null }
  const { getPostViews } = usePageViews()
  const views = slug ? getPostViews(slug) : null
  const t = useT()

  const isDraft = post?.draft ?? false
  const isScheduled = !!(post?.publishDate && post.publishDate > new Date().toISOString().split("T")[0]!)

  useMetaTags({
    title: post?.title,
    description: post?.description,
    url: slug ? `/posts/${slug}` : undefined,
    type: "article",
    noindex: isDraft || isScheduled,
  })

  useEffect(() => {
    if (post && slug) {
      analytics.viewPost(post.title, slug)
      trackPageVisit(`/posts/${slug}`)
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">{t.post.notFound}</h1>
        <Button asChild variant="ghost">
          <Link to="/" viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.post.backToHome}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto flex gap-16 xl:gap-24">
      <article className="min-w-0 flex-1 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/" viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.post.backToList}
          </Link>
        </Button>

        <header className="mb-8">
          {import.meta.env.DEV && isDraft && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="size-4" />
              <AlertDescription>{t.post.draftBanner}</AlertDescription>
            </Alert>
          )}
          {import.meta.env.DEV && isScheduled && (
            <Alert className="mb-3 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Clock className="size-4" />
              <AlertDescription>{t.post.scheduledBanner(post!.publishDate!)}</AlertDescription>
            </Alert>
          )}
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.date}>{post.date}</time>
            <span aria-hidden>·</span>
            <span>{getReadingTime(post.content)}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {(views ?? 0).toLocaleString()} {t.post.views}
            </span>
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

        {post.series && (
          <SeriesNavigator series={post.series} currentSlug={post.slug} />
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeCodeBrFix, rehypeSlug]}
            components={{ pre: CodeBlock }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {(prev || next) && (
          <>
            <Separator className="my-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {prev ? (
                <Link
                  to={`/posts/${prev.slug}`} viewTransition
                  className="group flex flex-col gap-1 min-w-0 overflow-hidden"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowLeft className="size-3" />
                    {t.post.prevPost}
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
                  className="group flex flex-col items-end gap-1 min-w-0 overflow-hidden"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {t.post.nextPost}
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

      <TableOfContents key={slug} />
    </div>
  )
}
