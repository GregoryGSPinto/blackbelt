'use client';

import { useEffect, useState } from 'react';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

/**
 * SplashScreen — Overlay global de carregamento.
 * Exibe apenas 1× por sessão do navegador.
 * Usa PremiumLoader (barra horizontal) em vez de spinner circular.
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'loading' | 'fadeout'>('hidden');

  // Only render on client — check session flag
  useEffect(() => {
    try {
      if (sessionStorage.getItem('blackbelt_splash')) return;
      setPhase('loading');
    } catch {
      setPhase('loading');
    }
  }, []);

  // Auto-dismiss after 2.5s
  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(() => setPhase('fadeout'), 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Fade-out → mark session → hide
  useEffect(() => {
    if (phase !== 'fadeout') return;
    sessionStorage.setItem('blackbelt_splash', '1');
    const timer = setTimeout(() => setPhase('hidden'), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'hidden') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 800ms ease-out',
        pointerEvents: phase === 'fadeout' ? 'none' : 'auto',
      }}
    >
      <PremiumLoader />
    </div>
  );
}
