"use client";

export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Solid background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#0a0a0a' }}
      />
    </div>
  );
}
