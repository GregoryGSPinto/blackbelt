'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Trophy, Calendar, MapPin, Users, ChevronRight, Tag, Ticket,
} from 'lucide-react';
import * as eventosService from '@/lib/api/eventos.service';
import type { Evento, StatusEvento } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

// ── Filtro tabs ───────────────────────────────────────────

type FiltroTab = 'todos' | 'proximos' | 'passados';

const FILTROS: { id: FiltroTab; label: string }[] = [
  { id: 'proximos', label: 'Próximos' },
  { id: 'passados', label: 'Passados' },
  { id: 'todos', label: 'Todos' },
];

// ── Status visual ─────────────────────────────────────────

const STATUS_CONFIG: Record<StatusEvento, { label: string; color: string; bg: string }> = {
  AGENDADO:           { label: 'Agendado', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25' },
  INSCRICOES_ABERTAS: { label: 'Inscrições abertas', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  EM_ANDAMENTO:       { label: 'Em andamento', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25' },
  FINALIZADO:         { label: 'Finalizado', color: 'text-white/40', bg: 'bg-white/5 border-white/10' },
  CANCELADO:          { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

// ── Componente principal ──────────────────────────────────

export default function EventosPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtro, setFiltro] = useState<FiltroTab>('proximos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const periodo = filtro === 'todos' ? undefined : filtro;
      const data = await eventosService.getEventos(periodo ? { periodo } : undefined);
      setEventos(data);
    } catch (err) {
      setError(handleServiceError(err, 'Eventos'));
    } finally {
      setLoading(false);
    }
  }, [filtro, retryCount]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-amber-400" />
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('events.title')}</h1>
          </div>
          <p className="text-white/40 text-sm">
            {t('events.subtitle')}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filtro === f.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Events list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/[0.04]">
              <Calendar size={28} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-medium">{t('events.noEvents')}</p>
            <p className="text-white/20 text-xs mt-1">Tente outro filtro ou volte mais tarde</p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map(evento => (
              <EventoCard
                key={evento.id}
                evento={evento}
                onClick={() => router.push(`/eventos/${evento.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────

function EventoCard({ evento, onClick }: { evento: Evento; onClick: () => void }) {
  const { formatDate } = useFormatting();
  const statusCfg = STATUS_CONFIG[evento.status];
  const isOpen = evento.inscricoesAbertas;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.05] transition-all group active:scale-[0.995] hover-card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors truncate">
            {evento.nome}
          </h3>
          <p className="text-xs text-white/30 line-clamp-2 mt-1">
            {evento.descricao}
          </p>
        </div>
        <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 shrink-0 mt-1 transition-colors" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {/* Date */}
        <span className="flex items-center gap-1 text-white/50">
          <Calendar size={12} />
          {formatDate(evento.data + 'T12:00:00', 'medium')}
          {evento.dataFim && evento.dataFim !== evento.data && (
            <> — {formatDate(evento.dataFim + 'T12:00:00', 'medium')}</>
          )}
        </span>

        {/* Location */}
        <span className="flex items-center gap-1 text-white/40">
          <MapPin size={12} />
          {evento.local}
        </span>

        {/* Inscriptions count */}
        <span className="flex items-center gap-1 text-white/40">
          <Users size={12} />
          {evento.inscritos.length} inscritos
        </span>

        {/* Price */}
        {evento.valorInscricao !== undefined && (
          <span className="flex items-center gap-1 text-white/40">
            <Ticket size={12} />
            {evento.valorInscricao === 0 ? 'Gratuito' : `R$ ${evento.valorInscricao}`}
          </span>
        )}
      </div>

      {/* Status + Type badges */}
      <div className="flex items-center gap-2 mt-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${statusCfg.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.color === 'text-emerald-400' ? 'bg-emerald-400' : statusCfg.color === 'text-blue-400' ? 'bg-blue-400' : statusCfg.color === 'text-amber-400' ? 'bg-amber-400' : 'bg-white/40'}`} />
          <span className={statusCfg.color}>{statusCfg.label}</span>
        </span>

        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/40 font-medium">
          <Tag size={9} />
          {evento.tipo === 'INTERNO' ? 'Interno' : 'Externo'}
        </span>

        {isOpen && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold animate-pulse">
            Inscreva-se
          </span>
        )}
      </div>
    </button>
  );
}
