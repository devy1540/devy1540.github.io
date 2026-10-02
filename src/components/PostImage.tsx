import type { ComponentPropsWithoutRef } from "react"
import images from "virtual:post-images"

export function PostImage({ src, alt = "", ...props }: ComponentPropsWithoutRef<"img">) {
  const asset = src ? images[src] : undefined
  return <img {...props} alt={alt} src={asset?.src ?? src} srcSet={asset?.srcSet ?? props.srcSet}
    width={asset?.width ?? props.width} height={asset?.height ?? props.height}
    sizes={asset ? "(max-width: 767px) calc(100vw - 2rem), 800px" : props.sizes}
    loading={props.loading ?? "lazy"} decoding="async" />
}
