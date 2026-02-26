'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Calendar, MapPin, Users, Plus, Search,
  Edit3, Trash2, Download, Eye, Tag, ChevronDown,
  ChevronUp, X, CheckCircle, Clock, Ticket, FileText,
} from 'lucide-react';
import * as eventosService from '@/lib/api/eventos.service';
import type { Evento, StatusEvento, TipoEvento } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

// ── Constants ─────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusEvento, { label: string; color: string; dot: string }> = {
  AGENDADO:           { label: 'Agendado', color: 'text-blue-400', dot: 'bg-blue-400' },
  INSCRICOES_ABERTAS: { label: 'Inscrições Abertas', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  EM_ANDAMENTO:       { label: 'Em Andamento', color: 'text-amber-400', dot: 'bg-amber-400' },
  FINALIZADO:         { label: 'Finalizado', color: 'text-white/40', dot: 'bg-white/40' },
  CANCELADO:          { label: 'Cancelado', color: 'text-red-400', dot: 'bg-red-400' },
};

function formatDate(d: string) {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return d; }
}

// ── Page ──────────────────────────────────────────────────

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusEvento | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventosService.getEventos();
      setEventos(data);
    } catch (err) {
      setError(handleServiceError(err, 'Eventos'));
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  const filteredEventos = eventos.filter(e => {
    const matchSearch = !search || e.nome.toLowerCase().includes(search.toLowerCase()) || e.local.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filtroStatus || e.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = (evento: Evento) => {
    const csv = eventosService.exportarInscritosCSV(evento);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscritos_${evento.nome.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await eventosService.excluirEvento(id);
      setEventos(prev => prev.filter(e => e.id !== id));
    } catch { /* noop in mock */ }
  };

  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-3">
            <Trophy size={24} className="text-amber-400" />
            Eventos & Campeonatos
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {eventos.length} eventos · {eventos.filter(e => e.inscricoesAbertas).length} com inscrições abertas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-bold hover:bg-amber-500/30 transition-colors"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value as StatusEvento | '')}
          className="px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/60 text-sm focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={eventos.length} color="text-white" />
        <StatCard label="Inscrições abertas" value={eventos.filter(e => e.inscricoesAbertas).length} color="text-emerald-400" />
        <StatCard label="Finalizados" value={eventos.filter(e => e.status === 'FINALIZADO').length} color="text-blue-400" />
        <StatCard label="Total inscritos" value={eventos.reduce((s, e) => s + e.inscritos.length, 0)} color="text-amber-400" />
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-black/30 animate-pulse" />
          ))}
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">Nenhum evento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEventos.map(evento => {
            const expanded = expandedId === evento.id;
            const statusCfg = STATUS_CONFIG[evento.status];

            return (
              <div key={evento.id} className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusCfg.dot}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/80 truncate">{evento.nome}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/30">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />{formatDate(evento.data)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />{evento.local}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} />{evento.inscritos.length}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <span className={`hidden sm:inline text-[10px] font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
                  <span className="hidden sm:inline text-[10px] text-white/25">{evento.tipo}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setExpandedId(expanded ? null : evento.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
                      title="Detalhes"
                    >
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      onClick={() => handleExportCSV(evento)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
                      title="Exportar CSV"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(evento.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-white/[0.05] p-4 space-y-4 bg-black/20 backdrop-blur-sm">
                    <p className="text-xs text-white/40">{evento.descricao}</p>

                    {/* Quick info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-white/25">Tipo:</span>
                        <span className="text-white/60 ml-1">{evento.tipo}</span>
                      </div>
                      <div>
                        <span className="text-white/25">Valor:</span>
                        <span className="text-white/60 ml-1">{evento.valorInscricao === 0 ? 'Gratuito' : `R$ ${evento.valorInscricao}`}</span>
                      </div>
                      <div>
                        <span className="text-white/25">Categorias:</span>
                        <span className="text-white/60 ml-1">{evento.categorias.length}</span>
                      </div>
                      <div>
                        <span className="text-white/25">Vagas:</span>
                        <span className="text-white/60 ml-1">{evento.totalVagas || 'Ilimitadas'}</span>
                      </div>
                    </div>

                    {/* Inscritos list */}
                    {evento.inscritos.length > 0 && (
                      <div>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Inscritos</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {evento.inscritos.map(insc => (
                            <div key={insc.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/25 text-xs">
                              <span className="text-white/60">{insc.alunoNome}</span>
                              <span className="text-white/25">{insc.categoriaDescricao}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    {evento.resultados && evento.resultados.length > 0 && (
                      <div>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Resultados</p>
                        <div className="space-y-1">
                          {evento.resultados.sort((a, b) => (a.resultado?.posicao ?? 99) - (b.resultado?.posicao ?? 99)).map(res => (
                            <div key={res.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/25 text-xs">
                              <span>{res.resultado?.conquista === 'OURO' ? '🥇' : res.resultado?.conquista === 'PRATA' ? '🥈' : res.resultado?.conquista === 'BRONZE' ? '🥉' : ''}</span>
                              <span className="text-white/60 flex-1">{res.alunoNome}</span>
                              <span className="text-white/25">{res.categoriaDescricao}</span>
                              <span className="text-white/40 font-bold">{res.resultado?.posicao}º</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create form modal placeholder */}
      {showForm && <EventoFormModal onClose={() => setShowForm(false)} onCreated={(e) => { setEventos(prev => [e, ...prev]); setShowForm(false); }} />}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-3">
      <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function EventoFormModal({ onClose, onCreated }: { onClose: () => void; onCreated: (e: Evento) => void }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [tipo, setTipo] = useState<TipoEvento>('INTERNO');
  const [valor, setValor] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nome || !data || !local) return;
    setSubmitting(true);
    try {
      const evento = await eventosService.criarEvento({
        nome, descricao, data, local, tipo,
        valorInscricao: valor,
        categorias: [],
      });
      onCreated(evento);
    } catch { onClose(); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-950 border border-white/10 rounded-2xl p-6 space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-white">Novo Evento</h3>

        <Field label="Nome" value={nome} onChange={setNome} placeholder="Ex: Copa BlackBelt 2026" />
        <Field label="Descrição" value={descricao} onChange={setDescricao} placeholder="Descrição do evento" multiline />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" value={data} onChange={setData} type="date" />
          <Field label="Local" value={local} onChange={setLocal} placeholder="Local" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoEvento)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white/60 text-sm focus:outline-none"
            >
              <option value="INTERNO">Interno</option>
              <option value="EXTERNO">Externo</option>
            </select>
          </div>
          <Field label="Valor (R$)" value={String(valor)} onChange={v => setValor(Number(v) || 0)} type="number" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!nome || !data || !local || submitting}
          className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-sm disabled:opacity-40 hover:bg-amber-500/30 transition-colors"
        >
          {submitting ? 'Criando...' : 'Criar Evento'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', multiline = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean;
}) {
  const cls = "w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20";
  return (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none h-20`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}
