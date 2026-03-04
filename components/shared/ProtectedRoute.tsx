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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <img
        src="/images/logo-blackbelt.png"
        alt="BlackBelt"
        style={{ width: 64, height: 64, marginBottom: '3rem', opacity: 0.9 }}
      />
      <div
        style={{
          width: 200,
          height: 1,
          background: 'rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '60%',
            background: 'rgba(255,255,255,0.85)',
            animation: 'bar-slide 1.2s ease-in-out infinite',
          }}
        />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
        {text}
      </p>
      <style>{`
        @keyframes bar-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
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
