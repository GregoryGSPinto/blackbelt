// ============================================================
// FrequencyHistory — Monthly Frequency Bar Chart (Last 6+ Months)
// ============================================================
'use client';

import type { FrequenciaHistorico } from '@/lib/api/evolucao.service';

const HISTORY_STYLES = `
  @keyframes hist-bar-grow {
    from { height: 0; }
  }
`;

interface FrequencyHistoryProps {
  data: FrequenciaHistorico[];
  /** Bar chart height in px */
  height?: number;
}

export function FrequencyHistory({ data, height = 140 }: FrequencyHistoryProps) {
  if (data.length === 0) return null;

  const maxSessões = Math.max(...data.map(d => d.metaMensal), ...data.map(d => d.sessõesAssistidas));

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: HISTORY_STYLES }} />

      <h3 className="text-white font-semibold text-sm mb-4">Histórico de Frequência</h3>

      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const pct = (item.sessõesAssistidas / maxSessões) * 100;
          const metaPct = (item.metaMensal / maxSessões) * 100;

          const barColor = item.percentual >= 80
            ? 'bg-emerald-500/70'
            : item.percentual >= 50
            ? 'bg-yellow-500/70'
            : 'bg-red-500/50';

          return (
            <div key={item.mes} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-black/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap">
                  <p className="text-white text-xs font-medium">{item.sessõesAssistidas}/{item.metaMensal}</p>
                  <p className="text-white/40 text-[10px]">{item.percentual}%</p>
                </div>
              </div>

              {/* Bar container */}
              <div className="w-full flex items-end justify-center" style={{ height: height - 24 }}>
                <div className="relative w-full max-w-[32px]">
                  {/* Goal line */}
                  <div
                    className="absolute w-full border-t border-dashed border-white/10"
                    style={{ bottom: `${metaPct}%` }}
                  />
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-md ${barColor} transition-colors group-hover:brightness-125`}
                    style={{
                      height: `${pct}%`,
                      minHeight: 4,
                      animation: `hist-bar-grow 800ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms both`,
                    }}
                  />
                </div>
              </div>

              {/* Label */}
              <span className="text-white/25 text-[10px] font-medium">{item.mesLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-white/25">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500/70" /> ≥80%
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-yellow-500/70" /> 50-79%
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-red-500/50" /> &lt;50%
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-0 border-t border-dashed border-white/20" style={{ width: 12 }} /> meta
        </span>
      </div>
    </div>
  );
}
