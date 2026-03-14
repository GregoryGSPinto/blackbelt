'use client';

import { memo } from 'react';

type MascotMood = 'happy' | 'excited' | 'encouraging' | 'proud';

interface Adventure {
  currentChapter: string;
  starsCollected: number;
  totalStars: number;
  mascotMessage: string;
  mascotMood: MascotMood;
}

interface AdventureProgressProps {
  adventure: Adventure;
}

const moodEmojis: Record<MascotMood, string> = {
  happy: '😊',
  excited: '🤩',
  encouraging: '💪',
  proud: '🌟',
};

const moodLabels: Record<MascotMood, string> = {
  happy: 'Feliz',
  excited: 'Empolgado',
  encouraging: 'Motivado',
  proud: 'Orgulhoso',
};

/**
 * AdventureProgress — Card de progresso temático de aventura para kids
 */
const AdventureProgress = memo(function AdventureProgress({ adventure }: AdventureProgressProps) {
  const { currentChapter, starsCollected, totalStars, mascotMessage, mascotMood } = adventure;

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-5">
      {/* Chapter Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📖</span>
        <h3 className="text-zinc-200 font-semibold text-lg">
          {currentChapter}
        </h3>
      </div>

      {/* Stars Display */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {Array.from({ length: totalStars }).map((_, i) => (
          <span
            key={i}
            className={`text-2xl transition-transform duration-300 ${
              i < starsCollected ? 'text-yellow-400 scale-100' : 'text-zinc-700 scale-90'
            }`}
          >
            {i < starsCollected ? '★' : '☆'}
          </span>
        ))}
        <span className="ml-2 text-sm text-zinc-400 font-semibold">
          {starsCollected}/{totalStars}
        </span>
      </div>

      {/* Mascot Message */}
      <div className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3 border border-white/[0.06]">
        <span className="text-2xl shrink-0">{moodEmojis[mascotMood]}</span>
        <div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {mascotMessage}
          </p>
          <span className="text-xs text-zinc-500 mt-1 inline-block">
            Mascote esta {moodLabels[mascotMood]}!
          </span>
        </div>
      </div>
    </div>
  );
});

export default AdventureProgress;
