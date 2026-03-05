// ============================================================
// ADMIN LAYOUT — CEO (UNIT_OWNER) Top-Nav
// ============================================================
// Padrão idêntico ao Adulto/Kids: barra superior + bottom nav.
// Sem sidebar. Sem SUPPORT (vive em /developer).
// ============================================================
'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { AppShell } from '@/components/shell';
import { ADMIN_SHELL_CONFIG } from './shell.config';

const ADMIN_TYPES = [
  'UNIT_OWNER', 'ADMINISTRADOR', 'SUPER_ADMIN', 'GESTOR',
] as const;

function AdminLayoutInner({ children }: { children: ReactNode }) {
  return (
    <AppShell config={ADMIN_SHELL_CONFIG}>
      {children}
    </AppShell>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('admin');
  return (
    <ProtectedRoute
      allowedTypes={[...ADMIN_TYPES]}
      loadingText={t('dashboard.loadingPanel')}
    >
      <GlobalSearchProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
