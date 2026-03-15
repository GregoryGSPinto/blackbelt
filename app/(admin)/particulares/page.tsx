'use client';

// ============================================================
// SESSÕES PARTICULARES — Admin
// Agenda visual, filtros por professor/status, status badges
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, User, Filter, CheckCircle, XCircle, CalendarCheck, DollarSign,
} from 'lucide-react';
import * as partService from '@/lib/api/particulares.service';
import type { AulaParticular } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  agendada: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Agendada', icon: <Calendar size={10} /> },
  confirmada: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Confirmada', icon: <CalendarCheck size={10} /> },
  realizada: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Realizada', icon: <CheckCircle size={10} /> },
  cancelada: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelada', icon: <XCircle size={10} /> },
};

export default function ParticularesPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatMoney, formatDate } = useFormatting();
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

  const [sessões, setSessões] = useState<AulaParticular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [filtroProf, setFiltroProf] = useState<string>('todos');

  useEffect(() => {
    setError(null); setLoading(true);
    partService.getParticulares()
      .then((data: AulaParticular[]) => setSessões(data))
      .catch((err: unknown) => setError(handleServiceError(err, 'Particulares')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const instrutores = useMemo(() => {
    const set = new Set(sessões.map((a: AulaParticular) => a.professorNome));
    return Array.from(set);
  }, [sessões]);

  const filtered = useMemo(() => {
    let list = sessões;
    if (filtroStatus !== 'todas') list = list.filter((a: AulaParticular) => a.status === filtroStatus);
    if (filtroProf !== 'todos') list = list.filter((a: AulaParticular) => a.professorNome === filtroProf);
    return list;
  }, [sessões, filtroStatus, filtroProf]);

  const totalAgendadas = sessões.filter((a: AulaParticular) => a.status === 'agendada' || a.status === 'confirmada').length;
  const totalRealizadas = sessões.filter((a: AulaParticular) => a.status === 'realizada').length;
  const receitaMes = sessões.filter((a: AulaParticular) => a.status === 'realizada').reduce((s: number, a: AulaParticular) => s + a.valor, 0);

  if (loading) return <PremiumLoader text={tc('actions.loading')} />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('privateSessions.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>Agenda de particulares e splits professor/unidade</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><CalendarCheck size={16} className="text-blue-400" /><span className="text-white/40 text-xs">Agendadas</span></div>
          <p className="text-xl sm:text-2xl font-medium text-white">{totalAgendadas}</p>
        </div>
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-400" /><span className="text-white/40 text-xs">Realizadas</span></div>
          <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em' }}>{totalRealizadas}</p>
        </div>
        <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-purple-400" /><span className="text-white/40 text-xs">Receita Mês</span></div>
          <p className="text-xl font-medium text-purple-400">{formatMoney(receitaMes)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-white/30" />
        {['todas', 'agendada', 'confirmada', 'realizada', 'cancelada'].map((s: string) => (
          <button key={s} onClick={() => setFiltroStatus(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filtroStatus === s ? 'bg-white/10 text-white' : 'text-white/30'}`}>
            {s === 'todas' ? 'Todas' : STATUS_STYLE[s]?.label || s}
          </button>
        ))}
        <span className="text-white/10">|</span>
        <select value={filtroProf} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroProf(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none">
          <option value="todos">Todos Instrutores</option>
          {instrutores.map((p: string) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden divide-y">
        {filtered.map((a: AulaParticular) => {
          const st = STATUS_STYLE[a.status] || STATUS_STYLE.agendada;
          return (
            <div key={a.id} className="px-6 py-4 hover:bg-black/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>{st.icon}{st.label}</span>
                    <span className="text-white/20 text-xs">{a.duracao}min</span>
                    {a.recorrencia !== 'unica' && <span className="text-purple-400/60 text-[10px]">{a.recorrencia}</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <User size={12} className="text-amber-400/60" />
                    <span className="text-white text-sm font-medium">{a.professorNome}</span>
                    <span className="text-white/20">→</span>
                    <span className="text-white/60 text-sm">{a.alunoNome}</span>
                  </div>
                  {a.observacao && <p className="text-white/25 text-xs mt-0.5">{a.observacao}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-400 font-medium text-sm">{formatMoney(a.valor)}</p>
                  <p className="text-white/30 text-xs">{formatDate(a.data, 'short')} · {a.horario}</p>
                  <p className="text-white/15 text-[10px] mt-0.5">Split: {a.splitUnidade}% acad / {a.splitInstrutor}% prof</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="px-6 py-12 text-center text-white/30 text-sm">{tc('empty.noSessions')}</div>}
      </div>
    </div>
  );
}
