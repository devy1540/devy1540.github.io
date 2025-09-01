import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Upload E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor page
    await page.goto('/editor');
    
    // Mock GitHub API calls to avoid actual API usage
    await page.route('**/api/github/**', async route => {
      const url = route.request().url();
      
      if (url.includes('/contents/public/images')) {
        // Mock image upload response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sha: 'mock-sha-123',
            commit: {
              sha: 'mock-commit-sha',
              message: 'Upload image test.png',
            },
          }),
        });
      } else if (url.includes('/contents/public/images/')) {
        // Mock directory listing
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              type: 'file',
              name: 'existing-image.png',
              path: 'public/images/existing-image.png',
              sha: 'existing-sha',
              size: 1000000,
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should upload image via button click', async ({ page }) => {
    // Find and click upload button
    const uploadButton = page.getByRole('button', { name: /이미지 업로드/ });
    await expect(uploadButton).toBeVisible();

    // Create a test image file
    const testImagePath = path.join(__dirname, '../../fixtures/test-image.png');
    
    // Set up file chooser handler
    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for upload to complete
    await expect(page.getByText('이미지가 성공적으로 업로드되었습니다')).toBeVisible();
    
    // Verify image markdown is inserted into editor
    const editor = page.locator('[data-testid="markdown-editor"]');
    await expect(editor).toContainText('![test-image.png]');
  });

  test('should upload image via drag and drop', async ({ page }) => {
    // Create test file data
    const testImageBuffer = Buffer.from('fake-image-data');
    
    // Find dropzone area
    const dropzone = page.locator('[data-testid="editor-container"]');
    await expect(dropzone).toBeVisible();

    // Create a data transfer with file
    await page.evaluate(async (imageData) => {
      const file = new File([new Uint8Array(imageData)], 'drag-drop-test.png', {
        type: 'image/png',
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dropEvent = new DragEvent('drop', {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      });

      const dropzone = document.querySelector('[data-testid="editor-container"]');
      dropzone?.dispatchEvent(dropEvent);
    }, Array.from(testImageBuffer));

    // Wait for upload to complete
    await expect(page.getByText('이미지가 성공적으로 업로드되었습니다')).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    const uploadButton = page.getByRole('button', { name: /이미지 업로드/ });
    
    // Mock slower upload to see progress
    await page.route('**/api/github/contents/public/images/**', async route => {
      // Add delay to simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sha: 'mock-sha-123',
          commit: { sha: 'mock-commit-sha' },
        }),
      });
    });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    
    const fileChooser = await fileChooserPromise;
    const testImagePath = path.join(__dirname, '../../fixtures/test-image.png');
    await fileChooser.setFiles(testImagePath);

    // Check progress indicators
    await expect(page.getByText('업로드 중...')).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.getByText('완료')).toBeVisible();
  });

  test('should open and interact with image gallery', async ({ page }) => {
    // Open gallery
    const galleryButton = page.getByRole('button', { name: /이미지 갤러리/ });
    await galleryButton.click();

    // Verify gallery dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('이미지 갤러리')).toBeVisible();

    // Verify existing images are shown
    await expect(page.getByText('existing-image.png')).toBeVisible();

    // Test search functionality
    const searchInput = page.getByPlaceholder('이미지 검색...');
    await searchInput.fill('existing');
    await expect(page.getByText('existing-image.png')).toBeVisible();

    // Clear search
    await searchInput.clear();
    
    // Test image selection
    const imageCard = page.locator('[data-testid="image-card"]').first();
    await imageCard.click();

    // Verify image is inserted into editor
    await expect(page.getByText('existing-image.png 이미지가 에디터에 삽입되었습니다')).toBeVisible();
    
    // Gallery should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should handle file validation errors', async ({ page }) => {
    const uploadButton = page.getByRole('button', { name: /이미지 업로드/ });
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    
    const fileChooser = await fileChooserPromise;
    
    // Try to upload a non-image file
    const textFilePath = path.join(__dirname, '../../fixtures/test-document.txt');
    await fileChooser.setFiles(textFilePath);

    // Verify error message
    await expect(page.getByText('지원하지 않는 파일 형식입니다')).toBeVisible();
  });

  test('should handle large file size errors', async ({ page }) => {
    // Mock a large file response
    await page.evaluate(() => {
      // Override File constructor to simulate large file
      const originalFile = window.File;
      window.File = class extends originalFile {
        constructor(bits: any, name: string, options: any) {
          super(bits, name, options);
          if (name.includes('large')) {
            Object.defineProperty(this, 'size', {
              value: 15 * 1024 * 1024, // 15MB
              writable: false,
            });
          }
        }
      };
    });

    const uploadButton = page.getByRole('button', { name: /이미지 업로드/ });
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    
    const fileChooser = await fileChooserPromise;
    const largeFilePath = path.join(__dirname, '../../fixtures/large-image.png');
    await fileChooser.setFiles(largeFilePath);

    // Verify error message
    await expect(page.getByText('파일 크기가 너무 큽니다')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/github/contents/public/images/**', async route => {
      await route.abort('failed');
    });

    const uploadButton = page.getByRole('button', { name: /이미지 업로드/ });
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    
    const fileChooser = await fileChooserPromise;
    const testImagePath = path.join(__dirname, '../../fixtures/test-image.png');
    await fileChooser.setFiles(testImagePath);

    // Verify error handling
    await expect(page.getByText('네트워크 오류로 업로드에 실패했습니다')).toBeVisible();
  });

  test('should maintain editor content during upload', async ({ page }) => {
    // Type some content in editor
    const editor = page.locator('[data-testid="markdown-editor"]');
    await editor.fill('# My Blog Post\n\nThis is some content before image upload.');
    
    // Upload image
    const uploadButton = page.getByRole('button', { name: /이미지 업로드/ });
    const fileChooserPromise = page.waitForEvent('filechooser');
    await uploadButton.click();
    
    const fileChooser = await fileChooserPromise;
    const testImagePath = path.join(__dirname, '../../fixtures/test-image.png');
    await fileChooser.setFiles(testImagePath);

    // Wait for upload to complete
    await expect(page.getByText('이미지가 성공적으로 업로드되었습니다')).toBeVisible();
    
    // Verify original content is preserved and image is added
    await expect(editor).toContainText('# My Blog Post');
    await expect(editor).toContainText('This is some content before image upload.');
    await expect(editor).toContainText('![test-image.png]');
  });

  test('should copy image URLs and markdown', async ({ page }) => {
    // Open gallery
    const galleryButton = page.getByRole('button', { name: /이미지 갤러리/ });
    await galleryButton.click();

    // Hover over image to show actions
    const imageCard = page.locator('[data-testid="image-card"]').first();
    await imageCard.hover();

    // Test URL copy
    const copyUrlButton = page.getByTitle('URL 복사');
    await copyUrlButton.click();
    await expect(page.getByText('URL 복사 완료')).toBeVisible();

    // Test markdown copy
    const copyMarkdownButton = page.getByTitle('마크다운 복사');
    await copyMarkdownButton.click();
    await expect(page.getByText('마크다운 복사 완료')).toBeVisible();
  });
});

// Test fixtures would need to be created:
// - tests/fixtures/test-image.png (small test image)
// - tests/fixtures/test-document.txt (text file for error testing)
// - tests/fixtures/large-image.png (large image for size testing)