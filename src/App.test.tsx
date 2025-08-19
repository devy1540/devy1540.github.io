import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

describe('App Routing', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    // Reset URL to root
    window.history.pushState({}, '', '/');
  });

  it('renders home page by default', () => {
    render(<App />);
    expect(screen.getByText('Welcome to My Blog')).toBeInTheDocument();
  });

  it('navigates to Posts page', async () => {
    render(<App />);
    
    const postsLink = screen.getByRole('link', { name: /posts/i });
    fireEvent.click(postsLink);
    
    // Wait for async loading to complete
    await screen.findByText('All Posts');
    expect(screen.getByText('All Posts')).toBeInTheDocument();
  });

  it('navigates to About page', () => {
    render(<App />);
    
    const aboutLink = screen.getByRole('link', { name: /about/i });
    fireEvent.click(aboutLink);
    
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
  });

  it('shows 404 page for unknown routes', () => {
    window.history.pushState({}, '', '/unknown-route');
    render(<App />);
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('navigates back to home from 404 page', () => {
    window.history.pushState({}, '', '/unknown-route');
    render(<App />);
    
    const homeButton = screen.getByRole('button', { name: /go home/i });
    fireEvent.click(homeButton);
    
    expect(screen.getByText('Welcome to My Blog')).toBeInTheDocument();
  });

  it('includes sidebar and footer on all pages', () => {
    render(<App />);
    
    // Check sidebar brand is present
    expect(screen.getByText('My Blog')).toBeInTheDocument();
    
    // Check footer is present
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument();
    
    // Navigate to another page and check again
    const postsLink = screen.getByRole('link', { name: /posts/i });
    fireEvent.click(postsLink);
    
    // Sidebar should still be present
    expect(screen.getByText('My Blog')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument();
  });

  it('maintains theme toggle functionality across pages', () => {
    render(<App />);
    
    // Theme toggle now in sidebar with enhanced aria-label
    const themeButton = screen.getByRole('button', { name: /테마 전환/i });
    expect(themeButton).toBeInTheDocument();
    
    // Navigate to another page
    const postsLink = screen.getByRole('link', { name: /posts/i });
    fireEvent.click(postsLink);
    
    // Theme button should still be present in sidebar
    expect(screen.getByRole('button', { name: /테마 전환/i })).toBeInTheDocument();
  });
});