// ============================================================
// KIDS LAYOUT — Composable AppShell + Security Guards
// ============================================================
// Before: 288 lines of duplicated UI code
// After:  ~90 lines of configuration + composition
//
// SEGURANÇA:
// 1. InactivityGuard → auto-lock após 5 min inatividade ou perda de foco
// 2. KidsGatekeeper → PIN/biometria obrigatório para:
//    - Trocar perfil
//    - Sair (logout)
//    → Crianças NÃO podem escapar da área sem verificação parental
// ============================================================
'use client';

import { ReactNode, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { InactivityGuard } from '@/components/shared/InactivityGuard';
import { KidsGatekeeper } from '@/components/shared/KidsGatekeeper';
import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/shell';
import { KIDS_SHELL_CONFIG } from './shell.config';

function KidsLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Gatekeeper state — protects logout + profile switch
  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [gatekeeperAction, setGatekeeperAction] = useState<'switch' | 'logout'>('switch');

  const handleGatekeeperLogout = useCallback(() => {
    setGatekeeperAction('logout');
    setShowGatekeeper(true);
  }, []);

  const handleGatekeeperSwitch = useCallback(() => {
    setGatekeeperAction('switch');
    setShowGatekeeper(true);
  }, []);

  const handleGatekeeperSuccess = useCallback(() => {
    setShowGatekeeper(false);
    if (gatekeeperAction === 'switch') {
      router.push('/selecionar-perfil');
    } else {
      logout();
    }
  }, [gatekeeperAction, router, logout]);

  return (
    <InactivityGuard inactivityMinutes={5} lockOnBlur={true} enabled={true}>
      <AppShell
        config={KIDS_SHELL_CONFIG}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onLogout={handleGatekeeperLogout}
        onSwitchProfile={handleGatekeeperSwitch}
      >
        <div className="animate-kids-fade-in">
          {children}
        </div>
      </AppShell>

      {/* Gatekeeper Modal — PIN/biometria verification */}
      <KidsGatekeeper
        isOpen={showGatekeeper}
        onSuccess={handleGatekeeperSuccess}
        onCancel={() => setShowGatekeeper(false)}
      />
    </InactivityGuard>
  );
}

export default function KidsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('common.actions');
  return (
    <ProtectedRoute allowedTypes={['ALUNO_KIDS']} loadingText={t('loading')}>
      <GlobalSearchProvider>
        <KidsLayoutInner>{children}</KidsLayoutInner>
      </GlobalSearchProvider>
    </ProtectedRoute>
  );
}
