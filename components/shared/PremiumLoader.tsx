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
    <div 
      role="status" 
      aria-label="Loading" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: bg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999 
      }}
    >
      <div 
        style={{ 
          width: 280, 
          height: 4, 
          background: barTrack, 
          borderRadius: 2,
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: isDark ? '0 0 20px rgba(255,255,255,0.1)' : '0 0 20px rgba(0,0,0,0.1)',
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
            animation: 'premium-bar-slide 1s ease-in-out infinite',
            boxShadow: '0 0 10px rgba(201, 162, 39, 0.6)',
          }} 
        />
      </div>
      <span className="sr-only">Loading...</span>
      <style>{`
        @keyframes premium-bar-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
