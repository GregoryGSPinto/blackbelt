'use client';

/**
 * PremiumLoader — Full-screen loading with logo + horizontal progress bar.
 * Matches the premium login splash design pattern.
 *
 * Usage:
 *   <PremiumLoader />                     — default, no text
 *   <PremiumLoader text="Carregando..." /> — with subtitle
 */
export function PremiumLoader({ text }: { text?: string }) {
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
            animation: 'premium-bar-slide 1.2s ease-in-out infinite',
          }}
        />
      </div>
      {text && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          {text}
        </p>
      )}
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
