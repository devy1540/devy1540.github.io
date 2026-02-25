import { type ComponentPropsWithoutRef } from "react"

export function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  // code 태그에서 언어 클래스 추출
  const codeEl = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
  const className = codeEl?.props?.className || ""
  const match = className.match(/language-(\w+)/)
  const language = match ? match[1] : ""

  return (
    <div className="not-prose my-5 rounded-lg border border-border overflow-hidden bg-secondary">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        {language && (
          <span className="ml-auto text-xs text-muted-foreground">{language}</span>
        )}
      </div>
      <pre
        {...props}
        className="m-0 rounded-none border-0 bg-secondary text-secondary-foreground overflow-x-auto p-4"
      >
        {children}
      </pre>
    </div>
  )
}
