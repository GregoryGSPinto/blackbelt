'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { KidsGatekeeper } from './KidsGatekeeper';

interface InactivityGuardProps {
  children: React.ReactNode;
  /** Tempo de inatividade em minutos até lock (default: 5) */
  inactivityMinutes?: number;
  /** Bloquear ao perder foco da aba (default: true) */
  lockOnBlur?: boolean;
  /** Se o guard está ativo (default: true) */
  enabled?: boolean;
  /** Callback ao desbloquear */
  onUnlock?: () => void;
}

/**
 * InactivityGuard — Auto-lock para área Kids.
 *
 * Bloqueia a tela automaticamente quando:
 * 1. Usuário fica inativo por X minutos
 * 2. Aba/janela perde foco (lockOnBlur)
 *
 * Fluxo: inativo → gatekeeper PIN/bio → unlock
 * (sem tela intermediária "Desbloquear")
 */
export function InactivityGuard({
  children,
  inactivityMinutes = 5,
  lockOnBlur = true,
  enabled = true,
  onUnlock,
}: InactivityGuardProps) {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityMs = inactivityMinutes * 60 * 1000;

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsLocked(true);
    }, inactivityMs);
  }, [enabled, inactivityMs]);

  // Monitorar atividade do usuário
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handler = () => {
      if (!isLocked) resetTimer();
    };

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, isLocked, resetTimer]);

  // Monitorar foco da aba
  useEffect(() => {
    if (!enabled || !lockOnBlur) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, lockOnBlur]);

  const handleUnlock = () => {
    setIsLocked(false);
    resetTimer();
    onUnlock?.();
  };

  if (!enabled) return <>{children}</>;

  return (
    <>
      {children}

      {/* Gatekeeper direto — sem tela intermediária */}
      <KidsGatekeeper
        isOpen={isLocked}
        onSuccess={handleUnlock}
        onCancel={() => {}} // Não permite cancelar lock por inatividade
        hideCancelButton={true}
      />
    </>
  );
}

export default InactivityGuard;
