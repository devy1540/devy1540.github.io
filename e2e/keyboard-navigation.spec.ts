import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate through header menu with Tab key', async ({ page }) => {
    // Focus on first interactive element (skip link or first navigation item)
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through all header navigation items
    const navLinks = page.locator('nav[role="navigation"] a');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      await page.keyboard.press('Tab');
    }
  });

  test('should activate navigation links with Enter key', async ({ page }) => {
    // Navigate to About link and press Enter
    await page.keyboard.press('Tab');
    
    // Find and focus on About link
    const aboutLink = page.locator('nav a[href="/about"]');
    await aboutLink.focus();
    await page.keyboard.press('Enter');
    
    // Should navigate to About page
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText('About');
  });

  test('should navigate to Settings page and interact with theme buttons', async ({ page }) => {
    await page.goto('/settings');
    
    // Tab to theme section
    await page.keyboard.press('Tab'); // Skip to content
    
    let tabCount = 0;
    const maxTabs = 20; // Safety limit
    
    while (tabCount < maxTabs) {
      const focusedElement = page.locator(':focus');
      const text = await focusedElement.textContent();
      
      if (text === 'Dark') {
        await page.keyboard.press('Enter');
        // Verify theme changed
        await expect(page.locator('html')).toHaveClass(/dark/);
        break;
      }
      
      await page.keyboard.press('Tab');
      tabCount++;
    }
  });

  test('should navigate accent color picker with keyboard', async ({ page }) => {
    await page.goto('/settings');
    
    // Navigate to accent color picker
    let tabCount = 0;
    const maxTabs = 30; // Safety limit
    
    while (tabCount < maxTabs) {
      const focusedElement = page.locator(':focus');
      const role = await focusedElement.getAttribute('role');
      
      if (role === 'button' && await focusedElement.getAttribute('data-color')) {
        // Found accent color button
        await page.keyboard.press('Enter');
        
        // Verify color changed by checking CSS custom property
        const accentColor = await page.evaluate(() => {
          return getComputedStyle(document.documentElement).getPropertyValue('--accent-current');
        });
        
        expect(accentColor).toBeTruthy();
        break;
      }
      
      await page.keyboard.press('Tab');
      tabCount++;
    }
  });

  test('should activate toast notifications with keyboard', async ({ page }) => {
    await page.goto('/settings');
    
    // Navigate to toast test buttons
    let tabCount = 0;
    const maxTabs = 40; // Safety limit
    
    while (tabCount < maxTabs) {
      const focusedElement = page.locator(':focus');
      const text = await focusedElement.textContent();
      
      if (text === 'Success') {
        await page.keyboard.press('Enter');
        
        // Wait for toast to appear
        await expect(page.locator('[data-sonner-toast]')).toBeVisible();
        break;
      }
      
      await page.keyboard.press('Tab');
      tabCount++;
    }
  });

  test('should support Escape key to close mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu (hamburger button)
    const menuButton = page.locator('button[aria-label*="menu"]').first();
    await menuButton.click();
    
    // Verify menu is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    
    // Verify menu is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should focus visible elements and skip hidden ones', async ({ page }) => {
    await page.goto('/');
    
    let focusableElements = 0;
    let previousElement = null;
    
    // Count focusable elements by tabbing through them
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const currentElement = page.locator(':focus');
      const isVisible = await currentElement.isVisible();
      
      if (isVisible) {
        focusableElements++;
        
        // Ensure we're not stuck on the same element
        const currentText = await currentElement.textContent();
        expect(currentText).not.toBe(previousElement);
        previousElement = currentText;
      }
    }
    
    // Should have found multiple focusable elements
    expect(focusableElements).toBeGreaterThan(3);
  });
});