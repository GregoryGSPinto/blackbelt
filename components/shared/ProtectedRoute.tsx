'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth, getRedirectForProfile, type TipoPerfil } from '@/features/auth/context/AuthContext';
import { logger } from '@/lib/logger';
import { PremiumLoader } from './PremiumLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: TipoPerfil[];
  loadingText?: string;
}

/**
 * ProtectedRoute — Proteção client-side de rotas.
 *
 * FIX: Race condition no primeiro login.
 *
 * Quando login chama setUser() + router.replace('/dashboard'), o React
 * pode NÃO ter flushado o state antes do ProtectedRoute renderizar.
 * Resultado: user=null → redirect para /login → loop.
 *
 * SOLUÇÃO: Quando user=null mas existe sessão no localStorage,
 * aguardamos o React state sincronizar (max 2s safety net).
 */

const SESSION_KEY = 'blackbelt_session';
const TOKEN_KEY = 'blackbelt_token';

function hasPersistedSession(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(TOKEN_KEY) && !!localStorage.getItem(SESSION_KEY);
}

function FullScreenSpinner({ text }: { text: string }) {
  return <PremiumLoader text={text} />;
}

export function ProtectedRoute({
  children,
  allowedTypes = [],
  loadingText,
}: ProtectedRouteProps) {
  const t = useTranslations('common.actions');
  const effectiveLoadingText = loadingText || t('loading');
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);
  const [waitingForSync, setWaitingForSync] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FASE 1: Quando loading termina, decidir se precisa aguardar sync
  useEffect(() => {
    if (loading) {
      redirectedRef.current = false;
      setWaitingForSync(false);
      return;
    }

    if (user) {
      setWaitingForSync(false);
      return;
    }

    // user=null + loading=false → checar localStorage
    if (hasPersistedSession()) {
      logger.info('[ProtectedRoute]', 'Sessão no localStorage, aguardando state sync...');
      setWaitingForSync(true);

      // Safety net: reload se state não sincronizar em 2s
      syncTimerRef.current = setTimeout(() => {
        logger.warn('[ProtectedRoute]', 'State não sincronizou em 2s, reload');
        window.location.reload();
      }, 2000);

      return () => {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      };
    }

    setWaitingForSync(false);
  }, [loading, user]);

  // FASE 2: Quando user aparece, cancelar timer
  useEffect(() => {
    if (user && waitingForSync) {
      logger.info('[ProtectedRoute]', 'State sincronizado');
      setWaitingForSync(false);
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    }
  }, [user, waitingForSync]);

  // FASE 3: Redirect (só quando não está sincronizando)
  useEffect(() => {
    if (loading || waitingForSync) return;
    if (redirectedRef.current) return;

    if (!user) {
      logger.info('[ProtectedRoute]', 'Sem sessão, redirecionando para /login');
      redirectedRef.current = true;
      router.replace('/login');
      return;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
      const correctRoute = getRedirectForProfile(user.tipo);
      logger.info('[ProtectedRoute]', `Tipo ${user.tipo} não permitido → ${correctRoute}`);
      redirectedRef.current = true;
      router.replace(correctRoute);
    }
  }, [loading, waitingForSync, user, allowedTypes, router]);

  // RENDER
  if (loading) return <FullScreenSpinner text={effectiveLoadingText} />;
  if (waitingForSync) return <FullScreenSpinner text={t('entering')} />;
  if (!user) return <FullScreenSpinner text={t('redirecting')} />;
  if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    return <FullScreenSpinner text={t('redirecting')} />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
