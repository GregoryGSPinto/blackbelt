'use client';

import { memo } from 'react';

interface Challenge {
  rivalName: string;
  rivalAvatar?: string;
  metric: string;
  yourScore: number;
  rivalScore: number;
}

interface RivalChallengeCardProps {
  challenge: Challenge | undefined;
}

/**
 * RivalChallengeCard — Card de desafio PvP com comparacao visual de scores
 */
const RivalChallengeCard = memo(function RivalChallengeCard({ challenge }: RivalChallengeCardProps) {
  if (!challenge) return null;

  const { rivalName, rivalAvatar, metric, yourScore, rivalScore } = challenge;
  const maxScore = Math.max(yourScore, rivalScore, 1);
  const youWinning = yourScore >= rivalScore;
  const rivalWinning = rivalScore > yourScore;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5">
      {/* VS Header */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1">
          <span className="text-red-400 font-medium text-sm tracking-wider">VS</span>
        </div>
      </div>

      {/* Competitors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* You */}
        <div
          className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
            youWinning
              ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_16px_rgba(16,185,129,0.1)]'
              : 'border-zinc-700/50 bg-zinc-800/30'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg mb-2">
            🥋
          </div>
          <span className="text-xs text-zinc-400 mb-1">Voce</span>
          <span className="text-xl font-medium text-zinc-200">{yourScore}</span>
        </div>

        {/* Rival */}
        <div
          className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
            rivalWinning
              ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_16px_rgba(16,185,129,0.1)]'
              : 'border-zinc-700/50 bg-zinc-800/30'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg mb-2">
            {rivalAvatar || '👤'}
          </div>
          <span className="text-xs text-zinc-400 mb-1 truncate max-w-full">{rivalName}</span>
          <span className="text-xl font-medium text-zinc-200">{rivalScore}</span>
        </div>
      </div>

      {/* Score Comparison Bars */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-12 text-right shrink-0">Voce</span>
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                youWinning ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(yourScore / maxScore) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-12 text-right shrink-0 truncate">{rivalName}</span>
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rivalWinning ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${(rivalScore / maxScore) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric Description */}
      <p className="text-center text-xs text-zinc-500">{metric}</p>
    </div>
  );
});

export default RivalChallengeCard;
