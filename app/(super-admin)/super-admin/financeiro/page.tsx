'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Users, Clock,
  Target, AlertTriangle, Download, CreditCard,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useFormatting } from '@/hooks/useFormatting';
import type {
  MockFinancialData, MockMonthlyData, MockPaymentHistory,
} from '@/lib/__mocks__/super-admin.mock';
import { getDesignTokens } from '@/lib/design-tokens';

const PAYMENT_STATUS = {
  pago:     { labelKey: 'paid',     dotDark: 'bg-emerald-400', dotLight: 'bg-emerald-500', textDark: 'text-emerald-400', textLight: 'text-emerald-700' },
  pendente: { labelKey: 'pending', dotDark: 'bg-amber-400',   dotLight: 'bg-amber-500',   textDark: 'text-amber-400',   textLight: 'text-amber-700' },
  atrasado: { labelKey: 'overdue', dotDark: 'bg-red-400',     dotLight: 'bg-red-500',     textDark: 'text-red-400',     textLight: 'text-red-700' },
};

// ============================================================
// COMPONENTS
// ============================================================

function FinCard({ icon: Icon, label, value, sub, alert, isDark }: {
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
          <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {sub && (
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? 'bg-red-500/20 text-red-400' : isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function FinanceiroPage() {
  const t = useTranslations('superAdmin.financial');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatNumber, currencyCode } = useFormatting();
  const formatBRL = (value: number) => formatNumber(value, { style: 'currency', currency: currencyCode, minimumFractionDigits: 0 });
  const [financial, setFinancial] = useState<MockFinancialData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MockMonthlyData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [finRes, dashRes] = await Promise.all([
          fetch('/api/super-admin/financials'),
          fetch('/api/super-admin/dashboard'),
        ]);
        if (finRes.ok) {
          const data = await finRes.json();
          setFinancial(data.financial);
        }
        if (dashRes.ok) {
          const data = await dashRes.json();
          setMonthlyData(data.monthlyData);
        }
      } catch {
        const mock = await import('@/lib/__mocks__/super-admin.mock');
        setFinancial(mock.MOCK_FINANCIAL_DATA);
        setMonthlyData(mock.MOCK_MONTHLY_DATA);
      }
    }
    load();
  }, []);

  if (!financial) {
    return <PremiumLoader />;
  }

  // Churn data (simulated from monthly revenue)
  const churnData = monthlyData.map((m, i) => ({
    mes: m.mes,
    churn: i === 0 ? 3.2 : Math.max(0.5, 3.2 - i * 0.1 + (Math.random() - 0.5) * 0.8),
  }));

  return (
    <div className="px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('title')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {t('subtitle')}
          </p>
        </div>
        <button className={`
          flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          ${isDark
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }
        `}>
          <Download className="w-4 h-4" />
          {t('export')}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinCard isDark={isDark} icon={DollarSign} label={t('totalRevenue')} value={formatBRL(financial.receitaTotal)} sub={`+${financial.crescimentoReceita}% ${t('vsLastMonth')}`} />
        <FinCard isDark={isDark} icon={TrendingDown} label={t('churnRate')} value={`${financial.churnRate}%`} sub={t('cancellationRate')} alert={financial.churnRate > 5} />
        <FinCard isDark={isDark} icon={Target} label={t('ltv')} value={formatBRL(financial.ltv)} sub={`${t('cac')} ${formatBRL(financial.cac)}`} />
        <FinCard isDark={isDark} icon={AlertTriangle} label={t('defaultRate')} value={`${financial.inadimplencia}%`} alert={financial.inadimplencia > 5} sub={t('ofTotalAcademies')} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinCard isDark={isDark} icon={TrendingUp} label={t('avgTicket')} value={formatBRL(financial.ticketMedio)} sub={t('perAcademyMonth')} />
        <FinCard isDark={isDark} icon={Clock} label={t('payback')} value={t('monthsValue', { count: financial.paybackMonths })} sub={t('returnTime')} />
        <FinCard isDark={isDark} icon={CreditCard} label={t('lastMonth')} value={formatBRL(financial.receitaMesAnterior)} />
        <FinCard isDark={isDark} icon={Users} label={t('ltvCac')} value={`${(financial.ltv / financial.cac).toFixed(1)}x`} sub={t('healthy')} />
      </div>

      {/* Receita Chart */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/20' : 'bg-white border-indigo-100'}`}>
        <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{t('revenueEvolution')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
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
                formatter={(value: number) => [formatBRL(value), t('totalRevenue')]}
              />
              <Area type="monotone" dataKey="receita" stroke="#6366F1" strokeWidth={2} fill="url(#gradFin)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn Chart */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20' : 'bg-white border-violet-100'}`}>
        <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{t('churnRateChart')}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} domain={[0, 5]} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1E1B4B' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : '#DDD6FE'}`,
                  borderRadius: 12,
                  color: isDark ? '#fff' : '#1E293B',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Churn']}
              />
              <Line type="monotone" dataKey="churn" stroke="#A78BFA" strokeWidth={2} dot={{ fill: '#A78BFA', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LTV por mês (using revenue as proxy) */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20' : 'bg-white border-purple-100'}`}>
        <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{t('estimatedLtv')}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.map(m => ({ mes: m.mes, ltv: Math.round(m.receita * 12 / 5) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1E1B4B' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : '#E9D5FF'}`,
                  borderRadius: 12,
                  color: isDark ? '#fff' : '#1E293B',
                }}
                formatter={(value: number) => [formatBRL(value), 'LTV']}
              />
              <Bar dataKey="ltv" fill="#A855F7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/20' : 'bg-white border-indigo-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{t('paymentHistory')}</h3>
          <button className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            <Download className="w-3.5 h-3.5 inline mr-1" />
            {t('exportCsv')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">{t('academyCol')}</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">{t('valueCol')}</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">{t('dateCol')}</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">{t('methodCol')}</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider">{t('statusCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {financial.pagamentos.map((p: MockPaymentHistory) => {
                const st = PAYMENT_STATUS[p.status];
                return (
                  <tr key={p.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.academiaNome}</td>
                    <td className={`py-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} font-semibold`}>{formatBRL(p.valor)}</td>
                    <td className={`py-3 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                    <td className={`py-3 ${isDark ? 'text-white/60' : 'text-slate-600'} uppercase text-xs`}>{p.metodo}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${isDark ? st.textDark : st.textLight}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDark ? st.dotDark : st.dotLight}`} />
                        {t(st.labelKey)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
