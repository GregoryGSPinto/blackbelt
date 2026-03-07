'use client';

import { memo } from 'react';

interface Stars {
  technique: number;
  effort: number;
  behavior: number;
  lastUpdated: string;
}

interface SimpleProgressStarsProps {
  stars: Stars;
}

interface CategoryRowProps {
  label: string;
  emoji: string;
  value: number;
  maxStars?: number;
}

function CategoryRow({ label, emoji, value, maxStars = 5 }: CategoryRowProps) {
  const clamped = Math.min(maxStars, Math.max(0, Math.floor(value)));

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg shrink-0">{emoji}</span>
      <span className="text-sm text-zinc-300 font-medium w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, i) => (
          <span
            key={i}
            className={`text-xl ${
              i < clamped ? 'text-yellow-400' : 'text-zinc-700'
            }`}
          >
            {i < clamped ? '★' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * SimpleProgressStars — Exibicao simples de estrelas por categoria para kids
 */
const SimpleProgressStars = memo(function SimpleProgressStars({ stars }: SimpleProgressStarsProps) {
  const { technique, effort, behavior, lastUpdated } = stars;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⭐</span>
        <h3 className="text-zinc-200 font-semibold text-lg">Minhas Estrelas</h3>
      </div>

      {/* Category Rows */}
      <div className="space-y-3 mb-4">
        <CategoryRow label="Tecnica" emoji="🥋" value={technique} />
        <CategoryRow label="Esforco" emoji="🔥" value={effort} />
        <CategoryRow label="Comportamento" emoji="🤝" value={behavior} />
      </div>

      {/* Last Updated */}
      <p className="text-xs text-zinc-500 text-right">
        Atualizado em {lastUpdated}
      </p>
    </div>
  );
});

export default SimpleProgressStars;
