import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Fragment, createElement } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert **bold** markdown to React elements with <strong> tags */
export function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  if (parts.length === 1) return text
  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) =>
      i % 2 === 1
        ? createElement("strong", { key: i, className: "text-foreground font-semibold" }, part)
        : part
    ),
  )
}
