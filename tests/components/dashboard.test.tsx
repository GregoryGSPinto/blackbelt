import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.raw = (key: string) => key;
    t.rich = (key: string) => key;
    t.markup = (key: string) => key;
    return t;
  },
}));

// Mock the theme context
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: true }),
}));

vi.mock('@/lib/design-tokens', () => ({
  getDesignTokens: () => ({
    bg: '#0d0d1a',
    bgSecondary: '#1a1a2e',
    text: '#ffffff',
    textMuted: '#9ca3af',
    border: '#374151',
    accent: '#f59e0b',
    card: '#1e1e30',
    cardBorder: '#2d2d44',
  }),
}));

// Mock global search context
vi.mock('@/contexts/GlobalSearchContext', () => ({
  useSearchRegistration: () => ({ register: vi.fn(), unregister: vi.fn() }),
}));

// Mock hooks
vi.mock('@/hooks/useServiceCall', () => ({
  useServiceCall: (fn: () => Promise<any>) => ({
    data: null,
    loading: true,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCachedServiceCall', () => ({
  useCachedServiceCall: () => ({
    data: null,
    loading: true,
    error: null,
    refetch: vi.fn(),
    isCached: false,
    cacheAge: null,
  }),
  TTL: { SHORT: 30000, MEDIUM: 60000, LONG: 300000 },
}));

vi.mock('@/hooks/useFormatting', () => ({
  useFormatting: () => ({
    currency: (v: number) => `R$${v}`,
    percent: (v: number) => `${v}%`,
    number: (v: number) => `${v}`,
  }),
}));

// Mock shared components
vi.mock('@/components/shared/DataStates', () => ({
  PageError: ({ message }: { message: string }) => <div data-testid="error">{message}</div>,
  PageEmpty: ({ message }: { message: string }) => <div data-testid="empty">{message}</div>,
}));

vi.mock('@/components/shared/SkeletonLoader', () => ({
  PageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

vi.mock('@/components/shared/CacheIndicator', () => ({
  CacheIndicator: () => null,
}));

vi.mock('@/components/shared/ProactiveAlert', () => ({
  ProactiveAlertList: () => null,
}));

vi.mock('@/components/admin/ExecutiveDashboard', () => ({
  default: () => <div data-testid="executive-dashboard">Executive</div>,
}));

vi.mock('@/components/admin/OwnerExecutiveDashboard', () => ({
  default: () => <div data-testid="owner-dashboard">Owner</div>,
}));

vi.mock('@/components/shared/WelcomeCard', () => ({
  WelcomeCard: () => <div data-testid="welcome">Welcome</div>,
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('Admin Dashboard Page', () => {
  it('renders without crashing', async () => {
    const DashboardModule = await import('@/app/(admin)/dashboard/page');
    const DashboardPage = DashboardModule.default;

    const { container } = render(<DashboardPage />);
    expect(container).toBeDefined();
  });

  it('shows loading skeleton initially', async () => {
    const DashboardModule = await import('@/app/(admin)/dashboard/page');
    const DashboardPage = DashboardModule.default;

    const { getByTestId } = render(<DashboardPage />);
    expect(getByTestId('skeleton')).toBeDefined();
  });

  it('has proper container structure', async () => {
    const DashboardModule = await import('@/app/(admin)/dashboard/page');
    const DashboardPage = DashboardModule.default;

    const { container } = render(<DashboardPage />);
    // The page should render some HTML content
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
