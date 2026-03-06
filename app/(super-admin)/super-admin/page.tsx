'use client';

import { useState, useEffect } from 'react';
import {
  Building2, DollarSign, Users, GraduationCap, Video,
  MousePointerClick, TrendingUp, AlertTriangle, Lock, Unlock,
  Eye, Settings, Plus, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useFormatting } from '@/hooks/useFormatting';
import type {
  MockDashboardMetrics, MockMonthlyData, MockRevenueByPlan,
  MockAcademy,
} from '@/lib/__mocks__/super-admin.mock';
import { AnimatedCounter } from '@/components/transitions/AnimatedCounter';
import { StaggerList, StaggerItem } from '@/components/transitions/StaggerList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ============================================================
// HELPERS
// ============================================================

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  ATIVA: 'success',
  INADIMPLENTE: 'warning',
  BLOQUEADA: 'error',
};

// ============================================================
// COMPONENTS
// ============================================================

function MetricCard({ icon: Icon, label, value, numericValue, sub, alert }: {
  icon: React.ElementType;
  label: string;
  value: string;
  numericValue?: number;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className="stat-card hover-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {label}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {numericValue != null ? (
              <AnimatedCounter value={numericValue} prefix={value.match(/^[^\d]*/)?.[0] || ''} suffix={value.match(/[^\d]*$/)?.[0] || ''} />
            ) : (
              value
            )}
          </p>
          {sub && (
            <div className="flex items-center gap-1">
              {sub.startsWith('+') ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : sub.startsWith('-') ? (
                <ArrowDownRight className="w-3 h-3 text-red-400" />
              ) : null}
              <span className={`text-xs ${sub.startsWith('+') ? 'text-emerald-400' : sub.startsWith('-') ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                {sub}
              </span>
            </div>
          )}
        </div>
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${alert
            ? 'bg-red-500/20 text-red-400'
            : 'bg-gold-500/10 text-gold-500'
          }
        `}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function SuperAdminDashboard() {
  const t = useTranslations('superAdmin.dashboard');
  const { isDark } = useTheme();
  const { formatMoney, formatNumber } = useFormatting();
  const formatBRL = (value: number) => formatMoney(value, { minimumFractionDigits: 0 });
  const formatNum = (value: number) => formatNumber(value);
  const [metrics, setMetrics] = useState<MockDashboardMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MockMonthlyData[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<MockRevenueByPlan[]>([]);
  const [academies, setAcademies] = useState<MockAcademy[]>([]);
  const [topAcademies, setTopAcademies] = useState<{ nome: string; alunos: number; plano: string; status: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/super-admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setMonthlyData(data.monthlyData);
          setRevenueByPlan(data.revenueByPlan);
          setTopAcademies(data.topAcademies);
        }
      } catch {
        // fallback: import mock directly
        const mock = await import('@/lib/__mocks__/super-admin.mock');
        setMetrics(mock.MOCK_DASHBOARD_METRICS);
        setMonthlyData(mock.MOCK_MONTHLY_DATA);
        setRevenueByPlan(mock.MOCK_REVENUE_BY_PLAN);
        setTopAcademies(mock.MOCK_TOP_ACADEMIES);
      }

      try {
        const res = await fetch('/api/super-admin/academies');
        if (res.ok) {
          const data = await res.json();
          setAcademies(data.academies);
        }
      } catch {
        const mock = await import('@/lib/__mocks__/super-admin.mock');
        setAcademies(mock.MOCK_ACADEMIES);
      }
    }
    loadData();
  }, []);

  if (!metrics) {
    return <PremiumLoader />;
  }

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('pageTitle')}
          </h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            {t('pageSubtitle')}
          </p>
        </div>
        <a href="/super-admin/academias">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            className="hidden md:inline-flex"
          >
            {t('newAcademy')}
          </Button>
        </a>
      </div>

      {/* ─── SEÇÃO FINANCEIRA ─── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-500">
          {t('financialSection')}
        </h2>
        <div className="resp-grid-stats">
          <MetricCard
            icon={DollarSign}
            label={t('mrr')}
            value={formatBRL(metrics.mrr)}
            sub={t('growthMonth', { value: metrics.mrrCrescimento })}
          />
          <MetricCard
            icon={Building2}
            label={t('activeAcademies')}
            value={String(metrics.academiasAtivas)}
            numericValue={metrics.academiasAtivas}
            sub={t('ofTotal', { total: metrics.totalAcademias })}
          />
          <MetricCard
            icon={AlertTriangle}
            label={t('defaulters')}
            value={String(metrics.academiasInadimplentes)}
            numericValue={metrics.academiasInadimplentes}
            alert={metrics.academiasInadimplentes > 0}
            sub={metrics.academiasInadimplentes > 0 ? t('attention') : t('none')}
          />
          <MetricCard
            icon={TrendingUp}
            label={t('avgTicket')}
            value={formatBRL(metrics.ticketMedio)}
            sub={t('perAcademy')}
          />
        </div>

        {/* Gráfico Receita Mensal */}
        <div className="premium-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">
            {t('monthlyRevenue')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-gold, #D4A843)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-gold, #D4A843)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(15,10,30,0.95)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(212,168,67,0.2)' : 'rgba(212,168,67,0.3)'}`,
                    borderRadius: 12,
                    color: isDark ? '#fff' : '#1E293B',
                  }}
                  formatter={(value: number) => [formatBRL(value), t('revenue')]}
                />
                <Area type="monotone" dataKey="receita" stroke="#D4A843" strokeWidth={2} fill="url(#gradientReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita por Plano */}
        <div className="premium-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">
            {t('revenueByPlan')}
          </h3>
          <div className="space-y-3">
            {revenueByPlan.map((plan) => (
              <div key={plan.plano} className="flex items-center gap-4">
                <span className="text-sm w-24 text-[var(--text-secondary)]">{plan.plano}</span>
                <div className="flex-1 h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
                    style={{ width: `${plan.percentual}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-28 text-right text-[var(--text-primary)]">
                  {formatBRL(plan.receita)}
                </span>
                <span className="text-xs w-12 text-right text-[var(--text-secondary)]">
                  {plan.percentual.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO OPERACIONAL ─── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-500">
          {t('operationalSection')}
        </h2>
        <div className="resp-grid-stats">
          <MetricCard icon={Users} label={t('totalStudents')} value={formatNum(metrics.totalAlunos)} numericValue={metrics.totalAlunos} sub={t('growthMonth', { value: metrics.crescimentoAlunos })} />
          <MetricCard icon={GraduationCap} label={t('professors')} value={formatNum(metrics.totalProfessores)} numericValue={metrics.totalProfessores} />
          <MetricCard icon={Video} label={t('videos')} value={formatNum(metrics.totalVideos)} numericValue={metrics.totalVideos} />
          <MetricCard icon={MousePointerClick} label={t('monthAccess')} value={formatNum(metrics.totalAcessosMes)} numericValue={metrics.totalAcessosMes} />
        </div>

        {/* Gráfico Crescimento Alunos */}
        <div className="premium-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">
            {t('studentGrowth')}
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(15,10,30,0.95)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(212,168,67,0.2)' : 'rgba(212,168,67,0.3)'}`,
                    borderRadius: 12,
                    color: isDark ? '#fff' : '#1E293B',
                  }}
                  formatter={(value: number) => [value, t('totalStudents')]}
                />
                <Bar dataKey="alunos" fill="#D4A843" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 academias */}
        <div className="premium-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">
            {t('topAcademies')}
          </h3>
          <StaggerList className="space-y-3">
            {topAcademies.map((a, i) => (
              <StaggerItem key={a.nome}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] hover-card">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-gold-500/15 text-gold-500">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{a.nome}</span>
                  <Badge variant="gold">{a.plano}</Badge>
                  <span className="text-sm font-semibold text-gold-500">{a.alunos} {t('totalStudents')}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ─── SEÇÃO CONTROLE ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-500">
            {t('academyControl')}
          </h2>
          <a
            href="/super-admin/academias"
            className="text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors"
          >
            {t('viewAll')}
          </a>
        </div>

        <StaggerList className="space-y-3">
          {academies.map((academy) => (
            <StaggerItem key={academy.id}>
              <div className="premium-card hover-card rounded-xl flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate text-[var(--text-primary)]">
                      {academy.nome}
                    </h3>
                    <Badge variant={STATUS_VARIANT[academy.status] || 'default'}>
                      {academy.status}
                    </Badge>
                  </div>
                  <p className="text-xs mt-1 text-[var(--text-secondary)]">
                    {academy.cidade}/{academy.estado} · {t('plan')} {academy.plano} · {academy.totalAlunos} {t('totalStudents')}
                  </p>
                </div>

                {/* MRR */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gold-500">
                    {formatBRL(academy.mrr)}/{t('monthShort')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {academy.status === 'BLOQUEADA' ? (
                    <button className="p-2 rounded-xl text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title={t('unblock')}>
                      <Unlock className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 rounded-xl text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title={t('block')}>
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 rounded-xl text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title={t('changePlan')}>
                    <Settings className="w-4 h-4" />
                  </button>
                  <a
                    href={`/super-admin/academias?id=${academy.id}`}
                    className="p-2 rounded-xl text-xs bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-colors"
                    title={t('viewDetails')}
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>
    </div>
  );
}
