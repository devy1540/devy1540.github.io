import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime } from './reading-time';

describe('calculateReadingTime', () => {
  it('calculates reading time for English text', () => {
    // 225 words should be 1 minute
    const text225 = Array(225).fill('word').join(' ');
    expect(calculateReadingTime(text225)).toBe(1);
    
    // 450 words should be 2 minutes
    const text450 = Array(450).fill('word').join(' ');
    expect(calculateReadingTime(text450)).toBe(2);
    
    // 900 words should be 4 minutes
    const text900 = Array(900).fill('word').join(' ');
    expect(calculateReadingTime(text900)).toBe(4);
  });

  it('calculates reading time for Korean text', () => {
    // Korean characters are calculated differently (0.5 factor)
    // 450 Korean characters should be about 1 minute
    const korean450 = '가'.repeat(450);
    expect(calculateReadingTime(korean450)).toBe(1);
    
    // 900 Korean characters should be about 2 minutes
    const korean900 = '가'.repeat(900);
    expect(calculateReadingTime(korean900)).toBe(2);
  });

  it('calculates reading time for mixed content', () => {
    const mixed = 'Hello world ' + '안녕하세요 '.repeat(50) + 'This is a test';
    const time = calculateReadingTime(mixed);
    expect(time).toBeGreaterThan(0);
    expect(time).toBeLessThan(5);
  });

  it('returns minimum 1 minute for short text', () => {
    expect(calculateReadingTime('Short text')).toBe(1);
    expect(calculateReadingTime('한글')).toBe(1);
    expect(calculateReadingTime('')).toBe(1);
  });

  it('removes markdown syntax before calculating', () => {
    const markdown = `
# Header
## Another Header
**Bold text** and *italic text*
[Link](https://example.com)
\`\`\`
code block
\`\`\`
> Blockquote
- List item
    `;
    
    const time = calculateReadingTime(markdown);
    expect(time).toBe(1); // Should be minimal as most content is syntax
  });

  it('handles code blocks correctly', () => {
    const withCode = `
Regular text here.
\`\`\`javascript
const longCodeBlock = {
  property1: 'value',
  property2: 'value',
  property3: 'value',
  // More code...
};
\`\`\`
More regular text.
    `;
    
    const time = calculateReadingTime(withCode);
    expect(time).toBe(1);
  });
});

describe('formatReadingTime', () => {
  it('formats single minute correctly', () => {
    expect(formatReadingTime(1)).toBe('1 min read');
  });

  it('formats multiple minutes correctly', () => {
    expect(formatReadingTime(2)).toBe('2 min read');
    expect(formatReadingTime(5)).toBe('5 min read');
    expect(formatReadingTime(10)).toBe('10 min read');
  });

  it('handles zero and negative values', () => {
    expect(formatReadingTime(0)).toBe('0 min read');
    expect(formatReadingTime(-1)).toBe('-1 min read');
  });
});
