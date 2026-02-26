'use client';

import { Trophy, TrendingUp, Flame } from 'lucide-react';

interface PointsBadgeProps {
  pontos: number;
  posicao?: number;
  streak?: number;
  /** Variant: 'compact' for header/profile, 'full' for ranking page */
  variant?: 'compact' | 'full';
}

/**
 * PointsBadge — Badge visual com total de pontos do aluno.
 * Usa glassmorphism consistente com design system BlackBelt.
 */
export default function PointsBadge({
  pontos,
  posicao,
  streak,
  variant = 'compact',
}: PointsBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20">
        <Trophy size={14} className="text-amber-400" />
        <span className="text-sm font-bold text-amber-300">
          {pontos.toLocaleString('pt-BR')}
        </span>
        <span className="text-[10px] text-amber-400/60 uppercase tracking-wider">pts</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Pontos */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
            <Trophy size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-white">
              {pontos.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-wider">pontos totais</p>
          </div>
        </div>

        {/* Posição + Streak */}
        <div className="flex items-center gap-4">
          {posicao !== undefined && (
            <div className="text-center">
              <div className="flex items-center gap-1">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-lg font-bold text-white">#{posicao}</span>
              </div>
              <p className="text-[10px] text-white/40 uppercase">posição</p>
            </div>
          )}
          {streak !== undefined && streak > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Flame size={14} className="text-orange-400" />
                <span className="text-lg font-bold text-white">{streak}</span>
              </div>
              <p className="text-[10px] text-white/40 uppercase">streak</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
