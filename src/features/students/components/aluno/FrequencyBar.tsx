// ============================================================
// FrequencyBar — Animated Horizontal Frequency Visualization
// ============================================================
// Full-width bar 0-100%, gradient red→yellow→green.
// Shows weekly mini-bars for the last 4 weeks.
// Grow-from-left animation on mount.
// ============================================================
'use client';

import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const FREQ_STYLES = `
  @keyframes freq-grow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes freq-mini-grow {
    from { height: 0; }
  }
`;

interface FrequencyBarProps {
  /** Total classes attended this month */
  sessõesAssistidas: number;
  /** Monthly goal */
  metaMensal: number;
  /** 0-100 */
  percentual: number;
  /** Variation vs previous month (positive = improvement) */
  variacao: number;
  /** Trend direction */
  tendencia: 'up' | 'down' | 'stable';
  /** Last 4 weeks attendance count */
  historicoSemanal?: number[];
  /** Max classes per week (for mini bar scale) */
  maxSemanal?: number;
}

export function FrequencyBar({
  sessõesAssistidas,
  metaMensal,
  percentual,
  variacao,
  tendencia,
  historicoSemanal = [],
  maxSemanal = 6,
}: FrequencyBarProps) {
  const pct = Math.min(100, Math.max(0, percentual));
  const faltam = Math.max(0, metaMensal - sessõesAssistidas);

  // Gradient color based on percentage
  const barGradient = pct >= 80
    ? 'from-emerald-600 to-emerald-400'
    : pct >= 50
    ? 'from-yellow-600 to-yellow-400'
    : 'from-red-600 to-red-400';

  const TrendIcon = tendencia === 'up' ? TrendingUp : tendencia === 'down' ? TrendingDown : Minus;
  const trendColor = tendencia === 'up' ? 'text-emerald-400' : tendencia === 'down' ? 'text-red-400' : 'text-white/30';
  const trendText = tendencia === 'up' ? `+${variacao}%` : tendencia === 'down' ? `${variacao}%` : '—';

  const semanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: FREQ_STYLES }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Target size={15} className="text-emerald-400/70" />
          Frequência Mensal
        </h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-xs font-medium">{trendText}</span>
          <span className="text-white/20 text-[10px] ml-0.5">vs anterior</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="relative h-4 rounded-full bg-white/[0.06] overflow-hidden mb-2">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barGradient}`}
          style={{
            width: `${pct}%`,
            transformOrigin: 'left',
            animation: 'freq-grow 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-white font-medium">
          {sessõesAssistidas}
          <span className="text-white/30 font-normal text-sm">/{metaMensal} sessões</span>
        </span>
        {faltam > 0 ? (
          <span className="text-white/40 text-xs">
            Faltam <span className="text-white/70 font-medium">{faltam}</span> para a meta
          </span>
        ) : (
          <span className="text-emerald-400 text-xs font-medium">Meta atingida! 🎉</span>
        )}
      </div>

      {/* Weekly Mini Bars */}
      {historicoSemanal.length > 0 && (
        <div>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">Últimas semanas</p>
          <div className="flex items-end gap-2 h-12">
            {historicoSemanal.map((count, i) => {
              const h = Math.max(8, (count / maxSemanal) * 100);
              const miniColor = count >= maxSemanal * 0.7
                ? 'bg-emerald-500/60'
                : count >= maxSemanal * 0.4
                ? 'bg-yellow-500/60'
                : 'bg-red-500/40';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-10">
                    <div
                      className={`w-full max-w-[28px] rounded-t-md ${miniColor}`}
                      style={{
                        height: `${h}%`,
                        animation: `freq-mini-grow 600ms cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 100}ms both`,
                      }}
                    />
                  </div>
                  <span className="text-white/20 text-[9px]">{semanas[i] || `S${i + 1}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
