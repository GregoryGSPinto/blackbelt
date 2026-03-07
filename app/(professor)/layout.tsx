// ============================================================
// PROFESSOR LAYOUT — Composable AppShell
// ============================================================
// Before: 592 lines of duplicated UI code
// After:  ~70 lines (includes custom background overlays)
// ============================================================
'use client';

import { ReactNode, useMemo } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { ActiveClassProvider } from '@/contexts/ActiveClassContext';
import { AppShell } from '@/components/shell';
import { PROFESSOR_SHELL_CONFIG } from './shell.config';
import { OnboardingTour } from '@/components/shared/OnboardingTour';
import { OnboardingTrigger } from '@/components/shared/OnboardingTrigger';
import { QuickActionsFAB } from '@/components/professor/QuickActionsFAB';
import { useTranslations } from 'next-intl';

/**
 * Professor-specific background overlays.
 * Uses theme-aware colors that adapt to light/dark mode automatically.
 */
function ProfessorBackgroundOverlays() {
  return (
    <>
      {/* Light sweep animation - subtle in both modes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="prof-light-sweep" />
      </div>
      {/* Theme-aware cinematic gradients - use CSS variables for automatic theming */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom, var(--gradient-from, rgba(0,0,0,0.1)) 0%, var(--gradient-via, rgba(26,21,14,0.05)) 50%, var(--gradient-to, rgba(0,0,0,0.15)) 100%)',
        }}
      />
    </>
  );
}

function ProfessorLayoutInner({ children }: { children: ReactNode }) {
  // Inject custom background overlays into the theme config
  const config = useMemo(() => ({
    ...PROFESSOR_SHELL_CONFIG,
    theme: {
      ...PROFESSOR_SHELL_CONFIG.theme,
      backgroundOverlays: <ProfessorBackgroundOverlays />,
    },
  }), []);

  return (
    <AppShell config={config}>
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
