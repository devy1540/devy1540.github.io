import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for detecting and managing high contrast mode
 * Supports both system preference and manual toggle
 */
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(false);

  // Check for system high contrast preference
  useEffect(() => {
    const checkSystemPreference = () => {
      // Check for Windows high contrast mode
      const hasWindowsHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Check for forced colors (Windows high contrast mode)
      const hasForcedColors = window.matchMedia('(forced-colors: active)').matches;
      
      const systemPreference = hasWindowsHighContrast || hasForcedColors;
      setIsSystemPreference(systemPreference);
      
      // Auto-enable if system preference is detected
      if (systemPreference) {
        setIsHighContrast(true);
      }
    };

    checkSystemPreference();

    // Listen for changes in system preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    
    const handleChange = checkSystemPreference;
    
    contrastQuery.addEventListener('change', handleChange);
    forcedColorsQuery.addEventListener('change', handleChange);

    return () => {
      contrastQuery.removeEventListener('change', handleChange);
      forcedColorsQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Toggle high contrast mode manually
  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => !prev);
  }, []);

  // Enable high contrast mode
  const enableHighContrast = useCallback(() => {
    setIsHighContrast(true);
  }, []);

  // Disable high contrast mode (unless system preference)
  const disableHighContrast = useCallback(() => {
    if (!isSystemPreference) {
      setIsHighContrast(false);
    }
  }, [isSystemPreference]);

  // Get high contrast CSS classes
  const getHighContrastClasses = useCallback((baseClasses: string = '') => {
    if (!isHighContrast) return baseClasses;

    const highContrastClasses = [
      'forced-colors:border-[ButtonBorder]',
      'forced-colors:bg-[ButtonFace]',
      'forced-colors:text-[ButtonText]',
      'high-contrast:border-2',
      'high-contrast:border-solid',
      'focus:forced-colors:border-[Highlight]',
      'focus:forced-colors:bg-[Highlight]',
      'focus:forced-colors:text-[HighlightText]',
    ].join(' ');

    return `${baseClasses} ${highContrastClasses}`.trim();
  }, [isHighContrast]);

  // Get high contrast styles for inline styling
  const getHighContrastStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    if (!isHighContrast) return baseStyles;

    return {
      ...baseStyles,
      // Ensure strong borders and contrast
      border: '2px solid',
      outline: 'none',
      // Let browser handle colors in forced-colors mode
    };
  }, [isHighContrast]);

  return {
    isHighContrast,
    isSystemPreference,
    toggleHighContrast,
    enableHighContrast,
    disableHighContrast,
    getHighContrastClasses,
    getHighContrastStyles,
  };
};