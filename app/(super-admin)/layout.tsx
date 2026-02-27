// ============================================================
// SUPER ADMIN LAYOUT — Top-Nav, Dark/Light Toggle
// ============================================================
// Access: SUPER_ADMIN only
// Theme: Indigo/Violet with dual mode (dark/light)
// ============================================================
'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/shell';
import { SUPER_ADMIN_SHELL_CONFIG } from './shell.config';

function SuperAdminLayoutInner({ children }: { children: ReactNode }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell
      config={SUPER_ADMIN_SHELL_CONFIG}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      {children}
    </AppShell>
  );
}

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedTypes={['SUPER_ADMIN']} loadingText="Carregando painel da plataforma...">
      <GlobalSearchProvider>
        <SuperAdminLayoutInner>{children}</SuperAdminLayoutInner>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
