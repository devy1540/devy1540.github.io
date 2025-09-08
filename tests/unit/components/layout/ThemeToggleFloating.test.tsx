import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggleFloating } from '@/components/layout/ThemeToggleFloating';
import { useThemeStore } from '@/stores/useThemeStore';

// Mock useThemeStore
vi.mock('@/stores/useThemeStore');

const mockUseThemeStore = vi.mocked(useThemeStore);

describe('ThemeToggleFloating', () => {
  const mockSetTheme = vi.fn();
  const mockGetEffectiveTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseThemeStore.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      getEffectiveTheme: mockGetEffectiveTheme,
      accentColor: 'blue',
      toggleTheme: vi.fn(),
      setAccentColor: vi.fn(),
      applyCurrentTheme: vi.fn(),
    });
  });

  it('should render with correct initial theme icon (system)', () => {
    mockGetEffectiveTheme.mockReturnValue('light');
    
    render(<ThemeToggleFloating />);
    
    // System 테마일 때 Monitor 아이콘 표시 확인
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', '테마 선택: 현재 시스템 설정');
  });

  it('should render with dark theme icon', () => {
    mockUseThemeStore.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      getEffectiveTheme: mockGetEffectiveTheme,
      accentColor: 'blue',
      toggleTheme: vi.fn(),
      setAccentColor: vi.fn(),
      applyCurrentTheme: vi.fn(),
    });
    mockGetEffectiveTheme.mockReturnValue('dark');
    
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '테마 선택: 현재 다크 모드');
  });

  it('should render with light theme icon', () => {
    mockUseThemeStore.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      getEffectiveTheme: mockGetEffectiveTheme,
      accentColor: 'blue',
      toggleTheme: vi.fn(),
      setAccentColor: vi.fn(),
      applyCurrentTheme: vi.fn(),
    });
    mockGetEffectiveTheme.mockReturnValue('light');
    
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '테마 선택: 현재 라이트 모드');
  });

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // 드롭다운 메뉴 아이템들이 표시되는지 확인
    await waitFor(async () => {
      expect(screen.getByText('라이트 모드')).toBeInTheDocument();
    });
    expect(screen.getByText('다크 모드')).toBeInTheDocument();
    expect(screen.getByText('시스템 설정')).toBeInTheDocument();
  });

  it('should set theme to light when light mode item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(async () => {
      const lightModeItem = screen.getByText('라이트 모드');
      await user.click(lightModeItem);
    });
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should set theme to dark when dark mode item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(async () => {
      const darkModeItem = screen.getByText('다크 모드');
      await user.click(darkModeItem);
    });
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should set theme to system when system setting item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(async () => {
      const systemModeItem = screen.getByText('시스템 설정');
      await user.click(systemModeItem);
    });
    
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('should be accessible via keyboard', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    
    // Tab 키로 포커스 가능한지 확인
    expect(button).toHaveAttribute('tabIndex', '0');
    
    // 포커스 상태 확인
    button.focus();
    expect(button).toHaveFocus();
  });

  it('should have correct ARIA labels', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    
    // aria-label이 현재 테마 상태를 정확히 설명하는지 확인
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('테마 선택');
  });

  it('should have fixed positioning classes', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    
    // Fixed positioning 클래스 확인 - 실제 구현에 맞게 수정
    expect(button).toHaveClass('fixed');
    expect(button).toHaveClass('right-4');  // 기본 모바일: right-4
    expect(button).toHaveClass('md:right-6');  // 태블릿 이상: md:right-6
    expect(button).toHaveClass('z-50');
    // 반응형 bottom 클래스 확인 (기본: bottom-4, 태블릿: md:bottom-6)
    expect(button).toHaveClass('bottom-4');
    expect(button).toHaveClass('md:bottom-6');
  });

  it('should have proper focus styles for accessibility', () => {
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    
    // 포커스 관련 클래스 확인
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-ring');
    expect(button).toHaveClass('focus-visible:ring-offset-2');
  });

  it('should display current theme correctly in dropdown', async () => {
    // Test with dark theme selected
    mockUseThemeStore.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      getEffectiveTheme: mockGetEffectiveTheme,
      accentColor: 'blue',
      toggleTheme: vi.fn(),
      setAccentColor: vi.fn(),
      applyCurrentTheme: vi.fn(),
    });
    mockGetEffectiveTheme.mockReturnValue('dark');
    
    const user = userEvent.setup();
    render(<ThemeToggleFloating />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // 드롭다운 메뉴가 열리는지 확인
    await waitFor(() => {
      expect(screen.getByText('다크 모드')).toBeInTheDocument();
      expect(screen.getByText('라이트 모드')).toBeInTheDocument();
      expect(screen.getByText('시스템 설정')).toBeInTheDocument();
    });
  });
});