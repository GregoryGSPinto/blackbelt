'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Loading() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ler tema do localStorage ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setIsDark(theme === 'dark');
    setMounted(true);
    
    // Aplicar classe no html para CSS
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // Cores baseadas no tema (mesmas da tela de login)
  const bg = isDark ? '#0a0a0a' : '#f5f5f5';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const barTrack = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const barFill = isDark 
    ? 'linear-gradient(90deg, transparent, #C9A227, #FFD11A, #C9A227, transparent)'
    : 'linear-gradient(90deg, transparent, #B8860B, #DAA520, #B8860B, transparent)';

  // Placeholder durante SSR (evita hydration mismatch)
  if (!mounted) {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: '#0a0a0a',
          zIndex: 9999 
        }}
      />
    );
  }

  return (
    <section
      role="status"
      aria-label="Carregando"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
      style={{
        background: bg,
        padding: '3rem',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Logo - mesmo da tela de login */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <Image
          src="/blackbelt-lion-logo.png"
          alt="BlackBelt"
          fill
          style={{ 
            objectFit: 'contain',
            filter: isDark ? 'none' : 'brightness(0.3)',
          }}
          priority
        />
      </div>

      {/* Barra de Progresso */}
      <div
        style={{
          width: 280,
          height: 4,
          background: barTrack,
          borderRadius: 2,
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
            width: '40%',
            background: barFill,
            animation: 'premium-bar-slide 1.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Texto */}
      <span style={{ color: textColor, fontSize: '1rem', fontWeight: 500 }}>
        Carregando...
      </span>

      <style>{`
        @keyframes premium-bar-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </section>
  );
}
