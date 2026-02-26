// ============================================================
// TEEN LAYOUT — Composable AppShell
// ============================================================
// Before: 713 lines of duplicated UI code
// After:  ~40 lines of pure configuration + composition
// ============================================================
'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/shell';
import { TEEN_SHELL_CONFIG } from './shell.config';
import { ProfileSwipeWrapper } from '@/components/shared/ProfileSwipeIndicator';

function TeenLayoutInner({ children }: { children: ReactNode }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <AppShell
      config={TEEN_SHELL_CONFIG}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      <ProfileSwipeWrapper>{children}</ProfileSwipeWrapper>
    </AppShell>
  );
}

export default function TeenLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedTypes={['ALUNO_TEEN']} loadingText="Carregando...">
      <GlobalSearchProvider>
        <TeenLayoutInner>{children}</TeenLayoutInner>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
