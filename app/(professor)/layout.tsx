// ============================================================
// PROFESSOR LAYOUT — Top-Nav, Dark/Light Toggle
// ============================================================
// Padrão visual limpo igual ao Suporte (Developer)
// Theme: Gold/Amber com dual mode (dark/light)
// ============================================================
'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { ActiveClassProvider } from '@/contexts/ActiveClassContext';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/shell';
import { PROFESSOR_SHELL_CONFIG } from './shell.config';
import { OnboardingTour } from '@/components/shared/OnboardingTour';
import { OnboardingTrigger } from '@/components/shared/OnboardingTrigger';
import { QuickActionsFAB } from '@/components/professor/QuickActionsFAB';

function ProfessorLayoutInner({ children }: { children: ReactNode }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell
      config={PROFESSOR_SHELL_CONFIG}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      {children}
      <QuickActionsFAB />
      <OnboardingTrigger profileKey="instrutor" />
      <OnboardingTour />
    </AppShell>
  );
}

export default function ProfessorLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('common.actions');
  return (
    <ProtectedRoute allowedTypes={['INSTRUTOR']} loadingText={t('preparing')}>
      <GlobalSearchProvider>
        <ActiveClassProvider>
          <ProfessorLayoutInner>{children}</ProfessorLayoutInner>
        </ActiveClassProvider>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
