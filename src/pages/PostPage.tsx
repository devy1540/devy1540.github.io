import { type ComponentPropsWithoutRef, useEffect } from "react"
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
import { usePostContent } from "@/hooks/usePostData"
import { getReadingMinutes } from "@/lib/reading-time"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageContainer } from "@/components/PageContainer"
import { TableOfContents } from "@/components/TableOfContents"
import { Comments } from "@/components/Comments"
import { SeriesNavigator } from "@/components/SeriesNavigator"
import { AlertCircle, ArrowLeft, ArrowRight, Clock, Eye } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { usePageViews } from "@/hooks/usePageViews"
import { analytics } from "@/lib/analytics"
import { useLanguage } from "@/i18n"
import { localizePath, postPath } from "@/lib/i18n-routing"
import type { Language } from "@/i18n"
import { StructuredData } from "@/components/StructuredData"
import { postStructuredData } from "@/lib/structured-data"
import { MarkdownChart } from "@/components/MarkdownChart"
import { readMarkdownCode } from "@/lib/markdown-code"
import { createRetryableLoader } from "@/lib/async-loader"
import { useDeferredModule } from "@/hooks/useDeferredModule"

const loadCodeBlock = createRetryableLoader(() => import("@/components/CodeBlock"))

function localizeMarkdownLink(href: string, language: Language) {
  if (/^\/(posts|tags|series|search|analytics|about)(\/|[?#]|$)/.test(href)) {
    return localizePath(href, language)
  }
  return href
}

function CodeBlockFallback({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      {...props}
      className="not-prose my-5 overflow-x-auto rounded-lg border border-border bg-secondary p-4 text-sm text-secondary-foreground"
    >
      {children}
    </pre>
  )
}

function MarkdownCodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const { language, code } = readMarkdownCode(props.children)
  if (language === "chart") return <MarkdownChart key={code} source={code} />
  return <HydratedCodeBlock {...props} />
}

function HydratedCodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const { value: module, error, retry } = useDeferredModule(loadCodeBlock)
  const { t } = useLanguage()
  if (module) return <module.CodeBlock {...props} />
  return (
    <>
      {error && <div className="not-prose flex flex-wrap items-center gap-3 text-sm text-muted-foreground" role="alert">
        <p>{t.components.codeLoadError}</p>
        <Button variant="outline" size="sm" onClick={retry}>{t.common.retry}</Button>
      </div>}
      <CodeBlockFallback {...props} />
    </>
  )
}

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { language, setLanguage, t } = useLanguage()
  const body = usePostContent(slug, language)
  const post = slug ? getPostBySlug(slug, language) : undefined
  const fallbackPost = !post && slug && language === "en" ? getPostBySlug(slug, "ko") : undefined
  const { prev, next } = slug && post ? getAdjacentPosts(slug, language) : { prev: null, next: null }
  const { getPostViews } = usePageViews()
  const views = slug ? getPostViews(slug, language) : null
  const availableLanguages = post?.availableLanguages ?? fallbackPost?.availableLanguages ?? []

  const isDraft = post?.draft ?? false
  const isScheduled = !!(post?.publishDate && post.publishDate > new Date().toISOString().split("T")[0]!)

  useMetaTags({
    title: fallbackPost ? t.post.translationUnavailableTitle : post?.title,
    description: fallbackPost ? t.post.translationUnavailableDescription : post?.description,
    url: slug ? postPath(slug, language) : undefined,
    type: "article",
    noindex: !post || isDraft || isScheduled,
    canonicalPath: fallbackPost && slug ? postPath(slug, "ko") : undefined,
    alternateUrls: slug ? {
      ...(availableLanguages.includes("ko") ? { ko: postPath(slug, "ko") } : {}),
      ...(availableLanguages.includes("en") ? { en: postPath(slug, "en") } : {}),
    } : undefined,
  })

  useEffect(() => {
    if (post && slug) {
      analytics.viewPost(post.title, slug)
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!post && fallbackPost && slug) {
    return (
      <PageContainer className="py-16">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to={localizePath("/posts", language)} viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.post.backToList}
          </Link>
        </Button>

        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription className="space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {t.post.translationUnavailableTitle}
              </h1>
              <p className="mt-1 text-sm">
                {t.post.translationUnavailableDescription}
              </p>
            </div>
            <Button asChild size="sm">
              <Link to={postPath(slug, "ko")} viewTransition>
                {t.post.readKoreanPost}
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  if (!post) {
    return (
      <PageContainer className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">{t.post.notFound}</h1>
        <Button asChild variant="ghost">
          <Link to={localizePath("/", language)} viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.post.backToHome}
          </Link>
        </Button>
      </PageContainer>
    )
  }

  return (
    <div className="post-page-layout relative">
      {body.loaded && !isDraft && !isScheduled && <StructuredData data={postStructuredData(post)} />}
      <PageContainer as="article" variant="article" className="post-article-centered min-w-0">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to={localizePath("/posts", language)} viewTransition>
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
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.date}>{post.date}</time>
            {post.updated && post.updated !== post.date && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.updated}>{t.post.updatedAt(post.updated)}</time>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{t.post.readingTime(post.readingMinutes ?? getReadingMinutes(post.content))}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              <span suppressHydrationWarning>{(views ?? 0).toLocaleString()}</span> {t.post.views}
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
          {availableLanguages.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-medium text-muted-foreground">
                {t.post.translation}
              </span>
              {availableLanguages.map((availableLanguage) => (
                <Button
                  key={availableLanguage}
                  asChild
                  size="sm"
                  variant={availableLanguage === language ? "default" : "outline"}
                  className="h-8"
                >
                  <Link
                    to={postPath(post.slug, availableLanguage)}
                    viewTransition
                    onClick={() => setLanguage(availableLanguage)}
                  >
                    {availableLanguage === "ko" ? t.post.languageKo : t.post.languageEn}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </header>

        <Separator className="mb-8" />

        {post.series && (
          <SeriesNavigator series={post.series} currentSlug={post.slug} language={language} />
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {!body.loaded ? (
            <div className="not-prose rounded-lg border p-6" role="status">
              <p>{body.error ? t.common.postLoadError : t.common.postLoading}</p>
              {body.error && <Button className="mt-3" onClick={() => window.location.reload()}>{t.common.retry}</Button>}
            </div>
          ) : <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeCodeBrFix, rehypeSlug]}
            components={{
              pre: MarkdownCodeBlock,
              a: ({ href, children, ...props }) => {
                if (href?.startsWith("/")) {
                  return <Link to={localizeMarkdownLink(href, language)} viewTransition {...props}>{children}</Link>
                }
                return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
              },
            }}
          >
            {post.content}
          </ReactMarkdown>}
        </div>

        {(prev || next) && (
          <>
            <Separator className="my-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {prev ? (
                <Link
                  to={postPath(prev.slug, prev.language)} viewTransition
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
                  to={postPath(next.slug, next.language)} viewTransition
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
      </PageContainer>

      <div className="post-toc-layer">
        {body.loaded && <TableOfContents key={`${language}:${slug}`} />}
      </div>
    </div>
  )
}
