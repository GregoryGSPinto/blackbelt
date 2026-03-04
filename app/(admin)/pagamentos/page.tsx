'use client';

// ============================================================
// PAGAMENTOS (Admin) — Gateway de Pagamento
//
// Dashboard: receita mensal, pendentes, inadimplentes, métodos
// Faturas recentes com status e filtro
// Assinaturas ativas
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, AlertTriangle, CreditCard, Users, Clock,
  QrCode, CheckCircle, XCircle, Filter,
} from 'lucide-react';
import * as pagService from '@/lib/api/pagamentos.service';
import type { AdminFinanceDashboard, Fatura, Assinatura } from '@/lib/api/pagamentos.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

type FaturaFilter = 'todas' | 'pendente' | 'atrasado' | 'pago';
type TabView = 'faturas' | 'assinaturas';

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pago: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Pago' },
  pendente: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pendente' },
  atrasado: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Atrasado' },
  cancelado: { bg: 'bg-white/5', text: 'text-white/30', label: 'Cancelado' },
  ativa: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Ativa' },
  vencida: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Vencida' },
  suspensa: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Suspensa' },
};

const METODO_LABELS: Record<string, { icon: string; label: string }> = {
  pix: { icon: '⚡', label: 'Pix' },
  cartao: { icon: '💳', label: 'Cartão' },
  boleto: { icon: '📄', label: 'Boleto' },
  dinheiro: { icon: '💵', label: 'Dinheiro' },
};

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PagamentosPage() {
  const [dashboard, setDashboard] = useState<AdminFinanceDashboard | null>(null);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<FaturaFilter>('todas');
  const [tab, setTab] = useState<TabView>('faturas');

  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      pagService.getAdminFinanceDashboard(),
      pagService.getAssinaturas(),
    ])
      .then(([dash, subs]: [AdminFinanceDashboard, Assinatura[]]) => {
        setDashboard(dash);
        setAssinaturas(subs);
      })
      .catch((err: unknown) => setError(handleServiceError(err, 'Pagamentos')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  if (loading) {
    return <PremiumLoader text="Carregando pagamentos..." />;
  }

  if (error || !dashboard) {
    return <PageError error={error || 'Erro desconhecido'} onRetry={() => setRetryCount((c: number) => c + 1)} />;
  }

  const filteredFaturas = dashboard.faturasRecentes.filter((f: Fatura) =>
    filter === 'todas' || f.status === filter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Pagamentos</h1>
        <p className="text-white/50">Gateway de pagamento e controle de assinaturas</p>
      </div>

      {/* Integration notice */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <QrCode className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Gateway de Pagamento — Preparado para integração</p>
            <p className="text-xs text-white/40 mt-1">
              Pix, Cartão de crédito e Boleto via gateway (Stripe/Mercado Pago/Asaas). Estrutura de front-end pronta.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <span className="text-white/40 text-xs">Receita Mês</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-400">{formatCurrency(dashboard.receitaMes)}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock size={18} className="text-yellow-400" />
            </div>
            <span className="text-white/40 text-xs">Pendente</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-yellow-400">{formatCurrency(dashboard.receitaPendente)}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <span className="text-white/40 text-xs">Inadimplentes</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-400">{dashboard.inadimplentes}</p>
          <p className="text-white/30 text-xs mt-1">de {dashboard.totalAssinaturas} assinaturas</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            <span className="text-white/40 text-xs">Assinaturas Ativas</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-400">{dashboard.assinaturasAtivas}</p>
          <p className="text-white/30 text-xs mt-1">
            {Math.round((dashboard.assinaturasAtivas / Math.max(dashboard.totalAssinaturas, 1)) * 100)}% do total
          </p>
        </div>
      </div>

      {/* Revenue by method */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Receita por Método</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(dashboard.porMetodo) as [string, number][]).map(([metodo, valor]) => {
            const m = METODO_LABELS[metodo] || { icon: '💰', label: metodo };
            const total = (Object.values(dashboard.porMetodo) as number[]).reduce((s, v) => s + v, 0);
            const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
            return (
              <div key={metodo} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-white/60 text-sm">{m.label}</span>
                </div>
                <p className="text-white font-bold">{formatCurrency(valor)}</p>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/20 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-white/25 text-xs mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('faturas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'faturas' ? 'bg-white/10 text-white border border-white/15' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <DollarSign size={14} className="inline mr-1" /> Faturas
        </button>
        <button
          onClick={() => setTab('assinaturas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'assinaturas' ? 'bg-white/10 text-white border border-white/15' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <CreditCard size={14} className="inline mr-1" /> Assinaturas
        </button>
      </div>

      {/* Faturas Tab */}
      {tab === 'faturas' && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          {/* Filter bar */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
            <Filter size={14} className="text-white/30 flex-shrink-0" />
            {(['todas', 'pendente', 'atrasado', 'pago'] as FaturaFilter[]).map((f: FaturaFilter) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filter === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {f === 'todas' ? 'Todas' : STATUS_STYLE[f]?.label || f}
              </button>
            ))}
          </div>

          {/* Invoice list */}
          <div className="divide-y divide-white/5">
            {filteredFaturas.map((fatura: Fatura) => {
              const st = STATUS_STYLE[fatura.status] || STATUS_STYLE.pendente;
              const met = fatura.metodo ? METODO_LABELS[fatura.metodo] : null;
              return (
                <div key={fatura.id} className="px-6 py-4 hover:bg-black/20 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium text-sm truncate">{fatura.alunoNome}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-white/30 text-xs truncate">{fatura.descricao}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm">{formatCurrency(fatura.valor)}</p>
                      <p className="text-white/25 text-xs">
                        Venc. {new Date(fatura.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      {met && (
                        <p className="text-white/20 text-[10px] mt-0.5">{met.icon} {met.label}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredFaturas.length === 0 && (
              <div className="px-6 py-12 text-center text-white/30 text-sm">Nenhuma fatura encontrada</div>
            )}
          </div>
        </div>
      )}

      {/* Assinaturas Tab */}
      {tab === 'assinaturas' && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {assinaturas.map((sub: Assinatura) => {
              const st = STATUS_STYLE[sub.status] || STATUS_STYLE.ativa;
              const met = METODO_LABELS[sub.formaPagamento];
              return (
                <div key={sub.id} className="px-6 py-4 hover:bg-black/20 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium text-sm">{sub.alunoNome}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-white/30 text-xs">
                        {sub.planoNome} · Dia {sub.diaVencimento} · {met?.icon} {met?.label}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm">{formatCurrency(sub.valor)}/mês</p>
                      <p className="text-white/25 text-xs">
                        Renova {new Date(sub.dataRenovacao + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
