'use client';

import { memo } from 'react';

interface Quest {
  title: string;
  description: string;
  xpReward: number;
  emoji: string;
}

interface DailyQuestCardProps {
  quest: Quest;
}

/**
 * DailyQuestCard — Card estilo quest de jogo com recompensa de XP
 */
const DailyQuestCard = memo(function DailyQuestCard({ quest }: DailyQuestCardProps) {
  const { title, description, xpReward, emoji } = quest;

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-5 relative overflow-hidden">
      {/* Subtle glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Emoji */}
      <div className="text-4xl mb-3">{emoji}</div>

      {/* Subtitle */}
      <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-1">
        Missao do Dia
      </p>

      {/* Title */}
      <h3 className="text-zinc-200 font-semibold text-lg mb-2 leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
        {description}
      </p>

      {/* XP Reward Badge */}
      <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-full px-3 py-1">
        <span>+</span>
        <span>{xpReward} XP</span>
      </div>
    </div>
  );
});

export default DailyQuestCard;
