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
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const PAYMENT_STATUS: Record<string, { labelKey: string; variant: 'success' | 'warning' | 'error' }> = {
  pago:     { labelKey: 'paid',    variant: 'success' },
  pendente: { labelKey: 'pending', variant: 'warning' },
  atrasado: { labelKey: 'overdue', variant: 'error' },
};

// ============================================================
// COMPONENTS
// ============================================================

function FinCard({ icon: Icon, label, value, sub, alert }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className="stat-card hover-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
          {sub && (
            <p className="text-xs text-[var(--text-secondary)]">{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? 'bg-red-500/20 text-red-400' : 'bg-gold-500/10 text-gold-500'}`}>
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
  const { formatNumber, formatDate, currencyCode } = useFormatting();
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            {t('subtitle')}
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
          {t('export')}
        </Button>
      </div>

      {/* KPIs */}
      <div className="resp-grid-stats">
        <FinCard icon={DollarSign} label={t('totalRevenue')} value={formatBRL(financial.receitaTotal)} sub={`+${financial.crescimentoReceita}% ${t('vsLastMonth')}`} />
        <FinCard icon={TrendingDown} label={t('churnRate')} value={`${financial.churnRate}%`} sub={t('cancellationRate')} alert={financial.churnRate > 5} />
        <FinCard icon={Target} label={t('ltv')} value={formatBRL(financial.ltv)} sub={`${t('cac')} ${formatBRL(financial.cac)}`} />
        <FinCard icon={AlertTriangle} label={t('defaultRate')} value={`${financial.inadimplencia}%`} alert={financial.inadimplencia > 5} sub={t('ofTotalAcademies')} />
      </div>

      <div className="resp-grid-stats">
        <FinCard icon={TrendingUp} label={t('avgTicket')} value={formatBRL(financial.ticketMedio)} sub={t('perAcademyMonth')} />
        <FinCard icon={Clock} label={t('payback')} value={t('monthsValue', { count: financial.paybackMonths })} sub={t('returnTime')} />
        <FinCard icon={CreditCard} label={t('lastMonth')} value={formatBRL(financial.receitaMesAnterior)} />
        <FinCard icon={Users} label={t('ltvCac')} value={`${(financial.ltv / financial.cac).toFixed(1)}x`} sub={t('healthy')} />
      </div>

      {/* Receita Chart */}
      <div className="premium-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">{t('revenueEvolution')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A843" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
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
                formatter={(value: number) => [formatBRL(value), t('totalRevenue')]}
              />
              <Area type="monotone" dataKey="receita" stroke="#D4A843" strokeWidth={2} fill="url(#gradFin)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn Chart */}
      <div className="premium-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">{t('churnRateChart')}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }} domain={[0, 5]} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <Tooltip
                contentStyle={{
                  background: isDark ? 'rgba(15,10,30,0.95)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(212,168,67,0.2)' : 'rgba(212,168,67,0.3)'}`,
                  borderRadius: 12,
                  color: isDark ? '#fff' : '#1E293B',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Churn']}
              />
              <Line type="monotone" dataKey="churn" stroke="#D4A843" strokeWidth={2} dot={{ fill: '#D4A843', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LTV por mês */}
      <div className="premium-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4 text-[var(--text-secondary)]">{t('estimatedLtv')}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.map(m => ({ mes: m.mes, ltv: Math.round(m.receita * 12 / 5) }))}>
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
                formatter={(value: number) => [formatBRL(value), 'LTV']}
              />
              <Bar dataKey="ltv" fill="#D4A843" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="premium-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">{t('paymentHistory')}</h3>
          <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
            {t('exportCsv')}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th-premium text-left pb-3">{t('academyCol')}</th>
                <th className="th-premium text-left pb-3">{t('valueCol')}</th>
                <th className="th-premium text-left pb-3">{t('dateCol')}</th>
                <th className="th-premium text-left pb-3">{t('methodCol')}</th>
                <th className="th-premium text-left pb-3">{t('statusCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {financial.pagamentos.map((p: MockPaymentHistory) => {
                const st = PAYMENT_STATUS[p.status];
                return (
                  <tr key={p.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-3 font-medium text-[var(--text-primary)]">{p.academiaNome}</td>
                    <td className="py-3 text-gold-500 font-semibold">{formatBRL(p.valor)}</td>
                    <td className="py-3 text-[var(--text-secondary)]">{formatDate(p.data, 'short')}</td>
                    <td className="py-3 text-[var(--text-secondary)] uppercase text-xs">{p.metodo}</td>
                    <td className="py-3">
                      <Badge variant={st.variant}>{t(st.labelKey)}</Badge>
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
