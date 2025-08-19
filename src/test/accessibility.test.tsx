import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Footer } from '@/components/layout/Footer';
import { SettingsPage } from '@/pages/SettingsPage';
import { HomePage } from '@/pages/HomePage';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Wrapper component for React Router and Sidebar
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <SidebarProvider>
      {children}
    </SidebarProvider>
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  // Header component removed - navigation now handled by AppSidebar

  it('Footer component should have no accessibility violations', async () => {
    const { container } = render(<Footer />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('HomePage should have no accessibility violations', async () => {
    const { container } = render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SettingsPage should have no accessibility violations', async () => {
    const { container } = render(
      <RouterWrapper>
        <SettingsPage />
      </RouterWrapper>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    // Check that h1 exists and there's proper heading hierarchy
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    
    const results = await axe(container, {
      rules: {
        'heading-order': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('should have sufficient color contrast', async () => {
    const { container } = render(
      <RouterWrapper>
        <SettingsPage />
      </RouterWrapper>
    );
    
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper form labels and ARIA attributes', async () => {
    const { container } = render(
      <RouterWrapper>
        <SettingsPage />
      </RouterWrapper>
    );
    
    const results = await axe(container, {
      rules: {
        'label': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('should have keyboard accessible interactive elements', async () => {
    const { container } = render(
      <RouterWrapper>
        <SettingsPage />
      </RouterWrapper>
    );
    
    const results = await axe(container, {
      rules: {
        'tabindex': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper semantic structure', async () => {
    const { container } = render(
      <RouterWrapper>
        <HomePage />
      </RouterWrapper>
    );
    
    const results = await axe(container, {
      rules: {
        'landmark-one-main': { enabled: true },
        'region': { enabled: true }
      }
    });
    expect(results).toHaveNoViolations();
  });
});