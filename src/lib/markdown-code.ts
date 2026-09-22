import type { ReactElement, ReactNode } from "react"

function extractCode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (!node) return ""
  if (Array.isArray(node)) return node.map(extractCode).join("")
  if (typeof node === "object" && "type" in node) {
    const element = node as ReactElement<{ children?: ReactNode }>
    return element.type === "br" ? "<br/>" : extractCode(element.props.children)
  }
  return ""
}

export function readMarkdownCode(children: ReactNode) {
  const element = children as ReactElement<{ className?: string; children?: ReactNode }>
  return {
    language: element?.props?.className?.match(/language-([\w-]+)/)?.[1] ?? "",
    code: extractCode(element?.props?.children).replace(/\n$/, ""),
  }
}
