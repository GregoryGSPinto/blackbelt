// ============================================================
// ParentTipsBanner — Banner rotativo de dicas para pais
// ============================================================
// Exibe uma dica por vez com rotacao automatica a cada 8s.
// Indicador de pontos para navegacao visual.
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';

interface ParentTipsBannerProps {
  tips: string[];
}

export function ParentTipsBanner({ tips }: ParentTipsBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeLength = tips.length || 0;

  const advance = useCallback(() => {
    if (safeLength <= 1) return;
    setActiveIndex((prev) => (prev + 1) % safeLength);
  }, [safeLength]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (safeLength <= 1) return;

    const timer = setInterval(advance, 8000);
    return () => clearInterval(timer);
  }, [advance, safeLength]);

  // Reset index if tips change
  useEffect(() => {
    setActiveIndex(0);
  }, [safeLength]);

  if (!tips || tips.length === 0) {
    return null;
  }

  const currentTip = tips[activeIndex] ?? tips[0];

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
          <span className="text-sm text-amber-400">*</span>
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">Dica para Pais</h3>
      </div>

      {/* Tip content */}
      <p className="text-sm text-zinc-400 leading-relaxed min-h-[3rem]">
        {currentTip}
      </p>

      {/* Dots indicator */}
      {safeLength > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {tips.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Dica ${i + 1} de ${safeLength}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-4 bg-amber-500'
                  : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
