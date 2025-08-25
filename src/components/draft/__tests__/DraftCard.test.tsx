import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DraftCard } from '../DraftCard';
import { useDraftStore } from '@/stores/useDraftStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToastStore } from '@/stores/useToastStore';
import type { Draft } from '@/utils/draft';

// Mock stores and hooks
vi.mock('@/stores/useDraftStore');
vi.mock('@/stores/useEditorStore');
vi.mock('@/hooks/useAutoSave');
vi.mock('@/stores/useToastStore');

const mockUseDraftStore = useDraftStore as any;
const mockUseEditorStore = useEditorStore as any;
const mockUseAutoSave = useAutoSave as any;
const mockUseToastStore = useToastStore as any;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockDraft: Draft = {
  id: 'test-draft-1',
  title: 'Test Draft Title',
  content: '# Test Content\n\nThis is a test draft content.',
  metadata: { title: 'Test Draft Title' },
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T11:00:00Z'),
  isAutoSaved: true,
};

const renderDraftCard = (draft = mockDraft) => {
  return render(
    <BrowserRouter>
      <DraftCard draft={draft} />
    </BrowserRouter>
  );
};

describe('DraftCard', () => {
  const mockDeleteDraft = vi.fn();
  const mockUpdateContent = vi.fn();
  const mockUpdateMetadata = vi.fn();
  const mockSetCurrentDraftId = vi.fn();
  const mockReset = vi.fn();
  const mockSaveNow = vi.fn();
  const mockShowError = vi.fn();
  const mockShowSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDraftStore.mockReturnValue({
      deleteDraft: mockDeleteDraft,
    });

    mockUseEditorStore.mockReturnValue({
      updateContent: mockUpdateContent,
      updateMetadata: mockUpdateMetadata,
      setCurrentDraftId: mockSetCurrentDraftId,
      reset: mockReset,
      isDirty: false,
    });

    mockUseAutoSave.mockReturnValue({
      saveNow: mockSaveNow,
    });

    mockUseToastStore.mockReturnValue({
      error: mockShowError,
      success: mockShowSuccess,
    });

    mockDeleteDraft.mockResolvedValue(undefined);
    mockSaveNow.mockResolvedValue(undefined);
  });

  it('should render draft information correctly', () => {
    renderDraftCard();

    expect(screen.getByText('Test Draft Title')).toBeInTheDocument();
    expect(screen.getByText(/전 저장됨/)).toBeInTheDocument();
    expect(screen.getByText('This is a test draft content.')).toBeInTheDocument();
    expect(screen.getByText(/분 읽기/)).toBeInTheDocument();
  });

  it('should show "Untitled" for drafts without title', () => {
    const draftWithoutTitle = { ...mockDraft, title: '' };
    renderDraftCard(draftWithoutTitle);

    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('should handle edit action when no unsaved changes', async () => {
    renderDraftCard();

    const editButton = screen.getByRole('button', { name: '' }); // Edit button with icon only
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
      expect(mockUpdateContent).toHaveBeenCalledWith(mockDraft.content);
      expect(mockUpdateMetadata).toHaveBeenCalledWith(mockDraft.metadata);
      expect(mockSetCurrentDraftId).toHaveBeenCalledWith(mockDraft.id);
      expect(mockNavigate).toHaveBeenCalledWith('/editor');
    });
  });

  it('should show save confirmation dialog when there are unsaved changes', async () => {
    mockUseEditorStore.mockReturnValue({
      updateContent: mockUpdateContent,
      updateMetadata: mockUpdateMetadata,
      setCurrentDraftId: mockSetCurrentDraftId,
      reset: mockReset,
      isDirty: true, // Has unsaved changes
    });

    renderDraftCard();

    const editButton = screen.getByRole('button', { name: '' }); // Edit button with icon only
    fireEvent.click(editButton);

    // Should show save confirmation dialog
    expect(screen.getByText('저장하지 않은 변경사항')).toBeInTheDocument();
    expect(screen.getByText('현재 편집 중인 내용이 저장되지 않았습니다. 계속 진행하시겠습니까?')).toBeInTheDocument();
  });

  it('should handle save and continue action', async () => {
    mockUseEditorStore.mockReturnValue({
      updateContent: mockUpdateContent,
      updateMetadata: mockUpdateMetadata,
      setCurrentDraftId: mockSetCurrentDraftId,
      reset: mockReset,
      isDirty: true,
    });

    renderDraftCard();

    const editButton = screen.getByRole('button', { name: '' });
    fireEvent.click(editButton);

    const saveButton = screen.getByText('저장하고 계속');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveNow).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith('저장 완료', '현재 작업이 저장되었습니다.');
      expect(mockNavigate).toHaveBeenCalledWith('/editor');
    });
  });

  it('should handle discard and continue action', async () => {
    mockUseEditorStore.mockReturnValue({
      updateContent: mockUpdateContent,
      updateMetadata: mockUpdateMetadata,
      setCurrentDraftId: mockSetCurrentDraftId,
      reset: mockReset,
      isDirty: true,
    });

    renderDraftCard();

    const editButton = screen.getByRole('button', { name: '' });
    fireEvent.click(editButton);

    const discardButton = screen.getByText('변경사항 버리기');
    fireEvent.click(discardButton);

    await waitFor(() => {
      expect(mockSaveNow).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/editor');
    });
  });

  it('should show delete confirmation dialog', async () => {
    renderDraftCard();

    const deleteButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg') // Find delete button with trash icon
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    expect(screen.getByText('초안을 삭제하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('이 작업은 되돌릴 수 없습니다. 초안이 영구적으로 삭제됩니다.')).toBeInTheDocument();
  });

  it('should handle delete action successfully', async () => {
    renderDraftCard();

    // Find and click delete button
    const deleteButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg') // Find delete button with trash icon
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    const confirmDeleteButton = screen.getByText('삭제');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteDraft).toHaveBeenCalledWith(mockDraft.id);
      expect(mockShowSuccess).toHaveBeenCalledWith('삭제 완료', `"${mockDraft.title}" 초안이 삭제되었습니다.`);
    });
  });

  it('should handle delete error', async () => {
    mockDeleteDraft.mockRejectedValue(new Error('Delete failed'));
    
    renderDraftCard();

    const deleteButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    const confirmDeleteButton = screen.getByText('삭제');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('삭제 실패', '초안을 삭제할 수 없습니다. 다시 시도해주세요.');
    });
  });

  it('should handle save error when switching drafts', async () => {
    mockSaveNow.mockRejectedValue(new Error('Save failed'));
    mockUseEditorStore.mockReturnValue({
      updateContent: mockUpdateContent,
      updateMetadata: mockUpdateMetadata,
      setCurrentDraftId: mockSetCurrentDraftId,
      reset: mockReset,
      isDirty: true,
    });

    renderDraftCard();

    const editButton = screen.getByRole('button', { name: '' });
    fireEvent.click(editButton);

    const saveButton = screen.getByText('저장하고 계속');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('저장 실패', '현재 작업을 저장할 수 없습니다. 다시 시도해주세요.');
    });
  });

  it('should format preview text correctly', () => {
    const draftWithMarkdown = {
      ...mockDraft,
      content: '# Header\n\n**Bold text** and *italic text* and `code` and [link](url) and ![image](url)\n\n```\ncode block\n```\n\nRegular text continues...',
    };

    renderDraftCard(draftWithMarkdown);

    // Should strip markdown and show plain text preview
    expect(screen.getByText(/Header Bold text and italic text and code and \[링크\] and \[이미지\]/)).toBeInTheDocument();
  });

  it('should calculate reading time correctly', () => {
    const longContent = 'a'.repeat(2500); // Approximately 5 minutes of reading
    const draftWithLongContent = {
      ...mockDraft,
      content: longContent,
    };

    renderDraftCard(draftWithLongContent);

    expect(screen.getByText('5 분 읽기')).toBeInTheDocument();
  });
});