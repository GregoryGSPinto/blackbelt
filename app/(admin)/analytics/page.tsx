'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, UserMinus, UserPlus, UserCheck,
  DollarSign, Clock, BarChart3,
} from 'lucide-react';
import * as analyticsService from '@/lib/api/analytics.service';
import type { AnalyticsRetencao } from '@/lib/api/analytics.service';
import { PageError, PageLoading, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

const NIVEL_COLORS: Record<string, string> = {
  'Nível Iniciante': '#E5E7EB', 'Nível Básico': '#3B82F6', 'Nível Intermediário': '#8B5CF6',
  'Nível Avançado': '#92400E', 'Nível Máximo': '#374151',
};

export default function AnalyticsPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatNumber } = useFormatting();

  const [data, setData] = useState<AnalyticsRetencao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService.getAnalytics()
      .then(setData)
      .catch((err: unknown) => setError(handleServiceError(err, 'Analytics')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PremiumLoader />;
  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;
  if (!data) return <PageLoading message={t('analytics.loading')} />;

  const m = data.metricas;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 size={24} className="text-cyan-400" />
          {t('analytics.retentionAnalytics')}
        </h1>
        <p className="text-sm text-white/40 mt-1">{t('analytics.subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Retenção" value={`${m.retencaoAtual}%`} icon={UserCheck} color="text-emerald-400"
          sub={m.retencaoAtual >= 90 ? t('analytics.excellent') : m.retencaoAtual >= 80 ? t('analytics.good') : t('analytics.attention')} />
        <KpiCard label="Churn mensal" value={`${m.churnAtual}%`} icon={UserMinus} color="text-red-400"
          sub={m.churnAtual <= 3 ? t('analytics.healthy') : t('analytics.aboveIdeal')} />
        <KpiCard label="Permanência média" value={`${m.tempoMedioPermanencia}m`} icon={Clock} color="text-blue-400" sub="meses" />
        <KpiCard label="LTV médio" value={`R$ ${formatNumber(m.ltv)}`} icon={DollarSign} color="text-amber-400" sub="por aluno" />
      </div>

      {/* Growth mini */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Crescimento" value={`+${m.taxaCrescimento}%`} icon={TrendingUp} positive />
        <MiniStat label="Novos (30d)" value={String(m.novosUltimo30d)} icon={UserPlus} positive />
        <MiniStat label="Cancelados (30d)" value={String(m.canceladosUltimo30d)} icon={UserMinus} positive={false} />
        <MiniStat label="Reativados (30d)" value={String(m.reativadosUltimo30d)} icon={UserCheck} positive />
      </div>

      {/* Retention chart */}
      <Section title={t('analytics.monthlyRetention')}>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-end gap-1.5 h-40">
            {data.retencaoMensal.map((item, i) => {
              const height = ((item.taxa - 80) / 20) * 100; // Scale 80-100% to 0-100%
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[8px] text-white/30">{item.taxa}%</span>
                  <div className="w-full rounded-t-sm bg-emerald-500/40 transition-all" style={{ height: `${Math.max(5, height)}%` }} />
                  <span className="text-[7px] text-white/15 -rotate-45 origin-top-left whitespace-nowrap">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Churn chart */}
      <Section title={t('analytics.monthlyChurn')}>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-end gap-1.5 h-32">
            {data.churnMensal.map((item, i) => {
              const height = (item.taxa / 8) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[8px] text-white/30">{item.taxa}%</span>
                  <div className={`w-full rounded-t-sm transition-all ${item.taxa > 5 ? 'bg-red-500/50' : item.taxa > 3 ? 'bg-amber-500/40' : 'bg-emerald-500/30'}`}
                    style={{ height: `${Math.max(5, height)}%` }} />
                  <span className="text-[7px] text-white/15 -rotate-45 origin-top-left whitespace-nowrap">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Cohort table */}
      <Section title={t('analytics.cohortAnalysis')}>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 text-white/25 font-bold">Entrada</th>
                <th className="text-center px-2 py-1.5 text-white/25 font-bold">Mês 0</th>
                <th className="text-center px-2 py-1.5 text-white/25 font-bold">Mês 1</th>
                <th className="text-center px-2 py-1.5 text-white/25 font-bold">Mês 2</th>
                <th className="text-center px-2 py-1.5 text-white/25 font-bold">Mês 3</th>
                <th className="text-center px-2 py-1.5 text-white/25 font-bold">Mês 4</th>
                <th className="text-center px-2 py-1.5 text-white/25 font-bold">Mês 5</th>
              </tr>
            </thead>
            <tbody>
              {data.cohort.map((row, i) => (
                <tr key={i}>
                  <td className="px-2 py-1.5 text-white/40 font-bold whitespace-nowrap">{row.mesEntrada}</td>
                  {[0, 1, 2, 3, 4, 5].map(month => {
                    const val = row.retencao[month];
                    if (val === undefined) return <td key={month} className="px-2 py-1.5" />;
                    const intensity = val / 100;
                    return (
                      <td key={month} className="px-1 py-1">
                        <div className="rounded px-2 py-1.5 text-center font-bold" style={{
                          backgroundColor: `rgba(16, 185, 129, ${intensity * 0.5})`,
                          color: intensity > 0.7 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                        }}>
                          {val}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Motivos cancelamento */}
        <Section title={t('analytics.cancellationReasons')}>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-3">
            {data.motivosCancelamento.sort((a, b) => b.quantidade - a.quantidade).map((item, i) => {
              const maxQty = Math.max(...data.motivosCancelamento.map(x => x.quantidade));
              const pct = (item.quantidade / maxQty) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: tokens.textMuted }}>{item.motivo}</span>
                    <span className="text-xs text-white/40 font-bold">{item.quantidade} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-500/40 to-red-400/60 transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Retenção por nivel */}
        <Section title={t('analytics.retentionByLevel')}>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-3">
            {data.retencaoPorNível.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: NIVEL_COLORS[item.nivel] || '#ccc' }} />
                <span className="text-xs text-white/50 flex-1">{item.nivel}</span>
                <span className="text-[10px] text-white/20">{item.total} alunos</span>
                <span className={`text-xs font-bold ${item.retencao >= 90 ? 'text-emerald-400' : item.retencao >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                  {item.retencao}%
                </span>
              </div>
            ))}
            <p className="text-[9px] text-white/15 pt-2 border-t border-white/[0.04]">
              Níveis mais altos têm maior retenção — foco na jornada do iniciante ao básico.
            </p>
          </div>
        </Section>
      </div>

      {/* Retenção por turma */}
      <Section title={t('analytics.retentionByClass')}>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.retencaoPorTurma.sort((a, b) => b.retencao - a.retencao).map((item, i) => (
              <div key={i} className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-3">
                <p className="text-xs font-bold text-white/60">{item.turma}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className={`text-xl font-black ${item.retencao >= 90 ? 'text-emerald-400' : item.retencao >= 80 ? 'text-white/70' : 'text-amber-400'}`}>
                    {item.retencao}%
                  </p>
                  <span className="text-[9px] text-white/20">{item.total} alunos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div>
      <h2 className="text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {children}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: typeof Users; color: string; sub: string }) {
  return (
    <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-[9px] text-white/25 uppercase tracking-wider">{label}</span></div>
      <p className="text-lg sm:text-xl md:text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, positive }: { label: string; value: string; icon: typeof Users; positive: boolean }) {
  return (
    <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-2.5 flex items-center gap-2">
      <Icon size={14} className={positive ? 'text-emerald-400' : 'text-red-400'} />
      <div>
        <p className="text-[9px] text-white/20">{label}</p>
        <p className={`text-sm font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
      </div>
    </div>
  );
}
