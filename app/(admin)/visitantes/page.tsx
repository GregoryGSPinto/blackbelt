'use client';

// ============================================================
// VISITANTES — Drop-in, Day Use, Sessão Experimental
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, Calendar, Filter, Phone, Mail, MapPin, Clock,
  CheckCircle, XCircle, AlertCircle, Eye, Target, DollarSign,
} from 'lucide-react';
import * as visService from '@/lib/api/visitantes.service';
import type { Visitante, TipoVisita, StatusVisita } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

const TIPO_STYLE: Record<TipoVisita, { label: string; bg: string; text: string }> = {
  drop_in: { label: 'Drop-in', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  day_use: { label: 'Day Use', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  aula_experimental: { label: 'Experimental', bg: 'bg-green-500/10', text: 'text-green-400' },
  evento: { label: 'Evento', bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

const STATUS_STYLE: Record<StatusVisita, { label: string; icon: React.ReactNode; color: string }> = {
  pendente: { label: 'Pendente', icon: <Clock size={10} />, color: 'text-amber-400' },
  check_in: { label: 'Check-in', icon: <CheckCircle size={10} />, color: 'text-blue-400' },
  finalizada: { label: 'Finalizada', icon: <CheckCircle size={10} />, color: 'text-green-400' },
  no_show: { label: 'No-show', icon: <XCircle size={10} />, color: 'text-red-400' },
};

function formatCurrency(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function VisitantesPage() {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [stats, setStats] = useState<{ visitantesHoje: number; experimentaisHoje: number; dropInsHoje: number; receitaVisitas: number; noShows: number; pendentes: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  useEffect(() => {
    setError(null); setLoading(true);
    Promise.all([visService.getVisitantes(), visService.getVisitantesStats()])
      .then(([vis, st]) => { setVisitantes(vis); setStats(st as typeof stats); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Visitantes')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const filtered = useMemo(() => {
    let list = visitantes;
    if (filtroTipo !== 'todos') list = list.filter((v: Visitante) => v.tipoVisita === filtroTipo);
    if (filtroStatus !== 'todos') list = list.filter((v: Visitante) => v.status === filtroStatus);
    return list;
  }, [visitantes, filtroTipo, filtroStatus]);

  if (loading) return <PremiumLoader text="Carregando..." />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Visitantes</h1>
        <p className="text-white/50">Drop-in, day use e sessões experimentais</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><UserPlus size={16} className="text-blue-400" /><span className="text-white/40 text-xs">Visitantes Hoje</span></div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.visitantesHoje}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><Target size={16} className="text-green-400" /><span className="text-white/40 text-xs">Experimentais</span></div>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.experimentaisHoje}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-purple-400" /><span className="text-white/40 text-xs">Receita Visitas</span></div>
            <p className="text-xl font-bold text-purple-400">{formatCurrency(stats.receitaVisitas)}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-amber-400" /><span className="text-white/40 text-xs">Pendentes</span></div>
            <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.pendentes}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-white/30" />
        {['todos', 'drop_in', 'day_use', 'aula_experimental', 'evento'].map((t: string) => (
          <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtroTipo === t ? 'bg-white/10 text-white' : 'text-white/30'}`}>
            {t === 'todos' ? 'Todos' : TIPO_STYLE[t as TipoVisita]?.label || t}
          </button>
        ))}
        <span className="text-white/10">|</span>
        {['todos', 'pendente', 'check_in', 'finalizada', 'no_show'].map((s: string) => (
          <button key={s} onClick={() => setFiltroStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtroStatus === s ? 'bg-white/10 text-white' : 'text-white/30'}`}>
            {s === 'todos' ? 'Todos' : STATUS_STYLE[s as StatusVisita]?.label || s}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
        {filtered.map((v: Visitante) => {
          const tipo = TIPO_STYLE[v.tipoVisita];
          const status = STATUS_STYLE[v.status];
          return (
            <div key={v.id} className="px-6 py-4 hover:bg-black/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tipo.bg} ${tipo.text}`}>{tipo.label}</span>
                    <span className={`flex items-center gap-1 text-[10px] ${status.color}`}>{status.icon}{status.label}</span>
                    {v.origemLead && <span className="text-[10px] text-green-400/60 bg-green-500/5 px-1.5 rounded">Lead</span>}
                  </div>
                  <p className="text-white text-sm font-medium mb-0.5">{v.nome}</p>
                  <div className="flex flex-wrap items-center gap-3 text-white/25 text-xs">
                    <span className="flex items-center gap-1"><Phone size={10} />{v.telefone}</span>
                    {v.email && <span className="flex items-center gap-1"><Mail size={10} />{v.email}</span>}
                    {v.unidade && <span className="flex items-center gap-1"><MapPin size={10} />{v.unidade}</span>}
                  </div>
                  {v.turmaNome && <p className="text-white/20 text-xs mt-0.5">Turma: {v.turmaNome}</p>}
                  {v.observacao && <p className="text-white/15 text-[11px] mt-0.5 italic">{v.observacao}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  {v.valor > 0 ? (
                    <p className="text-green-400 font-bold text-sm">{formatCurrency(v.valor)}</p>
                  ) : (
                    <p className="text-white/20 text-xs">Gratuito</p>
                  )}
                  <p className="text-white/25 text-xs flex items-center gap-1 justify-end mt-0.5">
                    <Calendar size={10} />{new Date(v.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-white/15 text-xs">{v.horario}</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="px-6 py-12 text-center text-white/30 text-sm">Nenhum visitante encontrado</div>}
      </div>
    </div>
  );
}
