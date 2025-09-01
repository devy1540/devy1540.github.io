import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublishDialog } from '../PublishDialog';
import { useEditorStore } from '@/stores/useEditorStore';
import { useRepositoryStore } from '@/stores/useRepositoryStore';

// Mock stores
vi.mock('@/stores/useEditorStore');
vi.mock('@/stores/useRepositoryStore');

describe('PublishDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useEditorStore as any).mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Post' },
    });
    
    (useRepositoryStore as any).mockReturnValue({
      currentRepo: { 
        full_name: 'user/test-repo',
        default_branch: 'main'
      },
    });
  });

  it('should render dialog when open', () => {
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('블로그 포스트 게시')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <PublishDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should initialize form with editor data', async () => {
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-post')).toBeInTheDocument();
      expect(screen.getByDisplayValue('main')).toBeInTheDocument();
    });
  });

  it('should have correct initial slug from title', async () => {
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Wait for form initialization
    await waitFor(() => {
      const titleInput = screen.getByLabelText('제목');
      const slugInput = screen.getByLabelText('슬러그 (URL)');
      
      expect(titleInput).toHaveValue('Test Post');
      expect(slugInput).toHaveValue('test-post');
    });
  });

  it('should allow slug input', async () => {
    const user = userEvent.setup();
    
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    const slugInput = screen.getByLabelText('슬러그 (URL)');
    
    // Start with a clean slate
    await user.clear(slugInput);
    await user.type(slugInput, 'customslug');
    
    await waitFor(() => {
      expect(slugInput).toHaveValue('customslug');
    });
  });

  it('should call onConfirm with correct data', async () => {
    const user = userEvent.setup();
    
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Wait for form to initialize with editor data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument();
    });
    
    const publishButton = screen.getByRole('button', { name: /게시하기/i });
    await user.click(publishButton);
    
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Post',
          content: 'Test content',
          slug: 'test-post',
          metadata: expect.objectContaining({
            title: 'Test Post',
            slug: 'test-post',
            draft: false,
          }),
        }),
        expect.objectContaining({
          message: expect.stringContaining('feat: add new blog post "Test Post"'),
          branch: 'main',
          path: expect.stringMatching(/content\/posts\/\d{4}-\d{2}-\d{2}-test-post\.md/),
        })
      );
    });
  });

  it('should disable form when publishing', () => {
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        isPublishing={true}
      />
    );
    
    const titleInput = screen.getByLabelText('제목');
    const slugInput = screen.getByLabelText('슬러그 (URL)');
    const publishButton = screen.getByRole('button', { name: /게시 중.../i });
    
    expect(titleInput).toBeDisabled();
    expect(slugInput).toBeDisabled();
    expect(publishButton).toBeDisabled();
  });

  it('should not call onConfirm when form has issues', async () => {
    const user = userEvent.setup();
    
    (useEditorStore as any).mockReturnValue({
      content: 'Test content',
      metadata: { title: '' }, // Empty title should cause issues
    });
    
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Form may auto-populate title from metadata, so we need to clear it
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    
    const publishButton = screen.getByRole('button', { name: /게시하기/i });
    
    // With empty title, button should become disabled
    await waitFor(() => {
      expect(publishButton).toBeDisabled();
    });
    
    // Disabled button won't call onConfirm
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should show repository information', async () => {
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('user/test-repo')).toBeInTheDocument();
      expect(screen.getByText(/content\/posts\/.*test-post\.md/)).toBeInTheDocument();
    });
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should allow custom commit message editing', async () => {
    const user = userEvent.setup();
    
    render(
      <PublishDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );
    
    const commitMessageTextarea = screen.getByLabelText('커밋 메시지');
    
    await user.clear(commitMessageTextarea);
    await user.type(commitMessageTextarea, 'Custom commit message');
    
    const publishButton = screen.getByRole('button', { name: /게시하기/i });
    await user.click(publishButton);
    
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        message: 'Custom commit message',
      })
    );
  });
});