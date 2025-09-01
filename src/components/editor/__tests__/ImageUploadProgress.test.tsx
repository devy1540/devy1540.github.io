import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploadProgress } from '../ImageUploadProgress';
import { useImageUploadStore } from '@/stores/useImageUploadStore';
import { ImageUploadProgress as ProgressType } from '@/types/image-upload';

// Mock store
vi.mock('@/stores/useImageUploadStore');
const mockUseImageUploadStore = vi.mocked(useImageUploadStore);

describe('ImageUploadProgress', () => {
  const mockRemoveUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseImageUploadStore.mockReturnValue({
      removeUpload: mockRemoveUpload,
      setUploadProgress: vi.fn(),
      addImage: vi.fn(),
      setUploading: vi.fn(),
      isUploading: false,
      uploads: {},
      images: [],
      isGalleryOpen: false,
      clearUploads: vi.fn(),
      removeImage: vi.fn(),
      setImages: vi.fn(),
      selectImage: vi.fn(),
      getSelectedImages: vi.fn(),
      clearSelection: vi.fn(),
      setGalleryOpen: vi.fn(),
    });
  });

  it('should render nothing when no uploads', () => {
    const { container } = render(<ImageUploadProgress uploads={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render upload progress for preparing status', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 10,
        status: 'preparing' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.getByText('test.png')).toBeInTheDocument();
    expect(screen.getByText('준비 중...')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('should render upload progress for uploading status', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 50,
        status: 'uploading' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.getByText('업로드 중...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('GitHub에 업로드 중...')).toBeInTheDocument();
  });

  it('should render upload progress for processing status', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 80,
        status: 'processing' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.getByText('처리 중...')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('이미지 처리 중...')).toBeInTheDocument();
  });

  it('should render completed status with success message', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 100,
        status: 'completed' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('이미지가 성공적으로 업로드되었습니다')).toBeInTheDocument();
  });

  it('should render failed status with error message', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 0,
        status: 'failed' as const,
        error: 'Upload failed due to network error',
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.getByText('실패')).toBeInTheDocument();
    expect(screen.getByText('업로드 실패')).toBeInTheDocument();
    expect(screen.getByText('Upload failed due to network error')).toBeInTheDocument();
  });

  it('should show close button for completed uploads', async () => {
    const user = userEvent.setup();
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 100,
        status: 'completed' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(mockRemoveUpload).toHaveBeenCalledWith('upload-1');
  });

  it('should show close button for failed uploads', async () => {
    const user = userEvent.setup();
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 0,
        status: 'failed' as const,
        error: 'Test error',
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(mockRemoveUpload).toHaveBeenCalledWith('upload-1');
  });

  it('should not show close button for in-progress uploads', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 50,
        status: 'uploading' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render multiple uploads', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test1.png',
        progress: 50,
        status: 'uploading' as const,
      },
      'upload-2': {
        id: 'upload-2',
        filename: 'test2.jpg',
        progress: 100,
        status: 'completed' as const,
      },
      'upload-3': {
        id: 'upload-3',
        filename: 'test3.gif',
        progress: 0,
        status: 'failed' as const,
        error: 'Test error',
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    expect(screen.getByText('test1.png')).toBeInTheDocument();
    expect(screen.getByText('test2.jpg')).toBeInTheDocument();
    expect(screen.getByText('test3.gif')).toBeInTheDocument();
    
    expect(screen.getByText('업로드 중...')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'test.png',
        progress: 50,
        status: 'uploading' as const,
      },
    };

    const { container } = render(
      <ImageUploadProgress uploads={uploads} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show correct status colors', () => {
    const uploads = {
      'upload-1': {
        id: 'upload-1',
        filename: 'uploading.png',
        progress: 50,
        status: 'uploading' as const,
      },
      'upload-2': {
        id: 'upload-2',
        filename: 'completed.png',
        progress: 100,
        status: 'completed' as const,
      },
      'upload-3': {
        id: 'upload-3',
        filename: 'failed.png',
        progress: 0,
        status: 'failed' as const,
      },
    };

    render(<ImageUploadProgress uploads={uploads} />);

    const uploadingStatus = screen.getByText('업로드 중...');
    const completedStatus = screen.getByText('완료');
    const failedStatus = screen.getByText('실패');

    expect(uploadingStatus).toHaveClass('text-blue-600');
    expect(completedStatus).toHaveClass('text-green-600');
    expect(failedStatus).toHaveClass('text-red-600');
  });
});