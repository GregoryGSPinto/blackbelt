'use client';

// ============================================================
// COMISSÕES — Relatório de comissionamento por professor
// ============================================================

import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import * as partService from '@/lib/api/particulares.service';
import type { Comissao } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

function formatCurrency(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mes, setMes] = useState('2026-02');

  useEffect(() => {
    setError(null); setLoading(true);
    partService.getComissoes(mes)
      .then((data: Comissao[]) => setComissoes(data))
      .catch((err: unknown) => setError(handleServiceError(err, 'Comissões')))
      .finally(() => setLoading(false));
  }, [retryCount, mes]);

  const totalBruto = comissoes.reduce((s: number, c: Comissao) => s + c.valorBruto, 0);
  const totalLiquido = comissoes.reduce((s: number, c: Comissao) => s + c.valorLiquido, 0);
  const totalPendente = comissoes.filter((c: Comissao) => !c.pago).reduce((s: number, c: Comissao) => s + c.valorLiquido, 0);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto mb-4" /><p className="text-white/60">Carregando...</p></div></div>;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Comissões</h1>
          <p className="text-white/50">Relatório de pagamento aos instrutores</p>
        </div>
        <input type="month" value={mes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMes(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-blue-400" /><span className="text-white/40 text-xs">Instrutores</span></div>
          <p className="text-xl sm:text-2xl font-bold text-white">{comissoes.length}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-400" /><span className="text-white/40 text-xs">Total Bruto</span></div>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalBruto)}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-purple-400" /><span className="text-white/40 text-xs">A Pagar</span></div>
          <p className="text-xl font-bold text-purple-400">{formatCurrency(totalLiquido)}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-amber-400" /><span className="text-white/40 text-xs">Pendente</span></div>
          <p className="text-xl font-bold text-amber-400">{formatCurrency(totalPendente)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-left">
              <th className="px-6 py-3 text-white/40 font-medium text-xs">Professor</th>
              <th className="px-4 py-3 text-white/40 font-medium text-xs text-center">Regulares</th>
              <th className="px-4 py-3 text-white/40 font-medium text-xs text-center">Particulares</th>
              <th className="px-4 py-3 text-white/40 font-medium text-xs text-right">Bruto</th>
              <th className="px-4 py-3 text-white/40 font-medium text-xs text-center">Split %</th>
              <th className="px-4 py-3 text-white/40 font-medium text-xs text-right">Líquido</th>
              <th className="px-6 py-3 text-white/40 font-medium text-xs text-center">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {comissoes.map((c: Comissao) => (
                <tr key={`${c.professorId}-${c.mes}`} className="hover:bg-black/20">
                  <td className="px-6 py-4 text-white font-medium">{c.professorNome}</td>
                  <td className="px-4 py-4 text-white/60 text-center">{c.sessõesRegulares}</td>
                  <td className="px-4 py-4 text-white/60 text-center">{c.sessõesParticulares}</td>
                  <td className="px-4 py-4 text-white/60 text-right">{formatCurrency(c.valorBruto)}</td>
                  <td className="px-4 py-4 text-white/40 text-center">{c.percentual}%</td>
                  <td className="px-4 py-4 text-green-400 font-bold text-right">{formatCurrency(c.valorLiquido)}</td>
                  <td className="px-6 py-4 text-center">
                    {c.pago ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400"><CheckCircle size={10} /> Pago</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400"><Clock size={10} /> Pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comissoes.length === 0 && <div className="px-6 py-12 text-center text-white/30 text-sm">Nenhuma comissão para o período</div>}
      </div>
    </div>
  );
}
