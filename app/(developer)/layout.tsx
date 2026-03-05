// ============================================================
// DEVELOPER LAYOUT — Top-Nav, Dark/Light Toggle
// ============================================================
// Access: SUPPORT + SYS_AUDITOR
// Theme: Emerald with dual mode (dark/light)
// Pattern: Idêntico ao Adulto/Kids (barra superior + bottom nav)
// ============================================================
'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/shell';
import { DEV_SHELL_CONFIG } from './shell.config';

const DEV_TYPES = ['SYS_AUDITOR', 'SUPPORT', 'SUPER_ADMIN'] as const;

function DevLayoutInner({ children }: { children: ReactNode }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell
      config={DEV_SHELL_CONFIG}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      {children}
    </AppShell>
  );
}

export default function DeveloperLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('developer.layout');
  return (
    <ProtectedRoute allowedTypes={[...DEV_TYPES]} loadingText={t('loading')}>
      <GlobalSearchProvider>
        <DevLayoutInner>{children}</DevLayoutInner>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
