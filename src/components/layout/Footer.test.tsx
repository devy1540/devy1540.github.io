import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders copyright text with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    
    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    expect(githubLink).toHaveAttribute('target', '_blank');
    
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com');
    
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
    
    const emailLink = screen.getByRole('link', { name: /email/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@example.com');
  });

  it('has proper social link attributes for security', () => {
    render(<Footer />);
    
    const externalLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('target') === '_blank'
    );
    
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('uses responsive layout classes', () => {
    const { container } = render(<Footer />);
    const footerContent = container.querySelector('.flex-col.md\\:flex-row');
    expect(footerContent).toBeInTheDocument();
  });
});
