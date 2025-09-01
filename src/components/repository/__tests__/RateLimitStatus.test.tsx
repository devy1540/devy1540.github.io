import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RateLimitStatus } from '../RateLimitStatus';
import type { GitHubRateLimit } from '@/types/github';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className} data-testid="alert-triangle-icon" {...props} />
  ),
  Clock: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className} data-testid="clock-icon" {...props} />
  ),
  CheckCircle: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className} data-testid="check-circle-icon" {...props} />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div className={className} data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div className={className} data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div className={className} data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <h3 className={className} data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({
    value,
    className,
    ...props
  }: {
    value?: number;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div
      className={className}
      data-testid="progress"
      data-value={value}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({
    children,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="alert" data-variant={variant} {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="alert-description" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: (string | undefined | null | boolean)[]) =>
    args.filter(Boolean).join(' '),
}));

describe('RateLimitStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed time for consistent testing
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const createMockRateLimit = (
    overrides: Partial<GitHubRateLimit> = {}
  ): GitHubRateLimit => ({
    limit: 5000,
    used: 100,
    remaining: 4900,
    reset: Math.floor(new Date('2024-01-01T13:01:05Z').getTime() / 1000), // Fixed time: 1 hour 1 minute 5 seconds from base time
    ...overrides,
  });

  describe('Loading State', () => {
    it('should render loading state', () => {
      render(<RateLimitStatus rateLimit={null} isLoading={true} />);

      expect(screen.getByTestId('card')).toHaveClass('animate-pulse');
    });
  });

  describe('Compact Mode', () => {
    it('should render compact mode with good status', () => {
      const rateLimit = createMockRateLimit();

      render(<RateLimitStatus rateLimit={rateLimit} compact={true} />);

      expect(screen.getByTestId('badge')).toHaveTextContent('4900/5000');
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('should render compact mode with warning status', () => {
      const rateLimit = createMockRateLimit({
        remaining: 50,
        used: 4950,
      });

      render(<RateLimitStatus rateLimit={rateLimit} compact={true} />);

      expect(screen.getByTestId('badge')).toHaveTextContent('50/5000');
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByText(/Reset in/)).toBeInTheDocument();
    });

    it('should render compact mode with exhausted status', () => {
      const rateLimit = createMockRateLimit({
        remaining: 0,
        used: 5000,
      });

      render(<RateLimitStatus rateLimit={rateLimit} compact={true} />);

      expect(screen.getByTestId('badge')).toHaveTextContent('0/5000');
      expect(screen.getByTestId('badge')).toHaveAttribute(
        'data-variant',
        'destructive'
      );
    });
  });

  describe('Full Mode', () => {
    it('should render full mode with good status', () => {
      const rateLimit = createMockRateLimit();

      render(<RateLimitStatus rateLimit={rateLimit} />);

      expect(screen.getByText('GitHub API Rate Limit')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent('4900 / 5000');
      expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '2'); // (100/5000)*100 = 2%
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('should render full mode with warning status', () => {
      const rateLimit = createMockRateLimit({
        remaining: 50,
        used: 4950,
      });

      render(<RateLimitStatus rateLimit={rateLimit} />);

      expect(screen.getByTestId('badge')).toHaveTextContent('50 / 5000');
      expect(screen.getByTestId('progress')).toHaveAttribute(
        'data-value',
        '99'
      ); // (4950/5000)*100 = 99%
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        /Rate limit is running low/
      );
    });

    it('should render full mode with exhausted status', () => {
      const rateLimit = createMockRateLimit({
        remaining: 0,
        used: 5000,
      });

      render(<RateLimitStatus rateLimit={rateLimit} />);

      expect(screen.getByTestId('badge')).toHaveTextContent('0 / 5000');
      expect(screen.getByTestId('badge')).toHaveAttribute(
        'data-variant',
        'destructive'
      );
      expect(screen.getByTestId('progress')).toHaveAttribute(
        'data-value',
        '100'
      );
      expect(screen.getByTestId('alert')).toHaveAttribute(
        'data-variant',
        'destructive'
      );
      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        /API rate limit exceeded/
      );
    });

    it('should render unknown status when rate limit is null', () => {
      render(<RateLimitStatus rateLimit={null} />);

      expect(
        screen.getByText('Rate limit information unavailable')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Check your GitHub authentication')
      ).toBeInTheDocument();
    });
  });

  describe('Time Until Reset', () => {
    it('should calculate and display time until reset', () => {
      const rateLimit = createMockRateLimit({
        remaining: 50, // Show reset time for warning status
      });

      render(<RateLimitStatus rateLimit={rateLimit} />);

      // Should show time in format like "61m 5s" (1 hour 1 minute 5 seconds)
      expect(screen.getByText(/61m 5s/)).toBeInTheDocument();
    });

    it('should update countdown every second', () => {
      const rateLimit = createMockRateLimit({
        reset: Math.floor(new Date('2024-01-01T12:01:05Z').getTime() / 1000), // 1 minute 5 seconds from base time
        remaining: 50,
      });

      render(<RateLimitStatus rateLimit={rateLimit} />);

      // Initial time should be 1m 5s
      expect(screen.getByText(/1m 5s/)).toBeInTheDocument();

      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Time should update to 1m 4s
      expect(screen.getByText(/1m 4s/)).toBeInTheDocument();
    });

    it('should handle reset time in seconds only', () => {
      const rateLimit = createMockRateLimit({
        reset: Math.floor(new Date('2024-01-01T12:00:30Z').getTime() / 1000), // 30 seconds from base time
        remaining: 50,
      });

      render(<RateLimitStatus rateLimit={rateLimit} />);

      expect(screen.getByText(/30s/)).toBeInTheDocument();
    });

    it('should call onRefresh when reset time is reached', () => {
      const onRefresh = vi.fn();
      const rateLimit = createMockRateLimit({
        reset: Math.floor(new Date('2024-01-01T12:00:01Z').getTime() / 1000), // 1 second from base time
        remaining: 50,
      });

      render(<RateLimitStatus rateLimit={rateLimit} onRefresh={onRefresh} />);

      // Advance time past reset
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onRefresh).toHaveBeenCalled();
      expect(screen.getByText(/Reset available/)).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should apply custom className', () => {
      const rateLimit = createMockRateLimit();

      render(
        <RateLimitStatus rateLimit={rateLimit} className="custom-class" />
      );

      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });

    it('should handle onRefresh callback', () => {
      const onRefresh = vi.fn();
      const rateLimit = createMockRateLimit();

      render(<RateLimitStatus rateLimit={rateLimit} onRefresh={onRefresh} />);

      // The callback is tested in the countdown scenario above
      expect(onRefresh).not.toHaveBeenCalled(); // Should not be called initially
    });
  });
});
