'use client';

import { memo } from 'react';
import { useFormatting } from '@/hooks/useFormatting';

interface LevelUp {
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  title: string;
}

interface XPProgressBarProps {
  levelUp: LevelUp;
}

/**
 * XPProgressBar — Barra de XP gamificada com gradiente e animacao de Level Up
 */
const XPProgressBar = memo(function XPProgressBar({ levelUp }: XPProgressBarProps) {
  const { formatNumber } = useFormatting();
  const { currentXP, nextLevelXP, progress, title } = levelUp;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isNearLevelUp = clampedProgress > 90;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-zinc-200 font-bold text-lg tracking-tight">
          {title}
        </h3>
        {isNearLevelUp && (
          <span className="text-xs font-bold text-purple-400 animate-pulse bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1">
            Level Up!
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700 ease-out ${
            isNearLevelUp ? 'shadow-[0_0_12px_rgba(168,85,247,0.5)]' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* XP Text */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {formatNumber(currentXP)} / {formatNumber(nextLevelXP)} XP
        </span>
        <span className="text-sm font-semibold text-zinc-400">
          {clampedProgress}%
        </span>
      </div>
    </div>
  );
});

export default XPProgressBar;
