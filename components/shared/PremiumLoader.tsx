'use client';

import { useMounted } from '@/hooks/useMounted';

interface PremiumLoaderProps {
  text?: string;
}

const baseStyles = {
  position: 'fixed' as const,
  inset: 0,
  background: '#0a0a0a',
  zIndex: 9999,
};

const spinnerStyles = {
  width: 280,
  height: 4,
  background: 'rgba(255,255,255,0.12)',
  borderRadius: 2,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  boxShadow: '0 0 20px rgba(255,255,255,0.1)',
};

const fillStyles = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  height: '100%',
  width: '40%',
  background: 'linear-gradient(90deg, transparent, #C9A227, #FFD11A, #C9A227, transparent)',
  animation: 'premium-bar-slide 1.2s ease-in-out infinite',
  boxShadow: '0 0 10px rgba(201, 162, 39, 0.6)',
};

export function PremiumLoader({ text = 'Carregando...' }: PremiumLoaderProps) {
  const mounted = useMounted();

  if (!mounted) {
    return <div style={baseStyles} />;
  }

  return (
    <section
      role="status"
      aria-label={text}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
      style={{
        ...baseStyles,
        padding: '3rem',
      }}
    >
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A227" strokeWidth="2" />
          <text x="50" y="55" textAnchor="middle" fill="#C9A227" fontSize="40" fontWeight="bold">
            B
          </text>
        </svg>
      </div>

      <div style={spinnerStyles} aria-hidden="true">
        <div style={fillStyles} />
      </div>

      <span className="sr-only">{text}</span>

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
