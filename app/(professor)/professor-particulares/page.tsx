'use client';

// ============================================================
// MINHAS PARTICULARES — Área do Instrutor
// Lista sessões particulares do instrutor logado, extrato
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, DollarSign, CheckCircle, CalendarCheck } from 'lucide-react';
import * as partService from '@/lib/api/particulares.service';
import type { AulaParticular } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function ProfessorParticularesPage() {
  const t = useTranslations('professor.privateSessions');
  const { formatMoney, formatDate } = useFormatting();

  const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
    agendada: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: t('statusScheduled') },
    confirmada: { bg: 'bg-green-500/10', text: 'text-green-400', label: t('statusConfirmed') },
    realizada: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: t('statusCompleted') },
    cancelada: { bg: 'bg-red-500/10', text: 'text-red-400', label: t('statusCancelled') },
  };
  const tCommon = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

  const [sessões, setSessões] = useState<AulaParticular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setError(null); setLoading(true);
    partService.getParticulares()
      .then((all: AulaParticular[]) => setSessões(all.filter((a: AulaParticular) => a.professorId === 'p1'))) // Mock: filter for logged-in professor
      .catch((err: unknown) => setError(handleServiceError(err, 'Particulares')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const proximas = useMemo(() => sessões.filter((a: AulaParticular) => a.status === 'agendada' || a.status === 'confirmada'), [sessões]);
  const realizadas = useMemo(() => sessões.filter((a: AulaParticular) => a.status === 'realizada'), [sessões]);
  const ganhosMes = realizadas.reduce((s: number, a: AulaParticular) => s + (a.valor * a.splitInstrutor / 100), 0);

  if (loading) return <PremiumLoader text={tCommon('actions.loading')} />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><CalendarCheck size={16} className="text-blue-400" /><span className="text-white/40 text-xs">{t('upcoming')}</span></div>
          <p className="text-xl sm:text-2xl font-bold text-white">{proximas.length}</p>
        </div>
        <div style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-400" /><span className="text-white/40 text-xs">{t('done')}</span></div>
          <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{realizadas.length}</p>
        </div>
        <div style={{ ...glass, padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-amber-400" /><span className="text-white/40 text-xs">{t('monthEarnings')}</span></div>
          <p className="text-xl font-bold text-amber-400">{formatMoney(ganhosMes)}</p>
        </div>
      </div>

      {proximas.length > 0 && (
        <>
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">{t('upcomingSessions')}</h2>
          <div className="space-y-3">
            {proximas.map((a: AulaParticular) => {
              const st = STATUS_STYLE[a.status] || STATUS_STYLE.agendada;
              return (
                <div key={a.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover-card px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                        <span className="text-white/20 text-xs">{a.duracao}min · {a.recorrencia}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-white/30" />
                        <span className="text-white text-sm font-medium">{a.alunoNome}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium flex items-center gap-1 justify-end"><Calendar size={12} className="text-white/30" />{formatDate(a.data + 'T12:00:00', 'short')}</p>
                      <p className="text-white/30 text-xs flex items-center gap-1 justify-end"><Clock size={12} />{a.horario}</p>
                      <p className="text-amber-400 text-xs mt-1">{formatMoney(a.valor * a.splitInstrutor / 100)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {realizadas.length > 0 && (
        <>
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mt-4">{t('completedSessions')}</h2>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden divide-y">
            {realizadas.map((a: AulaParticular) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{a.alunoNome}</p>
                  <p className="text-white/25 text-xs">{formatDate(a.data + 'T12:00:00', 'short')} · {a.horario} · {a.duracao}min</p>
                </div>
                <p className="text-green-400 font-bold text-sm">{formatMoney(a.valor * a.splitInstrutor / 100)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
