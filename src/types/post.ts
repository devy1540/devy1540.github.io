export interface PostMeta {
  slug: string
  title: string
  date: string
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
