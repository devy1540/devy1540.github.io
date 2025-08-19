import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders headings correctly', () => {
    const content = `
# Heading 1
## Heading 2
### Heading 3
    `;
    
    render(<MarkdownRenderer content={content} />);
    
    // Check heading levels exist (they're wrapped in links due to rehype-autolink-headings)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    
    // Check the text content is present
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Heading 3')).toBeInTheDocument();
  });

  it('renders paragraphs', () => {
    const content = 'This is a paragraph with some text.';
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('This is a paragraph with some text.')).toBeInTheDocument();
  });

  it('renders lists correctly', () => {
    const content = `
- Item 1
- Item 2
- Item 3

1. First
2. Second
3. Third
    `;
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders links with correct attributes', () => {
    const content = '[Internal Link](/about) and [External Link](https://example.com)';
    
    render(<MarkdownRenderer content={content} />);
    
    const internalLink = screen.getByRole('link', { name: 'Internal Link' });
    const externalLink = screen.getByRole('link', { name: 'External Link' });
    
    expect(internalLink).toHaveAttribute('href', '/about');
    expect(internalLink).not.toHaveAttribute('target');
    
    expect(externalLink).toHaveAttribute('href', 'https://example.com');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders inline code', () => {
    const content = 'Use `npm install` to install dependencies.';
    
    render(<MarkdownRenderer content={content} />);
    
    const codeElement = screen.getByText('npm install');
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement).toHaveClass('px-1.5', 'py-0.5', 'rounded', 'bg-muted');
  });

  it('renders code blocks', () => {
    const content = `
\`\`\`javascript
const test = 'example';
\`\`\`
    `;
    
    render(<MarkdownRenderer content={content} />);
    
    // Check that code block is rendered with correct class
    const codeBlock = document.querySelector('code.language-javascript');
    expect(codeBlock).toBeInTheDocument();
    
    // Check that language-specific pre element exists
    const preElement = document.querySelector('pre.language-javascript');
    expect(preElement).toBeInTheDocument();
    
    // Check individual keywords are present (Prism.js tokenizes them)
    expect(screen.getByText('const')).toBeInTheDocument();
    expect(screen.getByText("'example'")).toBeInTheDocument();
  });

  it('renders blockquotes', () => {
    const content = '> This is a blockquote';
    
    render(<MarkdownRenderer content={content} />);
    
    const blockquote = screen.getByText('This is a blockquote').closest('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveClass('border-l-4', 'border-primary', 'pl-4', 'italic');
  });

  it('renders tables', () => {
    const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
    `;
    
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 4')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const content = '# Test';
    
    const { container } = render(
      <MarkdownRenderer content={content} className="custom-class" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });
});
