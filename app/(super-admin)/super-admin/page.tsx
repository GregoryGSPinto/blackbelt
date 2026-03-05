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
import type {
  MockDashboardMetrics, MockMonthlyData, MockRevenueByPlan,
  MockAcademy,
} from '@/lib/__mocks__/super-admin.mock';
import { getDesignTokens } from '@/lib/design-tokens';

// ============================================================
// HELPERS
// ============================================================

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

function formatNum(value: number): string {
  return value.toLocaleString('pt-BR');
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ATIVA:         { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  INADIMPLENTE:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  BLOQUEADA:     { bg: 'bg-red-500/10',      text: 'text-red-400',     dot: 'bg-red-400' },
};

const STATUS_COLORS_LIGHT: Record<string, { bg: string; text: string; dot: string }> = {
  ATIVA:         { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  INADIMPLENTE:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  BLOQUEADA:     { bg: 'bg-red-100',      text: 'text-red-700',     dot: 'bg-red-500' },
};

// ============================================================
// COMPONENTS
// ============================================================

function MetricCard({ icon: Icon, label, value, sub, alert, isDark }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
  isDark: boolean;
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border p-5
      ${isDark
        ? 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20'
        : 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200/50'
      }
      backdrop-blur-sm
    `}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </p>
          {sub && (
            <div className="flex items-center gap-1">
              {sub.startsWith('+') ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : sub.startsWith('-') ? (
                <ArrowDownRight className="w-3 h-3 text-red-400" />
              ) : null}
              <span className={`text-xs ${sub.startsWith('+') ? 'text-emerald-400' : sub.startsWith('-') ? 'text-red-400' : isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {sub}
              </span>
            </div>
          )}
        </div>
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${alert
            ? 'bg-red-500/20 text-red-400'
            : isDark
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-indigo-100 text-indigo-600'
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
  const tokens = getDesignTokens(isDark);
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

  const statusColors = isDark ? STATUS_COLORS : STATUS_COLORS_LIGHT;

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('pageTitle')}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {t('pageSubtitle')}
          </p>
        </div>
        <a
          href="/super-admin/academias"
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('newAcademy')}
        </a>
      </div>

      {/* ─── SEÇÃO FINANCEIRA ─── */}
      <section className="space-y-4">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
          {t('financialSection')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            isDark={isDark}
            icon={DollarSign}
            label={t('mrr')}
            value={formatBRL(metrics.mrr)}
            sub={t('growthMonth', { value: metrics.mrrCrescimento })}
          />
          <MetricCard
            isDark={isDark}
            icon={Building2}
            label={t('activeAcademies')}
            value={String(metrics.academiasAtivas)}
            sub={t('ofTotal', { total: metrics.totalAcademias })}
          />
          <MetricCard
            isDark={isDark}
            icon={AlertTriangle}
            label={t('defaulters')}
            value={String(metrics.academiasInadimplentes)}
            alert={metrics.academiasInadimplentes > 0}
            sub={metrics.academiasInadimplentes > 0 ? t('attention') : t('none')}
          />
          <MetricCard
            isDark={isDark}
            icon={TrendingUp}
            label={t('avgTicket')}
            value={formatBRL(metrics.ticketMedio)}
            sub={t('perAcademy')}
          />
        </div>

        {/* Gráfico Receita Mensal */}
        <div className={`
          rounded-2xl border p-5
          ${isDark
            ? 'bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/20'
            : 'bg-white border-indigo-100'
          }
        `}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
            {t('monthlyRevenue')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#1E1B4B' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#E0E7FF'}`,
                    borderRadius: 12,
                    color: isDark ? '#fff' : '#1E293B',
                  }}
                  formatter={(value: number) => [formatBRL(value), t('revenue')]}
                />
                <Area type="monotone" dataKey="receita" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradientReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita por Plano */}
        <div className={`
          rounded-2xl border p-5
          ${isDark
            ? 'bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/20'
            : 'bg-white border-indigo-100'
          }
        `}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
            {t('revenueByPlan')}
          </h3>
          <div className="space-y-3">
            {revenueByPlan.map((plan) => (
              <div key={plan.plano} className="flex items-center gap-4">
                <span className={`text-sm w-24 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{plan.plano}</span>
                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${plan.percentual}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold w-28 text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatBRL(plan.receita)}
                </span>
                <span className={`text-xs w-12 text-right ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  {plan.percentual.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO OPERACIONAL ─── */}
      <section className="space-y-4">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
          {t('operationalSection')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard isDark={isDark} icon={Users} label={t('totalStudents')} value={formatNum(metrics.totalAlunos)} sub={t('growthMonth', { value: metrics.crescimentoAlunos })} />
          <MetricCard isDark={isDark} icon={GraduationCap} label={t('professors')} value={formatNum(metrics.totalProfessores)} />
          <MetricCard isDark={isDark} icon={Video} label={t('videos')} value={formatNum(metrics.totalVideos)} />
          <MetricCard isDark={isDark} icon={MousePointerClick} label={t('monthAccess')} value={formatNum(metrics.totalAcessosMes)} />
        </div>

        {/* Gráfico Crescimento Alunos */}
        <div className={`
          rounded-2xl border p-5
          ${isDark
            ? 'bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20'
            : 'bg-white border-violet-100'
          }
        `}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
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
                    background: isDark ? '#1E1B4B' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : '#DDD6FE'}`,
                    borderRadius: 12,
                    color: isDark ? '#fff' : '#1E293B',
                  }}
                  formatter={(value: number) => [value, t('totalStudents')]}
                />
                <Bar dataKey="alunos" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 academias */}
        <div className={`
          rounded-2xl border p-5
          ${isDark
            ? 'bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20'
            : 'bg-white border-violet-100'
          }
        `}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
            {t('topAcademies')}
          </h3>
          <div className="space-y-3">
            {topAcademies.map((a, i) => (
              <div key={a.nome} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                  {i + 1}
                </span>
                <span className={`flex-1 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.nome}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-600'}`}>{a.plano}</span>
                <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{a.alunos} {t('totalStudents')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO CONTROLE ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {t('academyControl')}
          </h2>
          <a
            href="/super-admin/academias"
            className={`text-xs font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
          >
            {t('viewAll')}
          </a>
        </div>

        <div className="space-y-3">
          {academies.map((academy) => {
            const sc = statusColors[academy.status] || statusColors.ATIVA;
            return (
              <div
                key={academy.id}
                className={`
                  flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 rounded-2xl border transition-all
                  ${isDark
                    ? 'bg-white/[0.03] border-white/10 hover:border-indigo-500/30'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                  }
                `}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {academy.nome}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {academy.status}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    {academy.cidade}/{academy.estado} · {t('plan')} {academy.plano} · {academy.totalAlunos} {t('totalStudents')}
                  </p>
                </div>

                {/* MRR */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {formatBRL(academy.mrr)}/{t('monthShort')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {academy.status === 'BLOQUEADA' ? (
                    <button className={`p-2 rounded-lg text-xs ${isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`} title={t('unblock')}>
                      <Unlock className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className={`p-2 rounded-lg text-xs ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`} title={t('block')}>
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  <button className={`p-2 rounded-lg text-xs ${isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`} title={t('changePlan')}>
                    <Settings className="w-4 h-4" />
                  </button>
                  <a
                    href={`/super-admin/academias?id=${academy.id}`}
                    className={`p-2 rounded-lg text-xs ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                    title={t('viewDetails')}
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
