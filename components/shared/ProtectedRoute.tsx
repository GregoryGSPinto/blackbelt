'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRedirectForProfile, type TipoPerfil } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

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
 * Resultado: user=null → redirect para /landing → loop.
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">{text}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedTypes = [],
  loadingText = 'Carregando...',
}: ProtectedRouteProps) {
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
      logger.info('[ProtectedRoute]', 'Sem sessão, redirecionando para /landing');
      redirectedRef.current = true;
      router.replace('/landing');
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
  if (loading) return <FullScreenSpinner text={loadingText} />;
  if (waitingForSync) return <FullScreenSpinner text="Entrando..." />;
  if (!user) return <FullScreenSpinner text="Redirecionando..." />;
  if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    return <FullScreenSpinner text="Redirecionando..." />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
