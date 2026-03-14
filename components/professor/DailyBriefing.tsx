'use client';

import type { InstructorCoachVM, PerformanceMetricsVM } from '@/lib/application/intelligence';
import { ClassBriefingCard } from './ClassBriefingCard';
import { PedagogicalTipsBanner } from './PedagogicalTipsBanner';

// ════════════════════════════════════════════════════════════════════
// DAILY BRIEFING — Container principal do briefing diario do professor
// ════════════════════════════════════════════════════════════════════

interface DailyBriefingProps {
  briefing: InstructorCoachVM | null;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

// ── Mood config ──
const MOOD_CONFIG: Record<string, { dot: string; label: string; bg: string; text: string; border: string }> = {
  great: { dot: 'bg-green-500', label: 'Otimo', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  good: { dot: 'bg-blue-500', label: 'Bom', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  attention: { dot: 'bg-yellow-500', label: 'Atencao', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  critical: { dot: 'bg-red-500', label: 'Critico', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

// ══════════════════════════════════════════════════════════════════
// SKELETON
// ══════════════════════════════════════════════════════════════════

function DailyBriefingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-64 bg-zinc-800 rounded-lg" />
        <div className="h-4 w-48 bg-zinc-800/60 rounded-lg" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-dark-card/60 p-4 space-y-3">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
            <div className="h-7 w-12 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Class briefings skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-40 bg-zinc-800 rounded" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-dark-card/60 p-4 space-y-3">
            <div className="h-4 w-48 bg-zinc-800 rounded" />
            <div className="h-3 w-64 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Tips skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 rounded-lg border border-white/10 bg-dark-card/60 p-3 space-y-2">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-800/60 rounded" />
            <div className="h-3 w-3/4 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ERROR STATE
// ══════════════════════════════════════════════════════════════════

function DailyBriefingError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3">
      <p className="text-sm font-medium text-red-400">Erro ao carregar o briefing</p>
      <p className="text-xs text-zinc-500">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-white/10"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PERFORMANCE METRICS SECTION
// ══════════════════════════════════════════════════════════════════

function PerformanceMetricsSection({ metrics }: { metrics: PerformanceMetricsVM }) {
  const healthColor =
    metrics.avgClassHealth >= 80 ? 'text-green-400' :
    metrics.avgClassHealth >= 60 ? 'text-yellow-400' :
    metrics.avgClassHealth >= 40 ? 'text-orange-400' :
    'text-red-400';

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <h3 className="text-sm font-medium text-zinc-300">Metricas de Desempenho</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-zinc-800/50">
        {/* Avg Class Health */}
        <div className="bg-dark-card/80 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Saude Media</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-lg font-medium ${healthColor}`}>{metrics.avgClassHealth}</span>
            <span className="text-xs text-zinc-500">{metrics.avgClassHealthLabel}</span>
          </div>
        </div>

        {/* Students at risk */}
        <div className="bg-dark-card/80 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Alunos em Risco</span>
          <div className="mt-1">
            <span className={`text-lg font-medium ${metrics.studentsAtRisk > 0 ? 'text-red-400' : 'text-zinc-300'}`}>
              {metrics.studentsAtRisk}
            </span>
          </div>
        </div>

        {/* Students improving */}
        <div className="bg-dark-card/80 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Alunos Melhorando</span>
          <div className="mt-1">
            <span className="text-lg font-medium text-green-400">{metrics.studentsImproving}</span>
          </div>
        </div>

        {/* Retention score */}
        <div className="bg-dark-card/80 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Retencao</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-medium text-zinc-200">{metrics.retentionScore}%</span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${metrics.retentionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progression score */}
        <div className="bg-dark-card/80 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Progressao</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-medium text-zinc-200">{metrics.progressionScore}%</span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${metrics.progressionScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export function DailyBriefing({ briefing, loading, error, onRetry }: DailyBriefingProps) {
  if (loading) {
    return <DailyBriefingSkeleton />;
  }

  if (error) {
    return <DailyBriefingError error={error} onRetry={onRetry} />;
  }

  if (!briefing) {
    return (
      <div className="rounded-xl border border-white/10 bg-dark-card/60 p-6 text-center">
        <p className="text-sm text-zinc-500">Nenhum briefing disponivel</p>
      </div>
    );
  }

  const moodConfig = MOOD_CONFIG[briefing.daySummary.overallMood] ?? MOOD_CONFIG.good;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-lg font-semibold text-zinc-200">{briefing.greeting}</p>
        <p className="text-xs text-zinc-500 mt-1">{briefing.date}</p>
      </div>

      {/* Day Summary — 4 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Classes */}
        <div className="rounded-xl border border-white/10 bg-dark-card/60 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Turmas Hoje</span>
          <p className="text-2xl font-medium text-zinc-200 mt-1">{briefing.daySummary.totalClasses}</p>
        </div>

        {/* Total Students */}
        <div className="rounded-xl border border-white/10 bg-dark-card/60 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Total Alunos</span>
          <p className="text-2xl font-medium text-zinc-200 mt-1">{briefing.daySummary.totalStudents}</p>
        </div>

        {/* Classes Needing Attention */}
        <div className="rounded-xl border border-white/10 bg-dark-card/60 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Precisam Atencao</span>
          <p className={`text-2xl font-medium mt-1 ${briefing.daySummary.classesNeedingAttention > 0 ? 'text-orange-400' : 'text-zinc-200'}`}>
            {briefing.daySummary.classesNeedingAttention}
          </p>
        </div>

        {/* Overall Mood */}
        <div className="rounded-xl border border-white/10 bg-dark-card/60 p-4">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Humor Geral</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${moodConfig.dot}`} />
            <span className={`text-sm font-semibold ${moodConfig.text}`}>{moodConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Top Priority */}
      {briefing.daySummary.topPriority && (
        <div className="rounded-xl border border-white/10 bg-dark-card/60 px-4 py-3 bg-zinc-800/30">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Prioridade do Dia</span>
          <p className="text-sm text-zinc-300 mt-0.5">{briefing.daySummary.topPriority}</p>
        </div>
      )}

      {/* Class Briefings */}
      {briefing.classBriefings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-zinc-400 px-1">Briefing por Turma</h3>
          {briefing.classBriefings.map(classBriefing => (
            <ClassBriefingCard key={classBriefing.classId} briefing={classBriefing} />
          ))}
        </div>
      )}

      {/* Pedagogical Tips */}
      {briefing.pedagogicalTips.length > 0 && (
        <PedagogicalTipsBanner tips={briefing.pedagogicalTips} />
      )}

      {/* Performance Metrics */}
      <PerformanceMetricsSection metrics={briefing.performanceMetrics} />

      {/* Confidence + Computed At footer */}
      <div className="flex items-center justify-between text-[10px] text-zinc-600 px-1">
        <span>Confianca: {Math.round(briefing.confidence * 100)}%</span>
        <span>Calculado em: {briefing.computedAt}</span>
      </div>
    </div>
  );
}
