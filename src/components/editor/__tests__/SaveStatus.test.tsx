import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveStatus } from '../SaveStatus';
import { useEditorStore } from '@/stores/useEditorStore';

// Mock the editor store
vi.mock('@/stores/useEditorStore');
const mockUseEditorStore = vi.mocked(useEditorStore);

// Mock date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    formatDistanceToNow: vi.fn(() => '5분'),
  };
});

describe('SaveStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show saving status', () => {
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: true,
      lastSaved: null,
      isDirty: false,
    });

    render(<SaveStatus />);

    expect(screen.getByText('저장 중...')).toBeInTheDocument();
    expect(
      screen.getByText('현재 자동 저장이 진행 중입니다.')
    ).toBeInTheDocument();
  });

  it('should show just saved status', () => {
    const now = new Date();
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: now,
      isDirty: false,
    });

    render(<SaveStatus />);

    expect(screen.getByText('방금 저장됨')).toBeInTheDocument();
  });

  it('should show saved with time when saved minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: fiveMinutesAgo,
      isDirty: false,
    });

    render(<SaveStatus />);

    expect(screen.getByText('5분 전 저장됨')).toBeInTheDocument();
  });

  it('should show unsaved changes when dirty', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: oneMinuteAgo,
      isDirty: true,
    });

    render(<SaveStatus />);

    expect(screen.getByText('1분 전 저장됨')).toBeInTheDocument();
    // Should have different styling for dirty state
    const statusElement = screen.getByText('1분 전 저장됨').closest('div');
    expect(statusElement).toHaveClass('text-amber-600');
  });

  it('should show not saved status', () => {
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: null,
      isDirty: false,
    });

    render(<SaveStatus />);

    expect(screen.getByText('저장되지 않음')).toBeInTheDocument();
    expect(
      screen.getByText(
        '아직 저장되지 않았습니다. Cmd+S를 누르거나 잠시 기다리면 자동 저장됩니다.'
      )
    ).toBeInTheDocument();
  });

  it('should show tooltip on hover', async () => {
    const now = new Date();
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: now,
      isDirty: false,
    });

    render(<SaveStatus />);

    const statusElement = screen.getByText('방금 저장됨');
    fireEvent.mouseEnter(statusElement);

    expect(
      screen.getByText('모든 변경사항이 저장되었습니다.')
    ).toBeInTheDocument();
  });

  it('should show different tooltip for dirty state', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: oneMinuteAgo,
      isDirty: true,
    });

    render(<SaveStatus />);

    const statusElement = screen.getByText('1분 전 저장됨');
    fireEvent.mouseEnter(statusElement);

    // Should show tooltip with unsaved changes warning
    expect(screen.getByText(/저장되지 않은 변경사항 있음/)).toBeInTheDocument();
  });

  it('should handle old save times with date formatting', () => {
    const longTimeAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: longTimeAgo,
      isDirty: false,
    });

    render(<SaveStatus />);

    expect(screen.getByText('5분 전 저장됨')).toBeInTheDocument(); // Mocked formatDistanceToNow
  });

  it('should handle date formatting errors gracefully', () => {
    const mockFormatDistanceToNow = vi.fn(() => {
      throw new Error('Date formatting error');
    });

    vi.doMock('date-fns', () => ({
      formatDistanceToNow: mockFormatDistanceToNow,
    }));

    const longTimeAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: longTimeAgo,
      isDirty: false,
    });

    render(<SaveStatus />);

    // Should fall back to toLocaleTimeString
    expect(screen.getByText(/저장됨$/)).toBeInTheDocument();
  });

  it('should have correct styling for different states', () => {
    // Test saving state styling
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: true,
      lastSaved: null,
      isDirty: false,
    });

    const { rerender } = render(<SaveStatus />);
    let statusElement = screen.getByText('저장 중...').closest('div');
    expect(statusElement).toHaveClass('text-blue-600');

    // Test saved state styling
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: new Date(),
      isDirty: false,
    });

    rerender(<SaveStatus />);
    statusElement = screen.getByText('방금 저장됨').closest('div');
    expect(statusElement).toHaveClass('text-green-600');

    // Test dirty state styling
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: new Date(),
      isDirty: true,
    });

    rerender(<SaveStatus />);
    statusElement = screen.getByText('방금 저장됨').closest('div');
    expect(statusElement).toHaveClass('text-amber-600');

    // Test not saved state styling
    mockUseEditorStore.mockReturnValue({
      isAutoSaving: false,
      lastSaved: null,
      isDirty: false,
    });

    rerender(<SaveStatus />);
    statusElement = screen.getByText('저장되지 않음').closest('div');
    expect(statusElement).toHaveClass('text-red-600');
  });
});
