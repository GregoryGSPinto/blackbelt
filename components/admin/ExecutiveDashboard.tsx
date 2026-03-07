// ============================================================
// ExecutiveDashboard — Clean, fintech-style executive view
// ============================================================
// 6 large KPI cards + mini chart + strategic alerts
// Designed for academy owners who want a quick overview
// without drilling into operational details.
// ============================================================
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users, UserMinus, ShieldCheck, DollarSign, UserPlus, AlertTriangle,
  ArrowUpRight, BarChart3,
} from 'lucide-react';
import type { EstatisticasDashboard } from '@/lib/__mocks__/admin.mock';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

// ── Types ──

interface KPICard {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  trend?: { current: number; previous: number };
  icon: typeof Users;
  color: string;
  bgGrad: string;
  href: string;
}

interface StrategicAlert {
  id: string;
  text: string;
  severity: 'warning' | 'info' | 'success';
  emoji: string;
}

// ── Component ──

interface ExecutiveDashboardProps {
  stats: EstatisticasDashboard;
}

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  const t = useTranslations('admin');
  const { formatNumber } = useFormatting();
  const fin = stats.financeiroResumo;

  // Calculate derived metrics
  const frequenciaMedia = stats.alunosAtivos > 0
    ? Math.round((stats.checkInsHoje / stats.alunosAtivos) * 100)
    : 0;
  const frequenciaOntem = stats.alunosAtivos > 0
    ? Math.round((stats.checkInsOntem / stats.alunosAtivos) * 100)
    : 0;

  const taxaEvasao = stats.totalAlunos > 0
    ? Math.round((stats.alunosInativos / stats.totalAlunos) * 100 * 10) / 10
    : 0;

  const retencao = stats.totalAlunos > 0
    ? Math.round(((stats.alunosAtivos) / stats.totalAlunos) * 100)
    : 0;

  const novosAlunos = stats.novatos.quantidade;

  const kpis: KPICard[] = useMemo(() => [
    {
      id: 'frequencia',
      label: t('dashboard.todayFrequency'),
      value: `${frequenciaMedia}%`,
      sublabel: `${stats.checkInsHoje} check-ins`,
      trend: { current: frequenciaMedia, previous: frequenciaOntem },
      icon: BarChart3,
      color: '#3B82F6',
      bgGrad: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.03))',
      href: '/check-in',
    },
    {
      id: 'evasao',
      label: t('dashboard.churnRate'),
      value: `${taxaEvasao}%`,
      sublabel: `${stats.alunosInativos} ${t('dashboard.inactive')}`,
      trend: { current: 100 - taxaEvasao, previous: 100 - taxaEvasao + 2 }, // simulated
      icon: UserMinus,
      color: '#EF4444',
      bgGrad: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))',
      href: '/usuarios',
    },
    {
      id: 'retencao',
      label: t('dashboard.retention'),
      value: `${retencao}%`,
      sublabel: `${stats.alunosAtivos} ${t('dashboard.of')} ${stats.totalAlunos}`,
      icon: ShieldCheck,
      color: '#22C55E',
      bgGrad: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.03))',
      href: '/usuarios',
    },
    {
      id: 'receita',
      label: t('dashboard.monthlyRevenueLabel'),
      value: `R$ ${(fin.receitaMes / 1000).toFixed(1)}k`,
      sublabel: `${t('dashboard.avgTicket')} R$ ${fin.ticketMedio}`,
      trend: { current: fin.receitaMes, previous: fin.receitaMesAnterior },
      icon: DollarSign,
      color: '#FBBF24',
      bgGrad: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.03))',
      href: '/financeiro',
    },
    {
      id: 'novos',
      label: t('dashboard.newStudents'),
      value: String(novosAlunos),
      sublabel: t('dashboard.thisMonth'),
      icon: UserPlus,
      color: '#8B5CF6',
      bgGrad: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.03))',
      href: '/usuarios',
    },
    {
      id: 'alertas',
      label: t('dashboard.activeAlerts'),
      value: String(stats.alertasNaoLidos),
      sublabel: `${stats.riscoEvasao.quantidade} ${t('dashboard.atRisk')}`,
      icon: AlertTriangle,
      color: '#F97316',
      bgGrad: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.03))',
      href: '/alertas',
    },
  ], [stats, fin, frequenciaMedia, frequenciaOntem, taxaEvasao, retencao, novosAlunos]);

  // Strategic alerts
  const strategicAlerts = useMemo<StrategicAlert[]>(() => {
    const alerts: StrategicAlert[] = [];

    if (stats.riscoEvasao.quantidade > 0) {
      alerts.push({
        id: 'evasion',
        text: t('dashboard.alertFreqDrop', { count: stats.riscoEvasao.quantidade }),
        severity: 'warning', emoji: '⚠️',
      });
    }

    if (fin.receitaMes < fin.receitaMesAnterior) {
      const pctDrop = Math.round(((fin.receitaMesAnterior - fin.receitaMes) / fin.receitaMesAnterior) * 100);
      alerts.push({
        id: 'revenue',
        text: t('dashboard.alertRevenueDrop', { pct: pctDrop }),
        severity: 'warning', emoji: '📉',
      });
    } else if (fin.receitaMes > fin.receitaMesAnterior) {
      const pctUp = Math.round(((fin.receitaMes - fin.receitaMesAnterior) / fin.receitaMesAnterior) * 100);
      alerts.push({
        id: 'revenue-up',
        text: t('dashboard.alertRevenueUp', { pct: pctUp }),
        severity: 'success', emoji: '📈',
      });
    }

    if (stats.aptosExame.quantidade > 0) {
      alerts.push({
        id: 'graduation',
        text: t('dashboard.alertGraduation', { count: stats.aptosExame.quantidade }),
        severity: 'info', emoji: '🥋',
      });
    }

    if (fin.inadimplenciaPct > 10) {
      alerts.push({
        id: 'inadimplencia',
        text: t('dashboard.alertDefaultRate', { pct: fin.inadimplenciaPct }),
        severity: 'warning', emoji: '💳',
      });
    }

    return alerts;
  }, [stats, fin]);

  // Mini chart data (simulated 6 months evolution)
  const chartData = useMemo(() => {
    const base = stats.alunosAtivos;
    return [
      { month: 'Set', value: Math.round(base * 0.82) },
      { month: 'Out', value: Math.round(base * 0.87) },
      { month: 'Nov', value: Math.round(base * 0.91) },
      { month: 'Dez', value: Math.round(base * 0.88) },
      { month: 'Jan', value: Math.round(base * 0.95) },
      { month: 'Fev', value: base },
    ];
  }, [stats.alunosAtivos]);

  const chartMax = Math.max(...chartData.map((d: { month: string; value: number }) => d.value));
  const chartMin = Math.min(...chartData.map((d: { month: string; value: number }) => d.value));

  const severityColors: Record<string, { bg: string; border: string; text: string }> = {
    warning: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', text: 'text-amber-300' },
    info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', text: 'text-blue-300' },
    success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', text: 'text-emerald-300' },
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {kpis.map((kpi, idx) => (
          <Link
            key={kpi.id}
            href={kpi.href}
            className="group rounded-2xl p-4 md:p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: kpi.bgGrad,
              border: `1px solid ${kpi.color}20`,
              animation: `anim-fade-in 300ms ease ${idx * 60}ms both`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${kpi.color}15` }}
              >
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <ArrowUpRight
                size={14}
                className="text-white/10 group-hover:text-white/30 transition-colors"
              />
            </div>

            <p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tabular-nums leading-none mb-1"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
            <p className="text-white/50 text-xs font-medium mb-1">{kpi.label}</p>

            <div className="flex items-center justify-between">
              {kpi.sublabel && (
                <span className="text-white/25 text-[10px]">{kpi.sublabel}</span>
              )}
              {kpi.trend && (
                <TrendIndicator
                  current={kpi.trend.current}
                  previous={kpi.trend.previous}
                  size="sm"
                />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Mini Chart: Active Students Evolution ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white/70">{t('dashboard.activeStudentsEvolution')}</h3>
            <p className="text-[10px] text-white/25 mt-0.5">{t('dashboard.last6Months')}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-blue-400/50" />
            <span className="text-lg font-medium text-blue-400 tabular-nums">{stats.alunosAtivos}</span>
          </div>
        </div>

        {/* SVG Bar chart */}
        <div className="flex items-end gap-2 h-24">
          {chartData.map((d, i) => {
            const height = chartMax > chartMin
              ? ((d.value - chartMin) / (chartMax - chartMin)) * 80 + 20
              : 50;
            const isLast = i === chartData.length - 1;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-white/30 tabular-nums">{d.value}</span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background: isLast
                      ? 'linear-gradient(to top, rgba(59,130,246,0.6), rgba(59,130,246,0.2))'
                      : 'linear-gradient(to top, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                    border: isLast ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    animation: `anim-fade-in 400ms ease ${i * 80}ms both`,
                  }}
                />
                <span className="text-[9px] text-white/20">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Strategic Alerts ── */}
      {strategicAlerts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={12} className="text-amber-400/50" />
            {t('dashboard.strategicAlerts')}
          </h3>
          <div className="space-y-2">
            {strategicAlerts.map((alert, idx) => {
              const s = severityColors[alert.severity];
              return (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    animation: `anim-fade-in 300ms ease ${idx * 60}ms both`,
                  }}
                >
                  <span className="text-base flex-shrink-0">{alert.emoji}</span>
                  <p className={`text-xs ${s.text} leading-relaxed`}>{alert.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Financial Quick Summary ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
          <DollarSign size={12} className="text-amber-400/50" />
          {t('dashboard.financialQuickSummary')}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('dashboard.monthlyRevenueLabel'), value: `R$ ${formatNumber(fin.receitaMes)}`, color: 'text-emerald-400' },
            { label: t('dashboard.previousMonth'), value: `R$ ${formatNumber(fin.receitaMesAnterior)}`, color: 'text-white/50' },
            { label: t('dashboard.defaultRate'), value: `${fin.inadimplenciaPct}%`, color: fin.inadimplenciaPct > 10 ? 'text-red-400' : 'text-amber-400' },
            { label: t('dashboard.forecast'), value: `R$ ${formatNumber(fin.previsaoCaixa)}`, color: 'text-blue-400' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] text-white/25 mb-1">{item.label}</p>
              <p className={`text-lg font-medium tabular-nums ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Distribution bar */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] text-white/25 mb-2">{t('dashboard.planDistribution')}</p>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden">
            {fin.distribuicaoPlanos.map((p, i) => {
              const total = fin.distribuicaoPlanos.reduce((s, x) => s + x.quantidade, 0);
              const width = (p.quantidade / total) * 100;
              const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#FBBF24'];
              return (
                <div
                  key={p.plano}
                  style={{ width: `${width}%`, background: colors[i % colors.length], opacity: 0.7 }}
                  className="rounded-full"
                  title={`${p.plano}: ${p.quantidade} (${Math.round(width)}%)`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {fin.distribuicaoPlanos.map((p, i) => {
              const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#FBBF24'];
              return (
                <div key={p.plano} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                  <span className="text-[9px] text-white/30">{p.plano} ({p.quantidade})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
