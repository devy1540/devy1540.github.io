import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggleFloating } from '@/components/layout/ThemeToggleFloating';

// 테스트 환경에서 매치미디어 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

describe('ThemeToggleFloating Accessibility', () => {
  it('should have proper ARIA label', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toMatch(/테마 선택/);
  });

  it('should be focusable with keyboard', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('should have proper focus styles', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-ring');
    expect(button).toHaveClass('focus-visible:ring-offset-2');
  });

  it('should meet minimum touch target size', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('min-w-[44px]');
  });

  it('should have proper positioning classes', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('fixed');
    expect(button).toHaveClass('bottom-4');
    expect(button).toHaveClass('right-4');
    expect(button).toHaveClass('md:bottom-6');
    expect(button).toHaveClass('md:right-6');
  });
});