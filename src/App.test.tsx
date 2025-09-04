import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from './App';

describe('App Routing', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    // Reset URL to root
    window.history.pushState({}, '', '/');
  });

  it('renders home page by default', () => {
    act(() => {
      render(<App />);
    });
    expect(screen.getByText('Welcome to My Blog')).toBeInTheDocument();
  });

  it('navigates to Posts page', async () => {
    act(() => {
      render(<App />);
    });

    const postsLink = screen.getByRole('link', { name: /posts/i });
    await act(async () => {
      fireEvent.click(postsLink);
      // Wait for async loading to complete
      await screen.findByText('All Posts');
    });

    expect(screen.getByText('All Posts')).toBeInTheDocument();
  });

  it('navigates to About page', () => {
    act(() => {
      render(<App />);
    });

    const aboutLink = screen.getByRole('link', { name: /about/i });
    act(() => {
      fireEvent.click(aboutLink);
    });

    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
  });

  it('shows 404 page for unknown routes', () => {
    window.history.pushState({}, '', '/unknown-route');
    act(() => {
      render(<App />);
    });

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('navigates back to home from 404 page', () => {
    window.history.pushState({}, '', '/unknown-route');
    act(() => {
      render(<App />);
    });

    const homeButton = screen.getByRole('button', { name: /go home/i });
    act(() => {
      fireEvent.click(homeButton);
    });

    expect(screen.getByText('Welcome to My Blog')).toBeInTheDocument();
  });

  it('includes sidebar and footer on all pages', () => {
    act(() => {
      render(<App />);
    });

    // Check sidebar brand is present (use getAllByText since it appears in both sidebar and mobile header)
    expect(screen.getAllByText('My Blog')).toHaveLength(2);

    // Check footer is present
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`, 'i'))
    ).toBeInTheDocument();

    // Navigate to another page and check again
    const postsLink = screen.getByRole('link', { name: /posts/i });
    act(() => {
      fireEvent.click(postsLink);
    });

    // Sidebar should still be present
    expect(screen.getAllByText('My Blog')).toHaveLength(2);
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`, 'i'))
    ).toBeInTheDocument();
  });

  it('maintains theme toggle functionality across pages', () => {
    act(() => {
      render(<App />);
    });

    // Theme toggle now in sidebar with enhanced aria-label
    const themeButton = screen.getByRole('button', { name: /테마 전환/i });
    expect(themeButton).toBeInTheDocument();

    // Navigate to another page
    const postsLink = screen.getByRole('link', { name: /posts/i });
    act(() => {
      fireEvent.click(postsLink);
    });

    // Theme button should still be present in sidebar
    expect(
      screen.getByRole('button', { name: /테마 전환/i })
    ).toBeInTheDocument();
  });
});
