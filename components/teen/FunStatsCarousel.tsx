'use client';

import { memo } from 'react';

interface FunStat {
  emoji: string;
  text: string;
}

interface FunStatsCarouselProps {
  stats: FunStat[];
}

const accentBorders = [
  'border-purple-500/30',
  'border-blue-500/30',
  'border-emerald-500/30',
  'border-amber-500/30',
  'border-pink-500/30',
  'border-cyan-500/30',
  'border-red-500/30',
  'border-indigo-500/30',
];

/**
 * FunStatsCarousel — Scroll horizontal de stats divertidos com bordas coloridas
 */
const FunStatsCarousel = memo(function FunStatsCarousel({ stats }: FunStatsCarouselProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
      <div className="inline-flex gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`inline-flex flex-col items-center justify-center min-w-[120px] snap-start rounded-xl border bg-zinc-800/50 p-4 ${
              accentBorders[index % accentBorders.length]
            }`}
          >
            <span className="text-2xl mb-2">{stat.emoji}</span>
            <span className="text-xs text-zinc-400 text-center leading-snug">
              {stat.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default FunStatsCarousel;
