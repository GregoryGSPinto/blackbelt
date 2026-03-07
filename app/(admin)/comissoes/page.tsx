'use client';

// ============================================================
// COMISSÕES — Relatório de comissionamento por professor
// ============================================================

import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import * as partService from '@/lib/api/particulares.service';
import type { Comissao } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function ComissoesPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatMoney } = useFormatting();
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

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

  if (loading) return <PremiumLoader text="Carregando..." />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('commissions.title')}</h1>
          <p style={{ fontWeight: 300, color: tokens.textMuted }}>Relatório de pagamento aos instrutores</p>
        </div>
        <input type="month" value={mes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMes(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-blue-400" /><span className="text-white/40 text-xs">Instrutores</span></div>
          <p className="text-xl sm:text-2xl font-medium text-white">{comissoes.length}</p>
        </div>
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-400" /><span className="text-white/40 text-xs">Total Bruto</span></div>
          <p className="text-xl font-medium text-green-400">{formatMoney(totalBruto)}</p>
        </div>
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-purple-400" /><span className="text-white/40 text-xs">A Pagar</span></div>
          <p className="text-xl font-medium text-purple-400">{formatMoney(totalLiquido)}</p>
        </div>
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-amber-400" /><span className="text-white/40 text-xs">Pendente</span></div>
          <p className="text-xl font-medium text-amber-400">{formatMoney(totalPendente)}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...glass, overflow: 'hidden' }}>
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
            <tbody className="divide-y">
              {comissoes.map((c: Comissao) => (
                <tr key={`${c.professorId}-${c.mes}`} className="hover:bg-black/20">
                  <td className="px-6 py-4 text-white font-medium">{c.professorNome}</td>
                  <td className="px-4 py-4 text-white/60 text-center">{c.sessõesRegulares}</td>
                  <td className="px-4 py-4 text-white/60 text-center">{c.sessõesParticulares}</td>
                  <td className="px-4 py-4 text-white/60 text-right">{formatMoney(c.valorBruto)}</td>
                  <td className="px-4 py-4 text-white/40 text-center">{c.percentual}%</td>
                  <td className="px-4 py-4 text-green-400 font-medium text-right">{formatMoney(c.valorLiquido)}</td>
                  <td className="px-6 py-4 text-center">
                    {c.pago ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400"><CheckCircle size={10} /> Pago</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400"><Clock size={10} /> Pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comissoes.length === 0 && <div className="empty-state-premium px-6 py-12 text-center text-white/30 text-sm">Nenhuma comissão para o período</div>}
      </div>
    </div>
  );
}
