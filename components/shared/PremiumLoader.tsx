'use client';

/**
 * PremiumLoader — Full-screen loading with theme-aware horizontal bar.
 * No logo, no text — minimal bar only.
 */
export function PremiumLoader(_props?: { text?: string }) {
  const isDark = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : true;

  const bg = isDark ? '#0a0a0a' : '#f5f5f5';
  const barTrack = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const barFill = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';

  return (
    <div role="status" aria-label="Loading" style={{ position: 'fixed', inset: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ width: 200, height: 1, background: barTrack, position: 'relative', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '60%', background: barFill, animation: 'premium-bar-slide 1.2s ease-in-out infinite' }} />
      </div>
      <span className="sr-only">Loading...</span>
      <style>{`
        @keyframes premium-bar-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </div>
  );
}
