"use client";

/**
 * CinematicBackground - HIGH VISIBILITY VERSION
 * Imagem bem visível com overlay suave.
 */
export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Imagem fixa */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/bg-dark.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Light Sweep */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="light-sweep"></div>
      </div>

      {/* Overlay MUITO suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
    </div>
  );
}
