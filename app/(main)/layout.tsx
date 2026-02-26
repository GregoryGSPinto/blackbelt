// ============================================================
// MAIN (ADULTO) LAYOUT — Composable AppShell
// ============================================================
// Before: 358 lines of duplicated UI code
// After:  ~40 lines of pure configuration + composition
//
// Streaming Premium experience with dual theme (dark/light).
// Uses top-nav variant with morph search + mobile drawer.
// ============================================================
'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/shell';
import { MAIN_SHELL_CONFIG } from './shell.config';
import { ProfileSwipeWrapper } from '@/components/shared/ProfileSwipeIndicator';
import { OnboardingTour } from '@/components/shared/OnboardingTour';
import { OnboardingTrigger } from '@/components/shared/OnboardingTrigger';

function MainLayoutInner({ children }: { children: ReactNode }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <AppShell
      config={MAIN_SHELL_CONFIG}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      <ProfileSwipeWrapper>{children}</ProfileSwipeWrapper>
      <OnboardingTrigger profileKey="aluno" />
      <OnboardingTour />
    </AppShell>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedTypes={['ALUNO_ADULTO']} loadingText="Carregando...">
      <GlobalSearchProvider>
        <MainLayoutInner>{children}</MainLayoutInner>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
