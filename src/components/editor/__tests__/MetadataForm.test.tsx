import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetadataForm } from '../MetadataForm';
import { useEditorStore } from '@/stores/useEditorStore';
import { useTagStore } from '@/stores/useTagStore';
import { useCategoryStore } from '@/stores/useCategoryStore';

// Mock the stores
vi.mock('@/stores/useEditorStore');
vi.mock('@/stores/useTagStore');
vi.mock('@/stores/useCategoryStore');

const mockUseEditorStore = vi.mocked(useEditorStore);
const mockUseTagStore = vi.mocked(useTagStore);
const mockUseCategoryStore = vi.mocked(useCategoryStore);

describe('MetadataForm', () => {
  const mockUpdateMetadata = vi.fn();
  const mockAddItem = vi.fn();
  const mockGetSuggestions = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseEditorStore.mockReturnValue({
      metadata: {
        title: '',
        slug: '',
        excerpt: '',
        category: '',
        tags: [],
        isDraft: true,
        thumbnail: null,
        metadata: {
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
        },
      },
      updateMetadata: mockUpdateMetadata,
      isAutoSaving: false,
      lastSaved: null,
    });

    mockUseTagStore.mockReturnValue({
      addItem: mockAddItem,
      getSuggestions: mockGetSuggestions,
    });

    mockUseCategoryStore.mockReturnValue({
      addItem: mockAddItem,
      getSuggestions: mockGetSuggestions,
    });

    mockGetSuggestions.mockReturnValue([]);
  });

  it('renders all form fields', () => {
    render(<MetadataForm onSave={mockOnSave} />);
    expect(screen.getByLabelText('제목 *')).toBeInTheDocument();
    expect(screen.getByLabelText(/슬러그/)).toBeInTheDocument();
  });

  it('generates slug automatically when title changes', async () => {
    const user = userEvent.setup();
    render(<MetadataForm onSave={mockOnSave} />);

    const titleInput = screen.getByLabelText(/제목 \*/);
    await user.type(titleInput, 'React 성능 최적화');

    await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith({
            title: 'React 성능 최적화',
            slug: 'react-성능-최적화',
        });
    });
  });
});
