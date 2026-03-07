'use client';
import { useState } from 'react';
import { Users, Target, TrendingUp, Clock, ChevronRight, Phone, Mail, MessageCircle, Calendar, Award, Star, ArrowRight, X } from 'lucide-react';
import { FUNIL_VENDAS, METRICA_FUNIL, INDICACOES, type FunilVendas, type CrmLead, type Indicacao } from '@/lib/__mocks__/unit-owner.mock';

// ============================================================
// CRM e Vendas — Unit Owner
//
// Funil de vendas (Kanban), metricas do funil, indicacoes
// ============================================================

type Tab = 'funil' | 'metricas' | 'indicacoes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'funil', label: 'Funil de Vendas' },
  { key: 'metricas', label: 'Metricas' },
  { key: 'indicacoes', label: 'Indicacoes' },
];

function formatPhone(tel: string): string {
  if (tel.length === 11) return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
  return tel;
}

function formatDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function CrmPage() {
  const [activeTab, setActiveTab] = useState<Tab>('funil');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [funilData, setFunilData] = useState<FunilVendas[]>(FUNIL_VENDAS);

  // ── Move lead to next column ──
  const moveLeadNext = (leadId: string, currentColIdx: number) => {
    if (currentColIdx >= funilData.length - 1) return;
    setFunilData(prev => {
      const next = prev.map(col => ({ ...col, leads: [...col.leads] }));
      const srcLeads = next[currentColIdx].leads;
      const leadIdx = srcLeads.findIndex(l => l.id === leadId);
      if (leadIdx === -1) return prev;
      const [lead] = srcLeads.splice(leadIdx, 1);
      next[currentColIdx + 1].leads.push(lead);
      return next;
    });
  };

  // ── Totals for metricas ──
  const totalLeads = funilData.reduce((s, c) => s + c.leads.length, 0);
  const totalMatriculados = funilData.find(c => c.coluna === 'Matriculou')?.leads.length ?? 0;
  const overallConversion = totalLeads > 0 ? ((totalMatriculados / totalLeads) * 100).toFixed(1) : '0';

  // ── Indicacoes stats ──
  const totalIndicacoes = INDICACOES.length;
  const convertidas = INDICACOES.filter(i => i.status === 'convertido').length;
  const taxaIndicacao = totalIndicacoes > 0 ? ((convertidas / totalIndicacoes) * 100).toFixed(1) : '0';

  const statusColor: Record<Indicacao['status'], string> = {
    pendente: '#FBBF24',
    convertido: '#22C55E',
    perdido: '#EF4444',
  };

  const statusLabel: Record<Indicacao['status'], string> = {
    pendente: 'Pendente',
    convertido: 'Convertido',
    perdido: 'Perdido',
  };

  // ── ROI mock data ──
  const roiCards = [
    { canal: 'Instagram Ads', investido: 1200, retorno: 4800, roi: 300 },
    { canal: 'Google Ads', investido: 800, retorno: 2400, roi: 200 },
    { canal: 'Indicacao', investido: 0, retorno: 3500, roi: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Title ── */}
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        CRM e Vendas
      </h1>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? 'var(--accent-color, #3B82F6)' : 'var(--card-bg)',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              border: activeTab === tab.key ? '1px solid var(--accent-color, #3B82F6)' : '1px solid black',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB 1: Funil de Vendas — Kanban                        */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'funil' && (
        <div className="overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-4" style={{ minWidth: funilData.length * 280 }}>
            {funilData.map((coluna, colIdx) => (
              <div
                key={coluna.coluna}
                className="rounded-xl flex flex-col"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid black',
                  borderRadius: 12,
                  minWidth: 260,
                  maxWidth: 300,
                  flex: '1 0 260px',
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: coluna.cor }}
                    />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {coluna.coluna}
                    </span>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: coluna.cor, color: '#fff' }}
                  >
                    {coluna.leads.length}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto" style={{ maxHeight: 480 }}>
                  {coluna.leads.map(lead => (
                    <div
                      key={lead.id}
                      className="rounded-lg p-3 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        background: `${coluna.cor}10`,
                        border: `1px solid ${coluna.cor}30`,
                      }}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {lead.nome}
                        </span>
                        {colIdx < funilData.length - 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); moveLeadNext(lead.id, colIdx); }}
                            className="p-1 rounded hover:opacity-70"
                            style={{ color: coluna.cor }}
                            title="Mover para proxima etapa"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mb-1">
                        <Phone size={11} style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {formatPhone(lead.telefone)}
                        </span>
                      </div>

                      <span
                        className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1"
                        style={{ background: `${coluna.cor}25`, color: coluna.cor }}
                      >
                        {lead.modalidade}
                      </span>

                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {lead.comoConheceu}
                      </div>

                      {lead.followUp && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={11} style={{ color: 'var(--text-secondary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Follow-up: {formatDate(lead.followUp)}
                          </span>
                        </div>
                      )}

                      {lead.motivoPerda && (
                        <div className="text-xs mt-1 font-medium" style={{ color: '#EF4444' }}>
                          Motivo: {lead.motivoPerda}
                        </div>
                      )}
                    </div>
                  ))}

                  {coluna.leads.length === 0 && (
                    <div className="text-center py-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Nenhum lead
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB 2: Metricas do Funil                                */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'metricas' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} style={{ color: '#3B82F6' }} />
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Total de Leads</span>
              </div>
              <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{totalLeads}</span>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} style={{ color: '#22C55E' }} />
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Matriculados</span>
              </div>
              <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{totalMatriculados}</span>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} style={{ color: '#F59E0B' }} />
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Taxa de Conversao Geral</span>
              </div>
              <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{overallConversion}%</span>
            </div>
          </div>

          {/* Funnel Visualization */}
          <div className="rounded-xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Funil de Conversao
            </h2>
            <div className="space-y-3">
              {METRICA_FUNIL.map((m, i) => {
                const maxWidth = 100 - i * 15;
                const barColors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#22C55E'];
                const color = barColors[i % barColors.length];
                return (
                  <div key={m.etapa} className="flex items-center gap-4">
                    <div className="w-40 shrink-0 text-right">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {m.etapa}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div
                        className="h-10 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          width: `${maxWidth}%`,
                          background: `${color}20`,
                          border: `1px solid ${color}50`,
                        }}
                      >
                        <span className="text-xs font-medium" style={{ color }}>
                          {m.taxa}%
                        </span>
                      </div>
                    </div>
                    <div className="w-28 shrink-0 flex items-center gap-1">
                      <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {m.tempoMedio} {m.tempoMedio === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROI Cards */}
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              ROI por Canal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {roiCards.map(card => (
                <div
                  key={card.canal}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {card.canal}
                  </span>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Investido</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {card.investido > 0 ? `R$ ${card.investido.toLocaleString('pt-BR')}` : 'Gratuito'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Retorno</span>
                      <span className="text-xs font-medium" style={{ color: '#22C55E' }}>
                        R$ {card.retorno.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>ROI</span>
                      <span className="text-sm font-medium" style={{ color: card.roi > 0 ? '#22C55E' : 'var(--text-primary)' }}>
                        {card.roi > 0 ? `${card.roi}%` : 'Organico'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* TAB 3: Indicacoes                                       */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'indicacoes' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} style={{ color: '#F59E0B' }} />
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Total de Indicacoes</span>
              </div>
              <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{totalIndicacoes}</span>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} style={{ color: '#22C55E' }} />
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Convertidas</span>
              </div>
              <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{convertidas}</span>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} style={{ color: '#3B82F6' }} />
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Taxa de Conversao</span>
              </div>
              <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>{taxaIndicacao}%</span>
            </div>
          </div>

          {/* Indicacoes Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
            <div className="p-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Indicacoes Recentes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Indicador</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Indicado</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Desconto</th>
                  </tr>
                </thead>
                <tbody>
                  {INDICACOES.map(ind => (
                    <tr key={ind.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {ind.indicador}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {ind.indicado}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: `${statusColor[ind.status]}20`,
                            color: statusColor[ind.status],
                          }}
                        >
                          {statusLabel[ind.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {ind.desconto}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Programa de Indicacao Card */}
          <div className="rounded-xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} style={{ color: '#F59E0B' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Programa de Indicacao
              </h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Alunos ativos podem indicar amigos e familiares para treinar na academia. Quando o indicado se matricula,
              o indicador recebe um beneficio (desconto na mensalidade, camiseta ou brinde). Esse programa fortalece a
              comunidade, reduz o custo de aquisicao de novos alunos e aumenta a retencao.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} style={{ color: '#F59E0B' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Indicou</span>
                </div>
                <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Aluno indica pelo app ou recepcao
                </span>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.08)' }}>
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} style={{ color: '#3B82F6' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Matriculou</span>
                </div>
                <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Indicado faz aula trial e se matricula
                </span>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(34,197,94,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Star size={14} style={{ color: '#22C55E' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Recompensa</span>
                </div>
                <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Indicador recebe desconto ou brinde
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* Lead Detail Modal                                       */}
      {/* ════════════════════════════════════════════════════════ */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedLead.nome}
              </h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Contact */}
              <div className="space-y-2">
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Contato</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatPhone(selectedLead.telefone)}</span>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedLead.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatPhone(selectedLead.whatsapp)}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Modalidade</span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedLead.modalidade}</p>
                </div>
                <div>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Como Conheceu</span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedLead.comoConheceu}</p>
                </div>
                <div>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Primeiro Contato</span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{formatDate(selectedLead.dataPrimeiroContato)}</p>
                </div>
                <div>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Responsavel</span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedLead.responsavel}</p>
                </div>
              </div>

              {/* Follow-up */}
              {selectedLead.followUp && (
                <div>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Follow-up</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={14} style={{ color: '#F59E0B' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(selectedLead.followUp)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedLead.notas && (
                <div>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Notas</span>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {selectedLead.notas}
                  </p>
                </div>
              )}

              {/* Motivo Perda */}
              {selectedLead.motivoPerda && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="text-xs font-normal" style={{ color: '#EF4444' }}>Motivo da Perda</span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#EF4444' }}>
                    {selectedLead.motivoPerda}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
