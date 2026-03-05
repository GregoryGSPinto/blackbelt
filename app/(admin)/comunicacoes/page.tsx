'use client';

// ============================================================
// CENTRAL DE COMUNICAÇÕES — Admin
//
// Tabs: Comunicados (broadcast) / Mensagens (diretas)
// Compose modal para novos comunicados
// Stats: enviados, taxa leitura, pendentes
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Send, Megaphone, Mail, MailOpen, Plus, Clock, CheckCheck, Calendar, X, Eye, Filter, MessageSquare,
} from 'lucide-react';
import * as comService from '@/lib/api/comunicacoes.service';
import type { Comunicado, MensagemDireta, ComunicacoesStats } from '@/lib/api/comunicacoes.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

type TabView = 'comunicados' | 'mensagens';
type ComunicadoFilter = 'todos' | 'enviado' | 'rascunho' | 'agendado';

const TIPO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  geral: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Geral' },
  turma: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Turma' },
  financeiro: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Financeiro' },
  evento: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Evento' },
  urgente: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Urgente' },
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  enviado: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Enviado' },
  rascunho: { bg: 'bg-white/5', text: 'text-white/40', label: 'Rascunho' },
  agendado: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Agendado' },
};

const DESTINATARIO_LABELS: Record<string, string> = {
  todos: 'Todos',
  alunos: 'Alunos',
  instrutores: 'Instrutores',
  turma: 'Turma específica',
  inadimplentes: 'Inadimplentes',
};

export default function ComunicacoesPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate, formatDateTime } = useFormatting();
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [mensagens, setMensagens] = useState<MensagemDireta[]>([]);
  const [stats, setStats] = useState<ComunicacoesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [tab, setTab] = useState<TabView>('comunicados');
  const [comFilter, setComFilter] = useState<ComunicadoFilter>('todos');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedCom, setSelectedCom] = useState<Comunicado | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<MensagemDireta | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      comService.getComunicados(),
      comService.getMensagens(),
      comService.getStats(),
    ])
      .then(([coms, msgs, st]: [Comunicado[], MensagemDireta[], ComunicacoesStats]) => {
        setComunicados(coms);
        setMensagens(msgs);
        setStats(st);
      })
      .catch((err: unknown) => setError(handleServiceError(err, 'Comunicações')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const filteredComs = comunicados.filter((c: Comunicado) =>
    comFilter === 'todos' || c.status === comFilter
  );

  const unreadMsgs = mensagens.filter((m: MensagemDireta) => !m.lida && m.destinatarioId === 'adm01').length;

  if (loading) {
    return <PremiumLoader text="Carregando comunicações..." />;
  }

  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('communications.title')}</h1>
          <p style={{ fontWeight: 300, color: tokens.textMuted }}>Envie comunicados e gerencie mensagens</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all"
        >
          <Plus size={16} /> Novo Comunicado
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2">
              <Send size={16} className="text-blue-400" />
              <span className="text-white/40 text-xs">Enviados</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.comunicadosEnviados}</p>
          </div>
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2">
              <Eye size={16} className="text-green-400" />
              <span className="text-white/40 text-xs">Taxa Leitura</span>
            </div>
            <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{stats.taxaLeitura}%</p>
          </div>
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2">
              <Mail size={16} className="text-amber-400" />
              <span className="text-white/40 text-xs">Msg Pendentes</span>
            </div>
            <p className="text-amber-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{stats.mensagensPendentes}</p>
          </div>
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2">
              <Clock size={16} className="text-purple-400" />
              <span className="text-white/40 text-xs">Último Envio</span>
            </div>
            <p className="text-sm font-bold text-purple-400">
              {stats.ultimoEnvio ? formatDate(stats.ultimoEnvio, 'short') : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('comunicados')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'comunicados' ? 'bg-white/10 text-white border border-white/15' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Megaphone size={14} /> Comunicados
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{comunicados.length}</span>
        </button>
        <button
          onClick={() => setTab('mensagens')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'mensagens' ? 'bg-white/10 text-white border border-white/15' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <MessageSquare size={14} /> Mensagens
          {unreadMsgs > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadMsgs}</span>
          )}
        </button>
      </div>

      {/* ══════════ COMUNICADOS TAB ══════════ */}
      {tab === 'comunicados' && (
        <div style={{ ...glass, overflow: 'hidden' }}>
          {/* Filter */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
            <Filter size={14} className="text-white/30 flex-shrink-0" />
            {(['todos', 'enviado', 'rascunho', 'agendado'] as ComunicadoFilter[]).map((f: ComunicadoFilter) => (
              <button
                key={f}
                onClick={() => setComFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  comFilter === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {f === 'todos' ? 'Todos' : STATUS_STYLE[f]?.label || f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="divide-y">
            {filteredComs.map((com: Comunicado) => {
              const tipo = TIPO_STYLE[com.tipo] || TIPO_STYLE.geral;
              const status = STATUS_STYLE[com.status] || STATUS_STYLE.rascunho;
              const readPct = com.totalDestinatarios > 0 ? Math.round((com.lidos / com.totalDestinatarios) * 100) : 0;

              return (
                <div
                  key={com.id}
                  className="px-6 py-4 hover:bg-black/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedCom(com)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white font-medium text-sm">{com.titulo}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tipo.bg} ${tipo.text}`}>
                          {tipo.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-white/30 text-xs line-clamp-1">{com.mensagem}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-white/25">
                        <span>{DESTINATARIO_LABELS[com.destinatario] || com.destinatario}</span>
                        {com.turmaNome && <span>· {com.turmaNome}</span>}
                        <span>· {com.canal.join(', ')}</span>
                        <span>· {com.remetente}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/25 text-xs">
                        {formatDate(com.dataCriacao, 'short')}
                      </p>
                      {com.status === 'enviado' && (
                        <div className="mt-1 flex items-center gap-1 justify-end">
                          <CheckCheck size={10} className="text-green-400/50" />
                          <span className="text-green-400/50 text-[10px]">{readPct}% lido</span>
                        </div>
                      )}
                      {com.status === 'agendado' && com.agendadoPara && (
                        <div className="mt-1 flex items-center gap-1 justify-end">
                          <Calendar size={10} className="text-amber-400/50" />
                          <span className="text-amber-400/50 text-[10px]">
                            {formatDate(com.agendadoPara, 'short')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredComs.length === 0 && (
              <div className="px-6 py-12 text-center text-white/30 text-sm">Nenhum comunicado encontrado</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ MENSAGENS TAB ══════════ */}
      {tab === 'mensagens' && (
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div className="divide-y">
            {mensagens.map((msg: MensagemDireta) => {
              const isUnread = !msg.lida && msg.destinatarioId === 'adm01';
              const isIncoming = msg.destinatarioId === 'adm01';
              return (
                <div
                  key={msg.id}
                  className={`px-6 py-4 hover:bg-black/20 transition-colors cursor-pointer ${isUnread ? 'bg-blue-500/10' : ''}`}
                  onClick={() => setSelectedMsg(msg)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isUnread ? 'bg-blue-500/15' : 'bg-white/5'
                    }`}>
                      {isUnread ? <Mail size={16} className="text-blue-400" /> : <MailOpen size={16} className="text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-white/70'}`}>
                          {isIncoming ? msg.remetenteNome : `Para: ${msg.destinatarioNome}`}
                        </p>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-white/50 text-xs font-medium mb-0.5">{msg.assunto}</p>
                      <p className="text-white/25 text-xs line-clamp-1">{msg.mensagem}</p>
                    </div>
                    <p className="text-white/20 text-xs flex-shrink-0">
                      {formatDate(msg.data, 'short')}
                    </p>
                  </div>
                </div>
              );
            })}
            {mensagens.length === 0 && (
              <div className="px-6 py-12 text-center text-white/30 text-sm">Nenhuma mensagem</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ COMUNICADO DETAIL MODAL ══════════ */}
      {selectedCom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedCom(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TIPO_STYLE[selectedCom.tipo]?.bg} ${TIPO_STYLE[selectedCom.tipo]?.text}`}>
                      {TIPO_STYLE[selectedCom.tipo]?.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[selectedCom.status]?.bg} ${STATUS_STYLE[selectedCom.status]?.text}`}>
                      {STATUS_STYLE[selectedCom.status]?.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedCom.titulo}</h3>
                </div>
                <button onClick={() => setSelectedCom(null)} className="p-1 text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selectedCom.mensagem}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/40">Destinatário</span><span className="text-white/70">{DESTINATARIO_LABELS[selectedCom.destinatario]}{selectedCom.turmaNome ? ` — ${selectedCom.turmaNome}` : ''}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Canais</span><span className="text-white/70">{selectedCom.canal.join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Remetente</span><span className="text-white/70">{selectedCom.remetente}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Criado em</span><span className="text-white/70">{formatDate(selectedCom.dataCriacao, 'short')}</span></div>
                {selectedCom.status === 'enviado' && (
                  <>
                    <div className="flex justify-between"><span className="text-white/40">Enviado em</span><span className="text-white/70">{selectedCom.dataEnvio ? formatDate(selectedCom.dataEnvio, 'short') : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Leitura</span><span className="text-green-400">{selectedCom.lidos}/{selectedCom.totalDestinatarios} ({Math.round((selectedCom.lidos / Math.max(selectedCom.totalDestinatarios, 1)) * 100)}%)</span></div>
                  </>
                )}
                {selectedCom.agendadoPara && (
                  <div className="flex justify-between"><span className="text-white/40">Agendado para</span><span className="text-amber-400">{formatDateTime(selectedCom.agendadoPara)}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MESSAGE DETAIL MODAL ══════════ */}
      {selectedMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedMsg(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-white/30 mb-1">
                    De: <span className="text-white/60">{selectedMsg.remetenteNome}</span> → <span className="text-white/60">{selectedMsg.destinatarioNome}</span>
                  </p>
                  <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>{selectedMsg.assunto}</h3>
                  <p className="text-white/25 text-xs mt-1">{formatDateTime(selectedMsg.data)}</p>
                </div>
                <button onClick={() => setSelectedMsg(null)} className="p-1 text-white/30 hover:text-white"><X size={20} /></button>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selectedMsg.mensagem}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ COMPOSE MODAL ══════════ */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={(com: Comunicado) => {
            setComunicados((prev: Comunicado[]) => [com, ...prev]);
            setShowCompose(false);
          }}
        />
      )}
    </div>
  );
}

// ── Compose Modal ──
function ComposeModal({ onClose, onSend }: { onClose: () => void; onSend: (c: Comunicado) => void }) {
  const t = useTranslations('admin');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<string>('geral');
  const [canais, setCanais] = useState<string[]>(['app']);
  const [destinatario, setDestinatario] = useState<string>('todos');
  const [saving, setSaving] = useState(false);

  const toggleCanal = (c: string) => {
    setCanais((prev: string[]) => prev.includes(c) ? prev.filter((x: string) => x !== c) : [...prev, c]);
  };

  const handleSend = useCallback(async () => {
    if (!titulo.trim() || !mensagem.trim()) return;
    setSaving(true);
    try {
      const com = await comService.createComunicado({
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        tipo: tipo as Comunicado['tipo'],
        canal: canais as Comunicado['canal'],
        destinatario: destinatario as Comunicado['destinatario'],
        remetente: 'Admin',
        status: 'enviado',
        dataEnvio: new Date().toISOString().split('T')[0],
      });
      onSend(com);
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  }, [titulo, mensagem, tipo, canais, destinatario, onSend]);

  const TIPOS = [
    { key: 'geral', label: 'Geral' },
    { key: 'evento', label: 'Evento' },
    { key: 'financeiro', label: 'Financeiro' },
    { key: 'turma', label: 'Turma' },
    { key: 'urgente', label: 'Urgente' },
  ];
  const CANAIS = [
    { key: 'app', label: 'App' },
    { key: 'email', label: 'Email' },
    { key: 'whatsapp', label: 'WhatsApp' },
  ];
  const DESTINATARIOS = [
    { key: 'todos', label: 'Todos' },
    { key: 'alunos', label: 'Alunos' },
    { key: 'instrutores', label: 'Instrutores' },
    { key: 'inadimplentes', label: 'Inadimplentes' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{t('communications.newAnnouncement')}</h3>
            <button onClick={onClose} className="p-1 text-white/30 hover:text-white"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Título *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitulo(e.target.value)}
                placeholder="Título do comunicado"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20"
              />
            </div>

            {/* Mensagem */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Mensagem *</label>
              <textarea
                value={mensagem}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMensagem(e.target.value)}
                placeholder="Escreva sua mensagem..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20 resize-none"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Tipo</label>
              <div className="flex gap-2 flex-wrap">
                {TIPOS.map((t: { key: string; label: string }) => {
                  const st = TIPO_STYLE[t.key] || TIPO_STYLE.geral;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTipo(t.key)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        tipo === t.key ? `${st.bg} ${st.text} border border-current/20` : 'bg-white/5 text-white/40 border border-white/8'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Canais */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Canais de envio</label>
              <div className="flex gap-2">
                {CANAIS.map((c: { key: string; label: string }) => (
                  <button
                    key={c.key}
                    onClick={() => toggleCanal(c.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      canais.includes(c.key) ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-white/5 text-white/40 border border-white/8'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destinatário */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Destinatário</label>
              <div className="flex gap-2 flex-wrap">
                {DESTINATARIOS.map((d: { key: string; label: string }) => (
                  <button
                    key={d.key}
                    onClick={() => setDestinatario(d.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      destinatario === d.key ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-white/5 text-white/40 border border-white/8'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={saving || !titulo.trim() || !mensagem.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? 'Enviando...' : <><Send size={14} /> Enviar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
