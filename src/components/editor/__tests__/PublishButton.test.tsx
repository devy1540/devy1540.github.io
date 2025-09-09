import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublishButton } from '../PublishButton';
import { useEditorStore } from '@/stores/useEditorStore';
import { useGitHubAuthStore } from '@/stores/useGitHubAuthStore';
import { usePublishStore } from '@/stores/usePublishStore';
import { useToastStore } from '@/stores/useToastStore';

// Mock stores
vi.mock('@/stores/useEditorStore');
vi.mock('@/stores/useGitHubAuthStore');
vi.mock('@/stores/usePublishStore');
vi.mock('@/stores/useToastStore');

const mockUseEditorStore = vi.mocked(useEditorStore);
const mockUseGitHubAuthStore = vi.mocked(useGitHubAuthStore);
const mockUsePublishStore = vi.mocked(usePublishStore);
const mockUseToastStore = vi.mocked(useToastStore);

describe('PublishButton', () => {
  const mockOnPublish = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseToastStore.mockReturnValue({
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    });
  });

  it('should render enabled button when conditions are met', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('게시');
  });

  it('should show login required when not authenticated', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('GitHub 로그인 필요');
  });

  it('should show publishing state when publishing', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: true,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('게시 중...');
  });

  it('should be disabled when title is missing', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: '' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('게시할 수 없음');
  });

  it('should be disabled when content is missing', () => {
    mockUseEditorStore.mockReturnValue({
      content: '',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('게시할 수 없음');
  });

  it('should call onPublish when clicked and conditions are met', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnPublish).toHaveBeenCalledTimes(1);
  });

  it('should not call handlers when authentication is missing', () => {
    const mockAddToast = vi.fn();

    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    mockUseToastStore.mockReturnValue({
      error: mockAddToast,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('GitHub 로그인 필요');

    // Disabled buttons don't fire click events, which is the expected behavior
    expect(mockOnPublish).not.toHaveBeenCalled();
  });

  it('should not call handlers when title is missing', () => {
    const mockAddToast = vi.fn();

    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: '' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    mockUseToastStore.mockReturnValue({
      error: mockAddToast,
    });

    render(<PublishButton onPublish={mockOnPublish} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('게시할 수 없음');

    // Disabled buttons don't fire click events, which is the expected behavior
    expect(mockOnPublish).not.toHaveBeenCalled();
  });

  it('should render with custom variant and size', () => {
    mockUseEditorStore.mockReturnValue({
      content: 'Test content',
      metadata: { title: 'Test Title' },
    });

    mockUseGitHubAuthStore.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      isLoading: false,
    });

    mockUsePublishStore.mockReturnValue({
      isPublishing: false,
    });

    render(
      <PublishButton
        onPublish={mockOnPublish}
        variant="outline"
        size="lg"
        className="custom-class"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
