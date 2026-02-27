'use client';

import type { PedagogicalTipVM } from '@/lib/application/intelligence';

// ════════════════════════════════════════════════════════════════════
// PEDAGOGICAL TIPS BANNER — Dicas pedagogicas scrollaveis
// ════════════════════════════════════════════════════════════════════

interface PedagogicalTipsBannerProps {
  tips: PedagogicalTipVM[];
}

const RELEVANCE_COLORS: Record<string, string> = {
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
};

const CATEGORY_ICONS: Record<string, string> = {
  Retencao: '[R]',
  Progressao: '[P]',
  Motivacao: '[M]',
  Tecnica: '[T]',
};

export function PedagogicalTipsBanner({ tips }: PedagogicalTipsBannerProps) {
  if (tips.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-zinc-400 px-1">Dicas Pedagogicas</h4>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {tips.map((tip, index) => {
          const borderColor = RELEVANCE_COLORS[tip.relevance] ?? RELEVANCE_COLORS.low;
          const icon = CATEGORY_ICONS[tip.category] ?? '[i]';

          return (
            <div
              key={index}
              className={`flex-shrink-0 w-64 rounded-lg border border-zinc-700/50 bg-zinc-900/50 border-l-4 ${borderColor} p-3`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {icon}
                </span>
                <span className="text-[10px] text-zinc-500">{tip.category}</span>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-3">{tip.tip}</p>
              {tip.context && (
                <p className="text-[10px] text-zinc-600 mt-2">{tip.context}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
