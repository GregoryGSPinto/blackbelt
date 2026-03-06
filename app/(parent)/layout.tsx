// ============================================================
// PARENT LAYOUT — Painel do Responsável (AppShell)
// ============================================================
// Refactored to use AppShell like all other route groups.
// ============================================================
'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ParentProvider } from '@/contexts/ParentContext';
import { AppShell } from '@/components/shell';
import { PARENT_SHELL_CONFIG } from './shell.config';
import { OnboardingTour } from '@/components/shared/OnboardingTour';
import { OnboardingTrigger } from '@/components/shared/OnboardingTrigger';

function ParentLayoutInner({ children }: { children: ReactNode }) {
  return (
    <AppShell config={PARENT_SHELL_CONFIG}>
      {children}
      <OnboardingTrigger profileKey="responsavel" />
      <OnboardingTour />
    </AppShell>
  );
}

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      allowedTypes={['RESPONSAVEL']}
      loadingText="Carregando painel..."
    >
      <ParentProvider>
        <ParentLayoutInner>{children}</ParentLayoutInner>
      </ParentProvider>
    </ProtectedRoute>
  );
}
