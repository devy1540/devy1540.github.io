/**
 * Calculate estimated reading time for content
 * Based on average reading speed of 200-250 words per minute
 */
export function calculateReadingTime(content: string): number {
  // Average reading speed (words per minute)
  const WORDS_PER_MINUTE = 225;
  
  // Remove markdown syntax for more accurate word count
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/```[^`]*```/g, '') // Code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/>\s/g, '') // Blockquotes
    .replace(/[-*+]\s/g, '') // Lists
    .replace(/\|.*\|/g, '') // Tables
    .replace(/\n+/g, ' ') // Multiple newlines
    .trim();
  
  // Count words (including Korean text)
  const wordCount = countWords(plainText);
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);
  
  // Minimum 1 minute
  return Math.max(1, readingTime);
}

/**
 * Count words including proper handling of Korean text
 */
function countWords(text: string): number {
  if (!text) return 0;
  
  // Split by whitespace for English words
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  
  // Count Korean characters (each character is roughly equivalent to a word)
  const koreanCharacters = text.match(/[가-힣]/g) || [];
  
  // Korean characters are typically read faster, so we apply a factor
  const koreanWordEquivalent = Math.ceil(koreanCharacters.length * 0.5);
  
  return englishWords.length + koreanWordEquivalent;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}
