import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Configure testing library for React 18 with automatic act wrapping
configure({
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: false,
});

// Silence act warnings in tests by providing global act
global.IS_REACT_ACT_ENVIRONMENT = true;
