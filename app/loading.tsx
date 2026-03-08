export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: '2rem',
      }}
    >
      <div style={{ width: 80, height: 80 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A227" strokeWidth="2" />
          <text x="50" y="55" textAnchor="middle" fill="#C9A227" fontSize="40" fontWeight="bold">
            B
          </text>
        </svg>
      </div>

      <div
        style={{
          width: 280,
          height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
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
            width: '40%',
            background: 'linear-gradient(90deg, transparent, #C9A227, #FFD11A, #C9A227, transparent)',
            animation: 'premium-bar-slide 1.2s ease-in-out infinite',
          }}
        />
      </div>

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
