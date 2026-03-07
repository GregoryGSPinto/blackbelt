// ============================================================
// MINHA EVOLUÇÃO — Student Progress & Timeline Page
// ============================================================
// Sections:
//   1. Summary stats (total sessões, streak, ranking)
//   2. Current month frequency bar
//   3. Monthly history chart (last 6+ months)
//   4. Evolution timeline (graduations, medals, milestones)
// ============================================================
'use client';

import { useTranslations } from 'next-intl';
import {
  Calendar, Flame, TrendingUp, Trophy,
} from 'lucide-react';
import * as evolucaoService from '@/lib/api/evolucao.service';
import type { EvolucaoData } from '@/lib/api/evolucao.service';
import { useServiceCall, RetryToast } from '@/hooks/useServiceCall';
import { PageError } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { FrequencyBar } from '@/components/aluno/FrequencyBar';
import { FrequencyHistory } from '@/components/aluno/FrequencyHistory';
import { EvolutionTimeline } from '@/components/aluno/EvolutionTimeline';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

// ── Summary stat card ──
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Calendar;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4 text-center group cursor-default hover:scale-[1.02] transition-transform hover-card"
      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className={`inline-flex p-2 rounded-lg mb-2 ${accent}`}>
        <Icon size={16} />
      </div>
      <p className="text-white font-medium text-xl tabular-nums">{value}</p>
      <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

// ── Page Styles ──
const PAGE_STYLES = `
  @keyframes evo-fade-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .evo-section {
    animation: evo-fade-in 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .evo-section:nth-child(2) { animation-delay: 80ms; }
  .evo-section:nth-child(3) { animation-delay: 160ms; }
  .evo-section:nth-child(4) { animation-delay: 240ms; }
  .evo-section:nth-child(5) { animation-delay: 320ms; }
`;

export default function MinhaEvolucaoPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { data, loading, error, retry, retryInfo } = useServiceCall<EvolucaoData>(
    () => evolucaoService.getEvolucaoData(),
    { label: 'MinhaEvolucao', maxRetries: 3 }
  );

  if (loading) return <PageSkeleton variant="detail" />;
  if (error) return <PageError error={error} onRetry={retry} />;
  if (!data) return <PageSkeleton variant="detail" />;

  const { timeline, frequenciaHistorico, frequenciaAtual, resumo } = data;

  // Filter timeline by type for tab-like sections
  const graduacoes = timeline.filter(e => e.type === 'graduation' || e.type === 'subnivel');
  const conquistas = timeline.filter(e => e.type === 'medal' || e.type === 'achievement' || e.type === 'milestone');

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8 px-4 md:px-0">
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      <RetryToast info={retryInfo} />

      {/* ═══════════════════════════════════════════ */}
      {/* HEADER                                      */}
      {/* ═══════════════════════════════════════════ */}
      <div className="evo-section">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Minha Evolução
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {resumo.totalMeses} meses de jornada · {resumo.totalSessões} sessões
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SUMMARY STATS                               */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 evo-section">
        <StatCard
          icon={Calendar}
          label="Total Sessões"
          value={resumo.totalSessões}
          accent="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={Flame}
          label="Streak Atual"
          value={`${resumo.streakAtual}d`}
          accent="bg-orange-500/15 text-orange-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Média Frequência"
          value={`${resumo.mediaFrequencia}%`}
          accent="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={Trophy}
          label="Conquistas"
          value={resumo.totalConquistas}
          accent="bg-purple-500/15 text-purple-400"
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* CURRENT MONTH FREQUENCY                     */}
      {/* ═══════════════════════════════════════════ */}
      <div className="evo-section">
        <FrequencyBar
          sessõesAssistidas={frequenciaAtual.sessõesAssistidas}
          metaMensal={frequenciaAtual.metaMensal}
          percentual={frequenciaAtual.percentual}
          variacao={frequenciaAtual.variacao}
          tendencia={frequenciaAtual.tendencia}
          historicoSemanal={frequenciaAtual.historicoSemanal}
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MONTHLY HISTORY CHART                       */}
      {/* ═══════════════════════════════════════════ */}
      <div className="evo-section">
        <FrequencyHistory data={frequenciaHistorico} />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* EVOLUTION TIMELINE                          */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 evo-section">
        <EvolutionTimeline
          events={timeline}
          maxItems={15}
          title="Linha do Tempo Completa"
        />
        <div className="space-y-4">
          <EvolutionTimeline
            events={graduacoes}
            maxItems={8}
            title="Graduações & Subniveis"
          />
          <EvolutionTimeline
            events={conquistas}
            maxItems={8}
            title="Conquistas & Conquistas"
          />
        </div>
      </div>

      {/* Best Streak */}
      {resumo.melhorStreak > 0 && (
        <div
          className="rounded-2xl p-5 text-center evo-section"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.03))',
            border: '1px solid rgba(245,158,11,0.12)',
          }}
        >
          <Flame size={24} className="text-amber-400 mx-auto mb-2" />
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Melhor Streak</p>
          <p className="text-white font-medium text-3xl tabular-nums">{resumo.melhorStreak} dias</p>
          <p className="text-white/25 text-xs mt-1">Sua maior sequência de presença consecutiva</p>
        </div>
      )}
    </div>
  );
}
