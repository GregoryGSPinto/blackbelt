// ============================================================
// VideoProgressCard — Visual progress summary by category
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { Play, Heart, Trophy } from 'lucide-react';
import * as progressService from '@/lib/api/video-progress.service';
import type { VideoProgressSummary } from '@/lib/api/video-progress.service';

const CAT_COLORS: Record<string, string> = {
  'Fundamentos': '#3B82F6',
  'Passagens': '#8B5CF6',
  'Finalizações': '#EF4444',
  'Defesa': '#22C55E',
  'Drills': '#F59E0B',
};

export function VideoProgressCard() {
  const [data, setData] = useState<VideoProgressSummary | null>(null);

  useEffect(() => {
    progressService.getProgressSummary().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play size={14} className="text-blue-400" />
          <p className="text-xs font-bold text-white/60">Meu Aprendizado</p>
        </div>
        {data.totalAssistidos >= 10 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Trophy size={10} className="text-amber-400" />
            <span className="text-[9px] font-bold text-amber-300">Maratonista</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <Play size={10} className="text-blue-400/60" />
          <span className="text-xs text-white/50">{data.totalAssistidos} assistidos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart size={10} className="text-red-400/60" />
          <span className="text-xs text-white/50">{data.totalFavoritos} favoritos</span>
        </div>
        <span className="text-xs text-white/25">~{data.horasEstimadas}h</span>
      </div>

      {/* Category bars */}
      <div className="space-y-2.5">
        {data.porCategoria.map((cat) => {
          const pct = cat.total > 0 ? Math.round((cat.assistidos / cat.total) * 100) : 0;
          const color = CAT_COLORS[cat.categoria] || '#6B7280';
          return (
            <div key={cat.categoria} className="flex items-center gap-3">
              <span className="text-[10px] text-white/35 w-20 truncate">{cat.categoria}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="text-[10px] font-bold w-8 text-right" style={{ color }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
