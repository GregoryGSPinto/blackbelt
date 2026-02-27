// ============================================================
// BehavioralRadarChart — Desenvolvimento comportamental
// ============================================================
// Visualizacao CSS-based das 5 dimensoes comportamentais com
// nivel, tendencia e descricao. Sem dependencia de chart lib.
// ============================================================
'use client';

import type { ParentInsightsVM } from '@/lib/application/intelligence';
import type { TrendIndicator } from '@/lib/domain/intelligence/core/types';

interface BehavioralRadarChartProps {
  development: ParentInsightsVM['behavioralDevelopment'];
}

// ── Level styling ──

const LEVEL_CONFIG: Record<TrendIndicator['level'], { label: string; color: string; bg: string; border: string; barColor: string }> = {
  excellent: {
    label: 'Excelente',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    barColor: 'bg-emerald-500',
  },
  good: {
    label: 'Bom',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    barColor: 'bg-blue-500',
  },
  developing: {
    label: 'Desenvolvendo',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    barColor: 'bg-amber-500',
  },
  needs_attention: {
    label: 'Precisa Atencao',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    barColor: 'bg-orange-500',
  },
};

// ── Trend styling ──

const TREND_CONFIG: Record<TrendIndicator['trend'], { icon: string; color: string; label: string }> = {
  rising: { icon: '↑', color: 'text-emerald-400', label: 'Melhorando' },
  stable: { icon: '—', color: 'text-zinc-500', label: 'Estavel' },
  declining: { icon: '↓', color: 'text-red-400', label: 'Em queda' },
};

// ── Level to bar width ──

function levelToWidth(level: TrendIndicator['level']): string {
  switch (level) {
    case 'excellent': return '100%';
    case 'good': return '72%';
    case 'developing': return '45%';
    case 'needs_attention': return '25%';
  }
}

// ── Dimension labels ──

const DIMENSION_LABELS: Record<string, string> = {
  discipline: 'Disciplina',
  respect: 'Respeito',
  teamwork: 'Trabalho em Equipe',
  confidence: 'Autoconfianca',
  focusAndAttention: 'Foco e Atencao',
};

// ── Row component ──

function DimensionRow({ name, indicator }: { name: string; indicator: TrendIndicator }) {
  const level = LEVEL_CONFIG[indicator.level];
  const trend = TREND_CONFIG[indicator.trend];

  return (
    <div className="space-y-1.5">
      {/* Label row: name + badge + trend */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-300">
          {DIMENSION_LABELS[name] ?? name}
        </span>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${level.bg} ${level.border} ${level.color}`}
          >
            {level.label}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trend.color}`}
            title={trend.label}
          >
            {trend.icon}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${level.barColor} transition-all duration-500`}
          style={{ width: levelToWidth(indicator.level), opacity: 0.7 }}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-500 leading-relaxed">
        {indicator.description}
      </p>
    </div>
  );
}

// ── Component ──

export function BehavioralRadarChart({ development }: BehavioralRadarChartProps) {
  const dimensions = [
    { name: 'discipline', indicator: development.discipline },
    { name: 'respect', indicator: development.respect },
    { name: 'teamwork', indicator: development.teamwork },
    { name: 'confidence', indicator: development.confidence },
    { name: 'focusAndAttention', indicator: development.focusAndAttention },
  ] as const;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5 space-y-1">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">
        Desenvolvimento Comportamental
      </h3>

      <div className="space-y-4">
        {dimensions.map(({ name, indicator }) => (
          <DimensionRow key={name} name={name} indicator={indicator} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800 mt-4">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wide">Tendencia:</span>
        {Object.entries(TREND_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`inline-flex items-center gap-1 text-[10px] ${cfg.color}`}>
            <span className="font-bold">{cfg.icon}</span> {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
