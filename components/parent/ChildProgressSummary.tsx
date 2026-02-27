// ============================================================
// ChildProgressSummary — Card de resumo do progresso do filho
// ============================================================
// Mostra headline, engajamento, frequencia, progresso de faixa,
// areas fortes e areas de crescimento.
// ============================================================
'use client';

import type { ParentInsightsVM } from '@/lib/application/intelligence';

interface ChildProgressSummaryProps {
  summary: ParentInsightsVM['summary'];
  learningProgress: ParentInsightsVM['learningProgress'];
}

// ── Engagement badge color map ──

function engagementColor(level: string): string {
  const lower = level.toLowerCase();
  if (lower.includes('excelente')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (lower.includes('muito bom')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (lower.includes('bom')) return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
  if (lower.includes('atencao')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (lower.includes('incentivo')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
}

// ── Component ──

export function ChildProgressSummary({ summary, learningProgress }: ChildProgressSummaryProps) {
  const attendancePct =
    summary.totalClassesThisMonth > 0
      ? Math.round((summary.attendanceThisMonth / summary.totalClassesThisMonth) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5 space-y-5">
      {/* ── Headline ── */}
      <p className="text-base font-semibold text-zinc-200 leading-relaxed">
        {summary.headline}
      </p>

      {/* ── Engagement + Attendance row ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${engagementColor(summary.engagementLevel)}`}
        >
          {summary.engagementLevel}
        </span>

        <span className="text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">{summary.attendanceThisMonth}</span>
          {' de '}
          <span className="font-semibold text-zinc-200">{summary.totalClassesThisMonth}</span>
          {' aulas'}
          <span className="ml-1 text-zinc-500">({attendancePct}%)</span>
        </span>
      </div>

      {/* ── Belt progress ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">{learningProgress.currentBelt}</span>
          <span className="text-zinc-500 text-xs">→</span>
          <span className="text-zinc-300 font-medium">{learningProgress.nextBelt}</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(2, Math.min(100, learningProgress.progressToNext))}%` }}
          />
        </div>

        <p className="text-xs text-zinc-500 text-right">
          {learningProgress.progressToNext}% concluido
        </p>
      </div>

      {/* ── Areas: strong + growth ── */}
      <div className="space-y-3">
        {/* Strong areas */}
        {learningProgress.strongAreas.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500 mr-1">Pontos fortes:</span>
            {learningProgress.strongAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center rounded-md bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
              >
                {area}
              </span>
            ))}
          </div>
        )}

        {/* Growth areas */}
        {learningProgress.growthAreas.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500 mr-1">Em desenvolvimento:</span>
            {learningProgress.growthAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center rounded-md bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-xs font-medium text-amber-400"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
