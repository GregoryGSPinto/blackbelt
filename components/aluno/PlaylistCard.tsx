// ============================================================
// PlaylistCard — Student-facing playlist card with progress
// ============================================================
'use client';

import { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Check, ListMusic } from 'lucide-react';
import type { Playlist } from '@/lib/__mocks__/playlist.mock';

const TIPO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  semanal: { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA', label: 'Semanal' },
  tecnica: { bg: 'rgba(168,85,247,0.12)', text: '#C084FC', label: 'Técnica' },
  campeonato: { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', label: 'Campeonato' },
  individual: { bg: 'rgba(34,197,94,0.12)', text: '#4ADE80', label: 'Para Você' },
  custom: { bg: 'rgba(255,255,255,0.06)', text: '#9CA3AF', label: 'Custom' },
};

interface PlaylistCardProps {
  playlist: Playlist;
  watchedVideoIds?: Set<string>;
  onVideoClick?: (videoId: string) => void;
}

export function PlaylistCard({ playlist, watchedVideoIds = new Set(), onVideoClick }: PlaylistCardProps) {
  const [expanded, setExpanded] = useState(false);
  const total = playlist.videoIds.length;
  const watched = playlist.videoIds.filter((id: string) => watchedVideoIds.has(id)).length;
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
  const tipoConf = TIPO_COLORS[playlist.tipo] || TIPO_COLORS.custom;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: tipoConf.bg }}
        >
          <ListMusic size={16} style={{ color: tipoConf.text }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white/80 truncate">{playlist.titulo}</p>
            <span
              className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: tipoConf.bg, color: tipoConf.text }}
            >
              {tipoConf.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-white/30">{watched}/{total} vídeos</span>
            {/* Progress bar */}
            <div className="flex-1 h-1 rounded-full bg-white/[0.06] max-w-[100px]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: tipoConf.text }}
              />
            </div>
            <span className="text-[10px] font-bold" style={{ color: tipoConf.text }}>{pct}%</span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={14} className="text-white/20 flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-white/20 flex-shrink-0" />
        )}
      </button>

      {/* Expanded — video list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-1">
          {playlist.videoIds.map((videoId: string, idx: number) => {
            const isWatched = watchedVideoIds.has(videoId);
            return (
              <button
                key={`${videoId}-${idx}`}
                onClick={() => onVideoClick?.(videoId)}
                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-[10px] text-white/15 w-4 text-right">{idx + 1}</span>
                {isWatched ? (
                  <Check size={12} className="text-green-400/60 flex-shrink-0" />
                ) : (
                  <Play size={10} className="text-white/20 flex-shrink-0" />
                )}
                <span className={`text-xs truncate ${isWatched ? 'text-white/30 line-through' : 'text-white/60'}`}>
                  Vídeo {videoId.replace('pv-', '#')}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
