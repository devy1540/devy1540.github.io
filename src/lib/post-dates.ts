export interface PostDates {
  date: string
  updated?: string
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false

  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function getPostModifiedDate(post: PostDates): string {
  return post.updated || post.date
}

export function hasDistinctUpdatedDate(post: PostDates): boolean {
  return Boolean(post.updated && post.updated !== post.date)
}

export function assertValidPostDates(
  post: PostDates,
  today = new Date().toISOString().slice(0, 10),
): void {
  if (!isValidIsoDate(post.date)) {
    throw new Error(`Post publication date must be a valid YYYY-MM-DD value: ${post.date || "(missing)"}`)
  }

  if (!post.updated) return

  if (!isValidIsoDate(post.updated)) {
    throw new Error(`Post updated date must be a valid YYYY-MM-DD value: ${post.updated}`)
  }

  if (post.updated < post.date) {
    throw new Error(`Post updated date ${post.updated} is before publication date ${post.date}`)
  }

  if (post.updated > today) {
    throw new Error(`Post updated date ${post.updated} cannot be in the future (today: ${today})`)
  }
}
