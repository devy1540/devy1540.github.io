import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

type PageContainerVariant = "default" | "wide" | "article"

type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
  as?: "div" | "article"
  variant?: PageContainerVariant
}

const variantClassName: Record<PageContainerVariant, string> = {
  default: "page-container-default",
  wide: "page-container-wide",
  article: "page-container-article",
}

export function PageContainer({
  as: Component = "div",
  variant = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn("page-container", variantClassName[variant], className)}
      {...props}
    />
  )
}
