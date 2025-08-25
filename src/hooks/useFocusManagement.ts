import { useRef, useCallback, useEffect } from 'react';

interface FocusOptions {
  trap?: boolean;
  restoreOnUnmount?: boolean;
  initialFocus?: boolean;
}

/**
 * Hook for managing focus within a component
 * Provides focus trapping, restoration, and keyboard navigation
 */
export const useFocusManagement = (options: FocusOptions = {}) => {
  const {
    trap = false,
    restoreOnUnmount = true,
    initialFocus = false
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Store previously focused element on mount
  useEffect(() => {
    if (restoreOnUnmount) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }
  }, [restoreOnUnmount]);

  // Focus first focusable element on mount if initialFocus is true
  useEffect(() => {
    if (initialFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [initialFocus]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreOnUnmount && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [restoreOnUnmount]);

  // Get all focusable elements within container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  // Handle keyboard navigation within container
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!trap || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      // If only one focusable element, prevent tabbing
      if (focusableElements.length === 1) {
        event.preventDefault();
        return;
      }

      // Trap focus within container
      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    // Handle arrow key navigation for toolbar-like components
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
      if (currentIndex !== -1) {
        event.preventDefault();
        let nextIndex;
        
        if (event.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        } else {
          nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        }
        
        focusableElements[nextIndex]?.focus();
      }
    }

    // Handle Home/End keys
    if (event.key === 'Home') {
      event.preventDefault();
      firstElement?.focus();
    }
    
    if (event.key === 'End') {
      event.preventDefault();
      lastElement?.focus();
    }
  }, [trap, getFocusableElements]);

  // Focus first focusable element
  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [getFocusableElements]);

  // Focus last focusable element
  const focusLast = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      const lastFocusable = focusableElements[focusableElements.length - 1];
      if (lastFocusable) {
        lastFocusable.focus();
      }
    }
  }, [getFocusableElements]);

  // Check if element is within container
  const containsFocus = useCallback(() => {
    return containerRef.current?.contains(document.activeElement);
  }, []);

  return {
    containerRef,
    handleKeyDown,
    focusFirst,
    focusLast,
    containsFocus,
    getFocusableElements: () => containerRef.current ? getFocusableElements(containerRef.current) : [],
  };
};