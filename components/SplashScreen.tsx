'use client';

import { useEffect, useState } from 'react';

/**
 * SplashScreen — Animated logo + loading bar overlay.
 * Shows once per browser session with fade-in logo + scale animation.
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

  if (phase === 'hidden') return null;

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
        background: '#0a0a0a',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: prefersReduced ? 'none' : 'opacity 800ms ease-out',
        pointerEvents: phase === 'fadeout' ? 'none' : 'auto',
      }}
    >
      {/* Logo with fade-in + scale animation */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-blackbelt.png"
        alt="BlackBelt"
        style={{
          width: 80,
          height: 80,
          objectFit: 'contain',
          marginBottom: 24,
          animation: prefersReduced ? 'none' : 'splash-logo 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          opacity: 0,
        }}
      />

      {/* App name */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.05em',
          marginBottom: 32,
          animation: prefersReduced ? 'none' : 'splash-text 1s ease-out 0.3s forwards',
          opacity: 0,
          background: 'linear-gradient(135deg, #C9A227, #FFD11A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        BLACKBELT
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: 200,
          height: 2,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '60%',
            background: 'linear-gradient(90deg, transparent, #C9A227, transparent)',
            animation: prefersReduced ? 'none' : 'splash-bar 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <span className="sr-only">Loading...</span>

      <style>{`
        @keyframes splash-logo {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-text {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
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
