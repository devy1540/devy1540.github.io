import type { Language } from "@/i18n"

export interface PostMeta {
  slug: string
  language: Language
  availableLanguages: Language[]
  title: string
  date: string
  updated?: string
  description: string
  tags: string[]
  series?: string
  seriesOrder?: number
  draft?: boolean
  publishDate?: string
}

export interface Post extends PostMeta {
  content: string
}
