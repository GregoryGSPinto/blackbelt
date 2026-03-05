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
 * These are unique to the professor area's cinematographic system
 * and are injected into the AppShell via theme.backgroundOverlays.
 */
function ProfessorBackgroundOverlays() {
  return (
    <>
      {/* Light sweep animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="prof-light-sweep" />
      </div>
      {/* Multi-layer cinematic gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#1a150e]/55 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a06]/90 via-transparent to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, rgba(13,10,6,0.6) 100%)',
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
