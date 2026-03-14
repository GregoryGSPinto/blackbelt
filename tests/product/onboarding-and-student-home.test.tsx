import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: true }),
}));

vi.mock('@/lib/design-tokens', () => ({
  getDesignTokens: () => ({
    bg: '#000',
    text: '#fff',
    textMuted: '#999',
    divider: '#333',
    cardBg: '#111',
    cardBorder: '#222',
    success: '#0f0',
    glass: {},
  }),
}));

vi.mock('@/components/onboarding/OnboardingWizard', () => ({
  OnboardingWizard: () => <div>Wizard</div>,
}));

vi.mock('@/components/shared/DataStates', () => ({
  PageError: ({ error }: { error: string }) => <div>{error}</div>,
  PageEmpty: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/components/shared/SkeletonLoader', () => ({
  PageSkeleton: () => <div>Loading</div>,
}));

vi.mock('@/components/shared/CacheIndicator', () => ({
  CacheIndicator: () => null,
}));

vi.mock('@/components/shared/WelcomeCard', () => ({
  WelcomeCard: () => null,
}));

vi.mock('@/components/shared/PostClassFeedback', () => ({
  PostClassFeedback: () => null,
}));

vi.mock('@/src/features/attendance/components/checkin/AlunoCheckinCard', () => ({
  AlunoCheckinCard: () => null,
}));

vi.mock('@/src/features/students/components/aluno/TurmaNotifications', () => ({
  TurmaNotifications: () => null,
}));

vi.mock('@/src/features/students/components/aluno/StudentHomeHeader', () => ({
  StudentHomeHeader: () => null,
}));

vi.mock('@/components/ui/VideoCarousel', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/video/VideoCardEnhanced', () => ({
  VideoCardEnhanced: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>video-card</button>
  ),
}));

vi.mock('@/components/video/VideoHoverPreview', () => ({
  VideoPreviewProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useServiceCall', () => ({
  useServiceCall: () => ({ data: null, loading: false }),
}));

vi.mock('@/hooks/useCachedServiceCall', () => ({
  TTL: { STATIC: 1 },
  useCachedServiceCall: () => ({
    data: [[
      {
        id: 'video-1',
        title: 'Guarda fechada',
        description: 'descricao',
        duration: '10 min',
        instructor: 'Professor A',
        level: 'Iniciante',
        category: 'Fundamentos',
        youtubeId: 'abc123',
      },
    ], []],
    loading: false,
    error: null,
    retry: vi.fn(),
    cacheInfo: null,
    refreshing: false,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/api/content.service', () => ({
  getVideos: vi.fn(),
  getTop10: vi.fn(),
}));

vi.mock('@/src/features/students/services/aluno-home.service', () => ({
  getAlunoHomeData: vi.fn(),
}));

vi.mock('@/app/(auth)/onboarding/step-academy', () => ({
  default: ({ onComplete }: { onComplete: (id: string) => void }) => (
    <button onClick={() => onComplete('academy-1')}>academy-step</button>
  ),
}));

vi.mock('@/app/(auth)/onboarding/step-schedule', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>schedule-step</button>
  ),
}));

vi.mock('@/app/(auth)/onboarding/step-invite', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>invite-step</button>
  ),
}));

vi.mock('@/app/(auth)/onboarding/step-billing', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>billing-step</button>
  ),
}));

import OnboardingPage from '@/app/(auth)/onboarding/page';
import InicioPage from '@/app/(main)/inicio/page';

describe('product flows', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('redirects onboarding completion to the admin dashboard', async () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByText('academy-step'));
    fireEvent.click(screen.getByText('schedule-step'));
    fireEvent.click(screen.getByText('invite-step'));
    fireEvent.click(screen.getByText('billing-step'));
    fireEvent.click(await screen.findByRole('button', { name: /ir para o dashboard/i }));

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('opens the student watchlist from the featured CTA', () => {
    render(<InicioPage />);

    fireEvent.click(screen.getByRole('button', { name: 'menu.myList' }));

    expect(pushMock).toHaveBeenCalledWith('/minha-lista');
  });
});
