export function getReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}
