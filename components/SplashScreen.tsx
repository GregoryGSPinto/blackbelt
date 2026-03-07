'use client';

import { useEffect, useState } from 'react';

/**
 * SplashScreen — Animated logo + loading bar overlay with automatic theme detection.
 * Shows once per browser session with fade-in logo + scale animation.
 * Adapts to system color scheme preference (light/dark).
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'loading' | 'fadeout'>('hidden');

  useEffect(() => {
    try {
      if (sessionStorage.getItem('blackbelt_splash')) return;
      setPhase('loading');
    } catch {
      setPhase('loading');
    }
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(() => setPhase('fadeout'), 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fadeout') return;
    sessionStorage.setItem('blackbelt_splash', '1');
    const timer = setTimeout(() => setPhase('hidden'), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  // Detect system color scheme preference
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (phase === 'hidden') return null;

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Theme-aware colors
  const bg = isDark ? '#0a0a0a' : '#f5f5f5';
  const barTrack = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  return (
    <div
      role="status"
      aria-label="Loading BlackBelt"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: prefersReduced ? 'none' : 'opacity 800ms ease-out',
        pointerEvents: phase === 'fadeout' ? 'none' : 'auto',
      }}
    >
      {/* Logo with fade-in + scale animation */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-blackbelt.png"
        alt=""
        style={{
          width: 80,
          height: 80,
          objectFit: 'contain',
          marginBottom: 32,
          animation: prefersReduced ? 'none' : 'splash-logo 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          opacity: 0,
        }}
      />

      {/* Loading bar */}
      <div
        style={{
          width: 240,
          height: 4,
          background: barTrack,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark ? '0 0 10px rgba(201, 162, 39, 0.3)' : '0 0 10px rgba(201, 162, 39, 0.2)',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '40%',
            background: 'linear-gradient(90deg, transparent, #C9A227, #FFD11A, #C9A227, transparent)',
            animation: prefersReduced ? 'none' : 'splash-bar 1.2s ease-in-out infinite',
            boxShadow: '0 0 8px rgba(201, 162, 39, 0.8)',
          }}
        />
      </div>

      <span className="sr-only">Loading...</span>

      <style>{`
        @keyframes splash-logo {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </div>
  );
}
