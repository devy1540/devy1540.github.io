import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DraftsPage } from '../DraftsPage';
import { useDraftStore } from '@/stores/useDraftStore';
import type { Draft } from '@/utils/draft';

// Mock the draft store
vi.mock('@/stores/useDraftStore');
const mockUseDraftStore = useDraftStore as any;

// Mock DraftCard component
vi.mock('@/components/draft/DraftCard', () => ({
  DraftCard: ({ draft }: { draft: Draft }) => (
    <div data-testid={`draft-card-${draft.id}`}>
      <h3>{draft.title}</h3>
      <p>{draft.content}</p>
    </div>
  ),
}));

const mockDrafts: Draft[] = [
  {
    id: 'draft-1',
    title: 'First Draft',
    content: '# First Draft Content',
    metadata: { title: 'First Draft' },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
    isAutoSaved: true,
  },
  {
    id: 'draft-2',
    title: 'Second Draft',
    content: '# Second Draft Content',
    metadata: { title: 'Second Draft' },
    createdAt: new Date('2024-01-02T10:00:00Z'),
    updatedAt: new Date('2024-01-02T11:00:00Z'),
    isAutoSaved: true,
  },
];

const renderDraftsPage = () => {
  return render(
    <BrowserRouter>
      <DraftsPage />
    </BrowserRouter>
  );
};

describe('DraftsPage', () => {
  const mockLoadDrafts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDraftStore.mockReturnValue({
      drafts: mockDrafts,
      isLoading: false,
      error: null,
      loadDrafts: mockLoadDrafts,
    });

    mockLoadDrafts.mockResolvedValue(undefined);
  });

  it('should render page title and description', () => {
    renderDraftsPage();

    expect(screen.getByText('초안 목록')).toBeInTheDocument();
    expect(screen.getByText('저장된 초안들을 관리하고 편집을 계속할 수 있습니다.')).toBeInTheDocument();
  });

  it('should load drafts on mount', async () => {
    renderDraftsPage();

    await waitFor(() => {
      expect(mockLoadDrafts).toHaveBeenCalled();
    });
  });

  it('should render draft cards when drafts exist', async () => {
    renderDraftsPage();

    await waitFor(() => {
      expect(screen.getByTestId('draft-card-draft-1')).toBeInTheDocument();
      expect(screen.getByTestId('draft-card-draft-2')).toBeInTheDocument();
      expect(screen.getByText('First Draft')).toBeInTheDocument();
      expect(screen.getByText('Second Draft')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUseDraftStore.mockReturnValue({
      drafts: [],
      isLoading: true,
      error: null,
      loadDrafts: mockLoadDrafts,
    });

    renderDraftsPage();

    expect(screen.getByText('초안을 불러오는 중...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseDraftStore.mockReturnValue({
      drafts: [],
      isLoading: false,
      error: 'Failed to load drafts',
      loadDrafts: mockLoadDrafts,
    });

    renderDraftsPage();

    expect(screen.getByText('오류 발생')).toBeInTheDocument();
    expect(screen.getByText('Failed to load drafts')).toBeInTheDocument();
  });

  it('should show empty state when no drafts exist', () => {
    mockUseDraftStore.mockReturnValue({
      drafts: [],
      isLoading: false,
      error: null,
      loadDrafts: mockLoadDrafts,
    });

    renderDraftsPage();

    expect(screen.getByText('저장된 초안이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('에디터에서 글을 작성하면 자동으로 초안이 저장됩니다.')).toBeInTheDocument();
    expect(screen.getByText('새 글 작성하기')).toBeInTheDocument();
  });



  it('should render with responsive grid layout classes', () => {
    renderDraftsPage();

    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('sm:grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
  });

  it('should handle navigation to editor from empty state', () => {
    mockUseDraftStore.mockReturnValue({
      drafts: [],
      isLoading: false,
      error: null,
      loadDrafts: mockLoadDrafts,
    });

    renderDraftsPage();

    const newPostButton = screen.getByText('새 글 작성하기');
    expect(newPostButton).toHaveAttribute('href', '/editor');
  });


  it('should maintain proper accessibility structure', () => {
    renderDraftsPage();

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('초안 목록');
  });

  it('should handle loading state transitions correctly', async () => {
    // Start with loading state
    mockUseDraftStore.mockReturnValue({
      drafts: [],
      isLoading: true,
      error: null,
      loadDrafts: mockLoadDrafts,
    });

    const { rerender } = renderDraftsPage();
    expect(screen.getByText('초안을 불러오는 중...')).toBeInTheDocument();

    // Transition to loaded state
    mockUseDraftStore.mockReturnValue({
      drafts: mockDrafts,
      isLoading: false,
      error: null,
      loadDrafts: mockLoadDrafts,
    });

    rerender(
      <BrowserRouter>
        <DraftsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('draft-card-draft-1')).toBeInTheDocument();
    });
  });
});