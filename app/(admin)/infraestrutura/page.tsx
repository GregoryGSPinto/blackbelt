'use client';

import { useState } from 'react';
import { Building2, Wrench, Package, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Plus, MapPin } from 'lucide-react';
import { ESPACOS, MANUTENCOES, EQUIPAMENTOS } from '@/lib/__mocks__/unit-owner.mock';

type Tab = 'espacos' | 'manutencao' | 'equipamentos';

const STATUS_DOT: Record<string, string> = {
  ativo: '#22C55E',
  manutencao: '#EAB308',
  desativado: '#EF4444',
};

const STATUS_LABEL: Record<string, string> = {
  ativo: 'Ativo',
  manutencao: 'Em Manutencao',
  desativado: 'Desativado',
};

const MANUT_STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pendente: { bg: '#FEF3C7', text: '#92400E' },
  realizada: { bg: '#D1FAE5', text: '#065F46' },
  agendada: { bg: '#DBEAFE', text: '#1E40AF' },
};

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  novo: { bg: '#D1FAE5', text: '#065F46' },
  bom: { bg: '#DBEAFE', text: '#1E40AF' },
  desgastado: { bg: '#FEF3C7', text: '#92400E' },
  substituir: { bg: '#FEE2E2', text: '#991B1B' },
};

const cardStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: 12,
};

export default function InfraestruturaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('espacos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'espacos', label: 'Espacos', icon: <Building2 className="w-4 h-4" /> },
    { key: 'manutencao', label: 'Manutencao', icon: <Wrench className="w-4 h-4" /> },
    { key: 'equipamentos', label: 'Equipamentos', icon: <Package className="w-4 h-4" /> },
  ];

  // Manutencao stats
  const manutTotal = MANUTENCOES.length;
  const manutPendentes = MANUTENCOES.filter(m => m.status === 'pendente').length;
  const manutAgendadas = MANUTENCOES.filter(m => m.status === 'agendada').length;
  const manutRealizadas = MANUTENCOES.filter(m => m.status === 'realizada').length;
  const preventivasAgendadas = MANUTENCOES.filter(m => m.status === 'agendada');

  // Equipamentos stats
  const equipTotal = EQUIPAMENTOS.reduce((sum, e) => sum + e.quantidade, 0);
  const equipSubstituir = EQUIPAMENTOS.filter(e => e.estado === 'substituir').length;
  const equipDesgastado = EQUIPAMENTOS.filter(e => e.estado === 'desgastado').length;
  const equipAlerta = EQUIPAMENTOS.filter(e => e.estado === 'desgastado' || e.estado === 'substituir');

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Infraestrutura e Espaco
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Gerencie espacos fisicos, manutencoes e equipamentos da academia
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? 'var(--text-primary)' : 'var(--card-bg)',
              color: activeTab === tab.key ? 'var(--card-bg)' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Espacos */}
      {activeTab === 'espacos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Salas e Tatames
            </h2>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{ ...cardStyle, color: 'var(--text-primary)' }}
            >
              <Plus className="w-4 h-4" />
              Novo Espaco
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ESPACOS.map((espaco) => {
              const isExpanded = expandedId === espaco.id;
              return (
                <div
                  key={espaco.id}
                  className="rounded-xl p-4 space-y-3"
                  style={cardStyle}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--text-primary)', color: 'var(--card-bg)' }}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {espaco.nome}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#E5E7EB', color: '#374151' }}
                        >
                          {espaco.tipo}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: STATUS_DOT[espaco.status] }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {STATUS_LABEL[espaco.status]}
                      </span>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Dimensoes</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{espaco.dimensoes}</p>
                    </div>
                    <div>
                      <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Capacidade</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{espaco.capacidade} pessoas</p>
                    </div>
                  </div>

                  {/* Equipment badges */}
                  <div className="flex flex-wrap gap-1">
                    {espaco.equipamentos.map((eq) => (
                      <span
                        key={eq}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#DBEAFE', color: '#1E40AF' }}
                      >
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Expand/collapse */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : espaco.id)}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Menos detalhes' : 'Mais detalhes'}
                  </button>

                  {isExpanded && (
                    <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--text-secondary)', opacity: 0.3 }}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>ID</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{espaco.id}</p>
                        </div>
                        <div>
                          <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Status</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{STATUS_LABEL[espaco.status]}</p>
                        </div>
                        <div>
                          <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Total Equipamentos</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{espaco.equipamentos.length} itens</p>
                        </div>
                        <div>
                          <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Tipo</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{espaco.tipo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Manutencao */}
      {activeTab === 'manutencao' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Manutencao
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: manutTotal, icon: <Wrench className="w-5 h-5" /> },
              { label: 'Pendentes', value: manutPendentes, icon: <Clock className="w-5 h-5" /> },
              { label: 'Agendadas', value: manutAgendadas, icon: <AlertTriangle className="w-5 h-5" /> },
              { label: 'Realizadas', value: manutRealizadas, icon: <CheckCircle className="w-5 h-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 flex items-center gap-3" style={cardStyle}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--text-primary)', color: 'var(--card-bg)' }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Alert banner for upcoming preventive maintenance */}
          {preventivasAgendadas.length > 0 && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12 }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#92400E' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                  Manutencoes preventivas agendadas
                </p>
                {preventivasAgendadas.map((m) => (
                  <p key={m.id} className="text-sm" style={{ color: '#92400E' }}>
                    {m.espaco}: {m.descricao} — {m.data}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance list */}
          <div className="space-y-3">
            {MANUTENCOES.map((m) => (
              <div key={m.id} className="rounded-xl p-4" style={cardStyle}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {m.espaco}
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: MANUT_STATUS_COLOR[m.status].bg,
                          color: MANUT_STATUS_COLOR[m.status].text,
                        }}
                      >
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                      {m.preventiva && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#E0E7FF', color: '#3730A3' }}
                        >
                          Preventiva
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {m.descricao}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-right">
                    <div>
                      <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Custo</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        R$ {m.custo.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Fornecedor</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{m.fornecedor}</p>
                    </div>
                    <div>
                      <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Data</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{m.data}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Equipamentos */}
      {activeTab === 'equipamentos' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Inventario de Equipamentos
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total de Itens', value: equipTotal, icon: <Package className="w-5 h-5" /> },
              { label: 'A Substituir', value: equipSubstituir, icon: <AlertTriangle className="w-5 h-5" /> },
              { label: 'Desgastados', value: equipDesgastado, icon: <Clock className="w-5 h-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 flex items-center gap-3" style={cardStyle}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--text-primary)', color: 'var(--card-bg)' }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Alert for items needing attention */}
          {equipAlerta.length > 0 && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 12 }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#991B1B' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>
                  Equipamentos que precisam de atencao
                </p>
                {equipAlerta.map((e) => (
                  <p key={e.id} className="text-sm" style={{ color: '#991B1B' }}>
                    {e.nome} — {e.quantidade} un. — Estado: {e.estado}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Equipment list */}
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            {/* Table header */}
            <div
              className="hidden md:grid grid-cols-7 gap-2 px-4 py-3 text-xs font-normal"
              style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)' }}
            >
              <span>Nome</span>
              <span>Qtd</span>
              <span>Estado</span>
              <span>Data Compra</span>
              <span>Custo (R$)</span>
              <span>Fornecedor</span>
              <span />
            </div>

            {EQUIPAMENTOS.map((eq, idx) => (
              <div
                key={eq.id}
                className="grid grid-cols-1 md:grid-cols-7 gap-2 px-4 py-3 items-center"
                style={{
                  borderBottom: idx < EQUIPAMENTOS.length - 1 ? '1px solid rgba(0,0,0,0.1)' : undefined,
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{eq.nome}</p>
                </div>
                <div>
                  <span className="md:hidden text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Qtd: </span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{eq.quantidade}</span>
                </div>
                <div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: ESTADO_COLOR[eq.estado].bg,
                      color: ESTADO_COLOR[eq.estado].text,
                    }}
                  >
                    {eq.estado.charAt(0).toUpperCase() + eq.estado.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="md:hidden text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Compra: </span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{eq.dataCompra}</span>
                </div>
                <div>
                  <span className="md:hidden text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Custo: </span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    R$ {eq.custo.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="md:hidden text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Fornecedor: </span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{eq.fornecedor}</span>
                </div>
                <div>
                  {(eq.estado === 'desgastado' || eq.estado === 'substituir') && (
                    <AlertTriangle className="w-4 h-4" style={{ color: ESTADO_COLOR[eq.estado].text }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
