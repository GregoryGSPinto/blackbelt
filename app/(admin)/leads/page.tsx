'use client';

// ============================================================
// FUNIL DE VENDAS — Admin
//
// Kanban board com etapas do funil, estatísticas,
// cadastro de leads, mover entre etapas
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPlus, Phone, CalendarCheck, Award, Handshake, CheckCircle2,
  XCircle, Search, Plus, ChevronRight, TrendingUp, Users, Target,
  Clock, X, Instagram, MessageCircle, Globe, MapPin, User,
} from 'lucide-react';
import * as leadsService from '@/lib/api/leads.service';
import type { Lead, LeadEtapa, FunnelStats } from '@/lib/api/leads.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

// ── Etapa config ──
interface EtapaConfig {
  key: LeadEtapa;
  label: string;
  icon: typeof UserPlus;
  color: string;
  bgCard: string;
  borderCard: string;
}

const ETAPAS: EtapaConfig[] = [
  { key: 'novo', label: 'Novos', icon: UserPlus, color: '#60a5fa', bgCard: 'rgba(96,165,250,0.06)', borderCard: 'rgba(96,165,250,0.15)' },
  { key: 'contato', label: 'Contato', icon: Phone, color: '#a78bfa', bgCard: 'rgba(167,139,250,0.06)', borderCard: 'rgba(167,139,250,0.15)' },
  { key: 'agendado', label: 'Agendado', icon: CalendarCheck, color: '#fbbf24', bgCard: 'rgba(251,191,36,0.06)', borderCard: 'rgba(251,191,36,0.15)' },
  { key: 'trial', label: 'Trial', icon: Award, color: '#f97316', bgCard: 'rgba(249,115,22,0.06)', borderCard: 'rgba(249,115,22,0.15)' },
  { key: 'negociacao', label: 'Negociação', icon: Handshake, color: '#ec4899', bgCard: 'rgba(236,72,153,0.06)', borderCard: 'rgba(236,72,153,0.15)' },
  { key: 'convertido', label: 'Convertido', icon: CheckCircle2, color: '#22c55e', bgCard: 'rgba(34,197,94,0.06)', borderCard: 'rgba(34,197,94,0.15)' },
  { key: 'perdido', label: 'Perdido', icon: XCircle, color: '#6b7280', bgCard: 'rgba(107,114,128,0.04)', borderCard: 'rgba(107,114,128,0.10)' },
];

const ORIGEM_ICON: Record<string, { icon: typeof Instagram; label: string }> = {
  instagram: { icon: Instagram, label: 'Instagram' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  indicacao: { icon: Users, label: 'Indicação' },
  site: { icon: Globe, label: 'Site' },
  presencial: { icon: MapPin, label: 'Presencial' },
  outro: { icon: User, label: 'Outro' },
};

function formatPhone(tel: string): string {
  if (tel.length === 11) return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
  return tel;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [busca, setBusca] = useState('');
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [movingLead, setMovingLead] = useState<string | null>(null);

  // ── Load ──
  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([leadsService.getLeads(), leadsService.getStats()])
      .then(([leadsData, statsData]: [Lead[], FunnelStats]) => {
        setLeads(leadsData);
        setStats(statsData);
      })
      .catch((err: unknown) => setError(handleServiceError(err, 'Leads')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  // ── Move lead ──
  const handleMoveEtapa = useCallback(async (leadId: string, novaEtapa: LeadEtapa) => {
    setMovingLead(leadId);
    try {
      const updated = await leadsService.moverEtapa(leadId, novaEtapa);
      setLeads((prev: Lead[]) => prev.map((l: Lead) => l.id === leadId ? updated : l));
    } catch {
      // Error silent
    } finally {
      setMovingLead(null);
    }
  }, []);

  // ── Filter ──
  const filteredLeads = useMemo(() => {
    if (!busca.trim()) return leads;
    const q = busca.toLowerCase();
    return leads.filter((l: Lead) =>
      l.nome.toLowerCase().includes(q) || l.telefone.includes(q) || (l.email && l.email.toLowerCase().includes(q))
    );
  }, [leads, busca]);

  // ── Group by etapa ──
  const leadsByEtapa = useMemo(() => {
    const map: Record<LeadEtapa, Lead[]> = { novo: [], contato: [], agendado: [], trial: [], negociacao: [], convertido: [], perdido: [] };
    for (const l of filteredLeads as Lead[]) {
      if (map[l.etapa]) map[l.etapa].push(l);
    }
    return map;
  }, [filteredLeads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto mb-4" />
          <p className="text-white/60">Carregando funil...</p>
        </div>
      </div>
    );
  }

  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Funil de Vendas</h1>
          <p className="text-white/50">Acompanhe e gerencie seus leads</p>
        </div>
        <button
          onClick={() => setShowNewLead(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all"
        >
          <Plus size={16} /> Novo Lead
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users size={16} className="text-blue-400" />
              <span className="text-white/40 text-xs">Total Leads</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalLeads}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Target size={16} className="text-green-400" />
              <span className="text-white/40 text-xs">Taxa Conversão</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.taxaConversao}%</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={16} className="text-amber-400" />
              <span className="text-white/40 text-xs">Convertidos/Mês</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.conversaoMes}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={16} className="text-purple-400" />
              <span className="text-white/40 text-xs">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.tempoMedioConversao}d</p>
          </div>
        </div>
      )}

      {/* Origin breakdown */}
      {stats && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Origem dos Leads</p>
          <div className="flex gap-3 flex-wrap">
            {(Object.entries(stats.porOrigem) as [string, number][])
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([origem, count]) => {
                const o = ORIGEM_ICON[origem] || ORIGEM_ICON.outro;
                const Icon = o.icon;
                return (
                  <div key={origem} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
                    <Icon size={14} className="text-white/40" />
                    <span className="text-white/60 text-sm">{o.label}</span>
                    <span className="text-white font-bold text-sm">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={busca}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
          placeholder="Buscar lead por nome, telefone ou email..."
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none bg-black/40 border border-white/10 focus:border-white/20 transition-colors"
        />
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${ETAPAS.length * 260}px` }}>
          {ETAPAS.map((etapa: EtapaConfig) => {
            const Icon = etapa.icon;
            const etapaLeads = leadsByEtapa[etapa.key] || [];
            const nextEtapas = getNextEtapas(etapa.key);

            return (
              <div
                key={etapa.key}
                className="flex-1 min-w-[240px] max-w-[300px]"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Icon size={16} style={{ color: etapa.color }} />
                  <span className="text-white/70 text-sm font-bold">{etapa.label}</span>
                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${etapa.color}15`, color: etapa.color }}
                  >
                    {etapaLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {etapaLeads.map((lead: Lead) => {
                    const origemInfo = ORIGEM_ICON[lead.origem] || ORIGEM_ICON.outro;
                    const OrigemIcon = origemInfo.icon;
                    const isMoving = movingLead === lead.id;

                    return (
                      <div
                        key={lead.id}
                        className={`rounded-xl p-3.5 cursor-pointer transition-all hover:translate-y-[-1px] ${isMoving ? 'opacity-50' : ''}`}
                        style={{ background: etapa.bgCard, border: `1px solid ${etapa.borderCard}` }}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-white text-sm font-medium leading-tight">{lead.nome}</p>
                          <OrigemIcon size={12} className="text-white/25 flex-shrink-0 mt-0.5" />
                        </div>

                        <p className="text-white/35 text-xs mb-2">{formatPhone(lead.telefone)}</p>

                        {lead.interesse.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {lead.interesse.map((int: string) => (
                              <span key={int} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                                {int}
                              </span>
                            ))}
                          </div>
                        )}

                        {lead.trialAgendado && (
                          <p className="text-[10px] text-amber-400/60">
                            Trial: {new Date(lead.trialAgendado).toLocaleDateString('pt-BR')} {new Date(lead.trialAgendado).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}

                        {lead.valorProposta && (
                          <p className="text-[10px] text-green-400/60">
                            {lead.planoInteresse} — R${lead.valorProposta.toFixed(2)}
                          </p>
                        )}

                        {/* Quick move buttons */}
                        {nextEtapas.length > 0 && (
                          <div className="flex gap-1 mt-2 pt-2 border-t border-white/5">
                            {nextEtapas.map((ne: EtapaConfig) => (
                              <button
                                key={ne.key}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleMoveEtapa(lead.id, ne.key);
                                }}
                                disabled={isMoving}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium hover:opacity-80 transition-all disabled:opacity-30"
                                style={{ background: `${ne.color}10`, color: ne.color, border: `1px solid ${ne.color}20` }}
                                title={`Mover para ${ne.label}`}
                              >
                                <ChevronRight size={10} /> {ne.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {etapaLeads.length === 0 && (
                    <div
                      className="rounded-xl p-6 text-center"
                      style={{ background: etapa.bgCard, border: `1px dashed ${etapa.borderCard}` }}
                    >
                      <p className="text-white/15 text-xs">Nenhum lead</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedLead.nome}</h3>
                  <p className="text-white/40 text-sm mt-1">{formatPhone(selectedLead.telefone)}</p>
                  {selectedLead.email && <p className="text-white/30 text-xs">{selectedLead.email}</p>}
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-1 text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Etapa</span>
                  <span className="text-white font-medium">{ETAPAS.find((e: EtapaConfig) => e.key === selectedLead.etapa)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Origem</span>
                  <span className="text-white font-medium">{ORIGEM_ICON[selectedLead.origem]?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Criado em</span>
                  <span className="text-white font-medium">{new Date(selectedLead.dataCriacao + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                {selectedLead.interesse.length > 0 && (
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-white/40">Interesse</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {selectedLead.interesse.map((i: string) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50">{i}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedLead.responsavel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Responsável</span>
                    <span className="text-white/70">{selectedLead.responsavel}</span>
                  </div>
                )}
                {selectedLead.trialAgendado && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Trial</span>
                    <span className="text-white/70">
                      {new Date(selectedLead.trialAgendado).toLocaleDateString('pt-BR')}{' '}
                      {new Date(selectedLead.trialAgendado).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {selectedLead.trialRealizado && ' ✅'}
                    </span>
                  </div>
                )}
                {selectedLead.planoInteresse && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Plano</span>
                    <span className="text-white/70">{selectedLead.planoInteresse} — R${selectedLead.valorProposta?.toFixed(2)}</span>
                  </div>
                )}
                {selectedLead.observacao && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Observação</p>
                    <p className="text-white/60 text-sm">{selectedLead.observacao}</p>
                  </div>
                )}
              </div>

              {/* Move actions */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Mover para</p>
                <div className="flex flex-wrap gap-2">
                  {ETAPAS.filter((e: EtapaConfig) => e.key !== selectedLead.etapa).map((e: EtapaConfig) => {
                    const Icon = e.icon;
                    return (
                      <button
                        key={e.key}
                        onClick={() => {
                          handleMoveEtapa(selectedLead.id, e.key);
                          setSelectedLead({ ...selectedLead, etapa: e.key });
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium hover:opacity-80 transition-all"
                        style={{ background: `${e.color}10`, color: e.color, border: `1px solid ${e.color}20` }}
                      >
                        <Icon size={12} /> {e.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewLead && (
        <NewLeadModal
          onClose={() => setShowNewLead(false)}
          onSave={(lead: Lead) => {
            setLeads((prev: Lead[]) => [lead, ...prev]);
            setShowNewLead(false);
          }}
        />
      )}
    </div>
  );
}

// ── Helper: get next stages ──
function getNextEtapas(current: LeadEtapa): EtapaConfig[] {
  const flow: Record<LeadEtapa, LeadEtapa[]> = {
    novo: ['contato', 'perdido'],
    contato: ['agendado', 'perdido'],
    agendado: ['trial', 'perdido'],
    trial: ['negociacao', 'perdido'],
    negociacao: ['convertido', 'perdido'],
    convertido: [],
    perdido: ['novo'],
  };
  return (flow[current] || []).map((k: LeadEtapa) => ETAPAS.find((e: EtapaConfig) => e.key === k)!).filter(Boolean);
}

// ── New Lead Modal ──
function NewLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (lead: Lead) => void }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [origem, setOrigem] = useState<string>('instagram');
  const [interesse, setInteresse] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleInteresse = (val: string) => {
    setInteresse((prev: string[]) =>
      prev.includes(val) ? prev.filter((i: string) => i !== val) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    if (!nome.trim() || !telefone.trim()) return;
    setSaving(true);
    try {
      const lead = await leadsService.createLead({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        email: email.trim() || undefined,
        etapa: 'novo',
        origem: origem as Lead['origem'],
        interesse,
        observacao: observacao.trim() || undefined,
      });
      onSave(lead);
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  };

  const MODALIDADES = ['BlackBelt', 'No-Gi', 'Muay Thai', 'Wrestling', 'Kids'];
  const ORIGENS = ['instagram', 'whatsapp', 'indicacao', 'site', 'presencial', 'outro'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Novo Lead</h3>
            <button onClick={onClose} className="p-1 text-white/30 hover:text-white"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                placeholder="Nome completo"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Telefone *</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefone(e.target.value)}
                placeholder="(31) 99999-9999"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20"
              />
            </div>

            {/* Origem */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Origem</label>
              <div className="flex gap-2 flex-wrap">
                {ORIGENS.map((o: string) => {
                  const info = ORIGEM_ICON[o] || ORIGEM_ICON.outro;
                  const Icon = info.icon;
                  return (
                    <button
                      key={o}
                      onClick={() => setOrigem(o)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        origem === o ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-white/5 text-white/40 border border-white/8 hover:text-white/60'
                      }`}
                    >
                      <Icon size={12} /> {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interesse */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Interesse</label>
              <div className="flex gap-2 flex-wrap">
                {MODALIDADES.map((m: string) => (
                  <button
                    key={m}
                    onClick={() => toggleInteresse(m)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      interesse.includes(m) ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-white/5 text-white/40 border border-white/8 hover:text-white/60'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">Observação</label>
              <textarea
                value={observacao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacao(e.target.value)}
                placeholder="Detalhes sobre o lead..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20 resize-none"
              />
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
              onClick={handleSubmit}
              disabled={saving || !nome.trim() || !telefone.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
