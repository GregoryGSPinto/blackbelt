"use client";

export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Imagem fixa */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/blackbelt-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8,
        }}
      />

      {/* Light Sweep */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="light-sweep"></div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/45"></div>
    </div>
  );
}
