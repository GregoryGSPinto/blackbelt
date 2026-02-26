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

function formatCurrency(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  agendada: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Agendada' },
  confirmada: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Confirmada' },
  realizada: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Realizada' },
  cancelada: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelada' },
};

export default function ProfessorParticularesPage() {
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

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto mb-4" /><p className="text-white/60">Carregando...</p></div></div>;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Minhas Particulares</h1>
        <p className="text-white/50">Agenda e extrato de sessões particulares</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><CalendarCheck size={16} className="text-blue-400" /><span className="text-white/40 text-xs">Próximas</span></div>
          <p className="text-xl sm:text-2xl font-bold text-white">{proximas.length}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-400" /><span className="text-white/40 text-xs">Realizadas</span></div>
          <p className="text-xl sm:text-2xl font-bold text-green-400">{realizadas.length}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-amber-400" /><span className="text-white/40 text-xs">Ganhos Mês</span></div>
          <p className="text-xl font-bold text-amber-400">{formatCurrency(ganhosMes)}</p>
        </div>
      </div>

      {proximas.length > 0 && (
        <>
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Próximas Sessões</h2>
          <div className="space-y-3">
            {proximas.map((a: AulaParticular) => {
              const st = STATUS_STYLE[a.status] || STATUS_STYLE.agendada;
              return (
                <div key={a.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4">
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
                      <p className="text-white text-sm font-medium flex items-center gap-1 justify-end"><Calendar size={12} className="text-white/30" />{new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      <p className="text-white/30 text-xs flex items-center gap-1 justify-end"><Clock size={12} />{a.horario}</p>
                      <p className="text-amber-400 text-xs mt-1">{formatCurrency(a.valor * a.splitInstrutor / 100)}</p>
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
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mt-4">Realizadas</h2>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            {realizadas.map((a: AulaParticular) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{a.alunoNome}</p>
                  <p className="text-white/25 text-xs">{new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} · {a.horario} · {a.duracao}min</p>
                </div>
                <p className="text-green-400 font-bold text-sm">{formatCurrency(a.valor * a.splitInstrutor / 100)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
