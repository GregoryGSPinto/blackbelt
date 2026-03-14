'use client';

import { memo } from 'react';

interface EarnedSticker {
  id: string;
  name: string;
  image: string;
}

interface NextSticker {
  name: string;
  hint: string;
  progress: number;
}

interface Stickers {
  earned: EarnedSticker[];
  nextToEarn: NextSticker;
}

interface StickerCollectionProps {
  stickers: Stickers;
}

/**
 * StickerCollection — Grid de stickers coletados com preview do proximo
 */
const StickerCollection = memo(function StickerCollection({ stickers }: StickerCollectionProps) {
  const { earned, nextToEarn } = stickers;
  const clampedProgress = Math.min(100, Math.max(0, nextToEarn.progress));

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏆</span>
        <h3 className="text-zinc-200 font-semibold text-lg">Meus Stickers</h3>
        <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">
          {earned.length} coletados
        </span>
      </div>

      {/* Earned Stickers Grid */}
      {earned.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {earned.map((sticker) => (
            <div
              key={sticker.id}
              className="flex flex-col items-center justify-center bg-zinc-800/50 border border-white/[0.06] rounded-lg p-3 aspect-square hover:scale-105 transition-transform duration-200"
            >
              {sticker.image ? (
                <img
                  src={sticker.image}
                  alt={sticker.name}
                  className="w-10 h-10 object-contain mb-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-1">
                  <span className="text-yellow-400 text-lg font-medium">
                    {sticker.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-zinc-400 text-center leading-tight truncate max-w-full">
                {sticker.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 mb-5">
          <span className="text-3xl mb-2 block">🎯</span>
          <p className="text-sm text-zinc-500">Nenhum sticker ainda. Continue treinando!</p>
        </div>
      )}

      {/* Next Sticker Section */}
      <div className="bg-zinc-800/50 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">✨</span>
          <h4 className="text-sm font-semibold text-amber-400">Proximo Sticker</h4>
        </div>
        <p className="text-sm text-zinc-200 font-semibold mb-1">{nextToEarn.name}</p>
        <p className="text-xs text-zinc-500 mb-3">{nextToEarn.hint}</p>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 mt-1 inline-block">{clampedProgress}%</span>
      </div>
    </div>
  );
});

export default StickerCollection;
