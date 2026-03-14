'use client';

import { useState } from 'react';
import {
  BarChart3, Users, DollarSign, Megaphone,
} from 'lucide-react';
import { ExportDropdown } from '@/components/shared/ExportDropdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import {
  OWNER_KPIS, RECEITA_MENSAL, RECEITA_POR_MODALIDADE, RECEITA_POR_PLANO,
  PROFESSORES, METRICA_FUNIL, FUNIL_CONVERSAO,
} from '@/lib/__mocks__/unit-owner.mock';

const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12 } as const;
const tooltipStyle = {
  contentStyle: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: 'rgba(255,255,255,0.5)' },
  itemStyle: { color: '#fff' },
};

type TabKey = 'operacional' | 'financeiro' | 'pessoas' | 'marketing';

const TABS: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
  { key: 'operacional', label: 'Operacional', icon: BarChart3 },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { key: 'pessoas', label: 'Pessoas', icon: Users },
  { key: 'marketing', label: 'Marketing', icon: Megaphone },
];

// Heatmap data
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const HORAS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
function heatVal(d: number, h: number): number {
  // Simulate ocupacao pattern
  const peak = (h >= 10 && h <= 13) || (h >= 5 && h <= 7); // 18-21h or 07-09h
  const weekend = d >= 4;
  if (peak) return 70 + Math.floor(Math.random() * 30);
  if (weekend) return 20 + Math.floor(Math.random() * 30);
  return 30 + Math.floor(Math.random() * 40);
}
const HEATMAP = DIAS.flatMap((dia, di) => HORAS.map((hora, hi) => ({ dia, hora, valor: heatVal(di, hi) })));

// Distribuicao faixa
const DIST_FAIXA = [
  { faixa: 'Branca', valor: 60, cor: '#E5E7EB' },
  { faixa: 'Azul', valor: 45, cor: '#3B82F6' },
  { faixa: 'Roxa', valor: 35, cor: '#8B5CF6' },
  { faixa: 'Marrom', valor: 25, cor: '#92400E' },
  { faixa: 'Preta', valor: 15, cor: '#1F2937' },
];

const DIST_IDADE = [
  { faixa: '5-12', valor: 15 },
  { faixa: '13-17', valor: 22 },
  { faixa: '18-25', valor: 45 },
  { faixa: '26-35', valor: 52 },
  { faixa: '36-45', valor: 30 },
  { faixa: '46+', valor: 16 },
];

export default function RelatoriosGerenciaisPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('operacional');
  const [periodo, setPeriodo] = useState('mes');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Relatorios Gerenciais</h1>
          <p className="text-sm text-white/40 mt-1">Central de dados para tomada de decisao</p>
        </div>
        <div className="flex gap-2">
          <select
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white/60 text-xs focus:outline-none"
          >
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Ano</option>
          </select>
          <ExportDropdown
            title="Relatorios Gerenciais"
            columns={['mes', 'receita', 'despesa']}
            columnLabels={['Mes', 'Receita', 'Despesa']}
            data={RECEITA_MENSAL.map(r => ({ mes: r.mes, receita: r.receita, despesa: r.despesa ?? 0 }))}
            buttonClassName="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            buttonStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/10">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
              activeTab === t.key ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <t.icon size={13} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'operacional' && <OperacionalTab />}
      {activeTab === 'financeiro' && <FinanceiroTab />}
      {activeTab === 'pessoas' && <PessoasTab />}
      {activeTab === 'marketing' && <MarketingTab />}
    </div>
  );
}

// ── Operacional ─────────────────────────────────────────────

function OperacionalTab() {
  const k = OWNER_KPIS;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Alunos Ativos" value={String(k.alunosAtivos)} color="#3B82F6" />
        <StatBox label="Ocupacao Media" value={`${k.ocupacaoMedia}%`} color="#22C55E" />
        <StatBox label="Net Growth" value={`+${k.netGrowth}`} color="#8B5CF6" />
        <StatBox label="Retencao" value={`${k.taxaRetencao}%`} color="#FBBF24" />
      </div>

      {/* Heatmap */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Ocupacao por Horario (Heatmap)</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-1 mb-1">
              <div className="w-10 shrink-0" />
              {HORAS.map(h => <div key={h} className="flex-1 text-center text-[8px] text-white/20">{h}</div>)}
            </div>
            {DIAS.map(dia => (
              <div key={dia} className="flex gap-1 mb-1">
                <div className="w-10 shrink-0 text-[10px] text-white/30 flex items-center">{dia}</div>
                {HORAS.map(hora => {
                  const cell = HEATMAP.find(h => h.dia === dia && h.hora === hora);
                  const v = cell?.valor ?? 0;
                  const bg = v > 80 ? 'bg-red-500/60' : v > 60 ? 'bg-amber-500/50' : v > 40 ? 'bg-emerald-500/30' : 'bg-emerald-500/10';
                  return (
                    <div key={`${dia}-${hora}`} className={`flex-1 h-6 rounded ${bg} flex items-center justify-center`} title={`${dia} ${hora}: ${v}%`}>
                      <span className="text-[7px] text-white/30">{v}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 justify-end">
              <span className="text-[8px] text-white/20">Vazio</span>
              {['bg-emerald-500/10', 'bg-emerald-500/30', 'bg-amber-500/50', 'bg-red-500/60'].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded ${c}`} />
              ))}
              <span className="text-[8px] text-white/20">Lotado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Novos vs Cancelamentos */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Novos vs Cancelamentos (12 meses)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={RECEITA_MENSAL.map((r, i) => ({
            mes: r.mes,
            novos: 8 + Math.floor(Math.random() * 8),
            cancelamentos: -(2 + Math.floor(Math.random() * 4)),
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="novos" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelamentos" fill="#EF4444" radius={[0, 0, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuicoes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Distribuicao por Faixa</h3>
          <div className="space-y-2">
            {DIST_FAIXA.map(f => (
              <div key={f.faixa} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: f.cor, border: f.cor === '#E5E7EB' ? '1px solid rgba(255,255,255,0.2)' : undefined }} />
                <span className="text-xs text-white/50 w-16">{f.faixa}</span>
                <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${(f.valor / 60) * 100}%`, background: f.cor, opacity: 0.6 }} />
                </div>
                <span className="text-xs text-white/70 font-medium w-8 text-right">{f.valor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Distribuicao por Idade</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={DIST_IDADE}>
              <XAxis dataKey="faixa" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="valor" fill="#8B5CF6" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatBox label="Tempo Medio Permanencia" value="14 meses" color="#06B6D4" />
        <StatBox label="Horario de Pico" value={OWNER_KPIS.horarioMaisCheio} color="#F59E0B" />
        <StatBox label="Dist. Sexo" value="62% M / 38% F" color="#EC4899" />
      </div>
    </div>
  );
}

// ── Financeiro ──────────────────────────────────────────────

function FinanceiroTab() {
  const last = RECEITA_MENSAL[RECEITA_MENSAL.length - 1];
  const totalDesp = 28000;
  const lucro = last.receita - totalDesp;
  const margem = ((lucro / last.receita) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Receita Mes" value={`R$ ${(last.receita/1000).toFixed(0)}k`} color="#22C55E" />
        <StatBox label="Despesas Mes" value={`R$ ${(totalDesp/1000).toFixed(0)}k`} color="#EF4444" />
        <StatBox label="Lucro Liquido" value={`R$ ${(lucro/1000).toFixed(0)}k`} color="#3B82F6" />
        <StatBox label="Margem" value={`${margem}%`} color="#FBBF24" />
      </div>

      {/* Evolucao MRR */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Evolucao MRR (12 meses)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={RECEITA_MENSAL}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, '']} />
            <Line type="monotone" dataKey="receita" stroke="#22C55E" strokeWidth={2} dot={false} name="Receita" />
            <Line type="monotone" dataKey="despesa" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Despesa" />
            <Line type="monotone" dataKey="lucro" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="Lucro" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Receita por modalidade e plano */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Receita por Modalidade</h3>
          <div className="space-y-2">
            {RECEITA_POR_MODALIDADE.map(r => (
              <div key={r.categoria} className="flex items-center gap-2">
                <span className="text-xs text-white/50 w-20">{r.categoria}</span>
                <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                  <div className="h-full rounded bg-emerald-500/40" style={{ width: `${r.percentual}%` }} />
                </div>
                <span className="text-xs text-white/70 font-medium w-16 text-right">R$ {(r.valor/1000).toFixed(1)}k</span>
                <span className="text-[10px] text-white/30 w-10 text-right">{r.percentual}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Receita por Plano</h3>
          <div className="space-y-2">
            {RECEITA_POR_PLANO.map(r => (
              <div key={r.categoria} className="flex items-center gap-2">
                <span className="text-xs text-white/50 w-28">{r.categoria}</span>
                <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                  <div className="h-full rounded bg-blue-500/40" style={{ width: `${r.percentual}%` }} />
                </div>
                <span className="text-xs text-white/70 font-medium w-16 text-right">R$ {(r.valor/1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* YoY */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Comparativo YoY</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={RECEITA_MENSAL.slice(-6).map(r => ({
            mes: r.mes,
            atual: r.receita,
            anterior: r.receita * (0.8 + Math.random() * 0.15),
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="atual" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Atual" />
            <Bar dataKey="anterior" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Ano Anterior" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Pessoas ─────────────────────────────────────────────────

function PessoasTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Professores" value={String(PROFESSORES.length)} color="#3B82F6" />
        <StatBox label="Avaliacao Media" value={`${(PROFESSORES.reduce((s, p) => s + p.avaliacaoMedia, 0) / PROFESSORES.length).toFixed(1)}/5`} color="#FBBF24" />
        <StatBox label="Retencao Media" value={`${Math.round(PROFESSORES.reduce((s, p) => s + p.retencaoAlunos, 0) / PROFESSORES.length)}%`} color="#22C55E" />
        <StatBox label="Custo/Aluno" value={`R$ ${Math.round(18200 / 180)}`} color="#8B5CF6" />
      </div>

      {/* Professor performance */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Desempenho por Professor</h3>
        <div className="space-y-3">
          {PROFESSORES.map(p => (
            <div key={p.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/60">
                  {p.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/80">{p.nome}</p>
                  <p className="text-[10px] text-white/30">{p.modalidades.join(', ')} | {p.cargaHoraria}h/sem</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 text-sm font-medium">{p.avaliacaoMedia}</span>
                  <span className="text-amber-400/50 text-xs">/5</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricBar label="Retencao" value={p.retencaoAlunos} color={p.retencaoAlunos >= 85 ? '#22C55E' : p.retencaoAlunos >= 70 ? '#FBBF24' : '#EF4444'} />
                <MetricBar label="Frequencia" value={p.frequenciaMedia} color={p.frequenciaMedia >= 85 ? '#22C55E' : p.frequenciaMedia >= 70 ? '#FBBF24' : '#EF4444'} />
                <MetricBar label="Satisfacao" value={p.satisfacao * 20} color={p.satisfacao >= 4 ? '#22C55E' : p.satisfacao >= 3 ? '#FBBF24' : '#EF4444'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Marketing ───────────────────────────────────────────────

function MarketingTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Leads no Funil" value="15" color="#3B82F6" />
        <StatBox label="Taxa Conversao" value="25%" color="#22C55E" />
        <StatBox label="Indicacoes" value="8" color="#8B5CF6" />
        <StatBox label="CAC" value={`R$ ${OWNER_KPIS.cacEstimado}`} color="#F97316" />
      </div>

      {/* Funil */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Funil de Conversao</h3>
        <div className="space-y-2">
          {FUNIL_CONVERSAO.map((f, i) => {
            const max = FUNIL_CONVERSAO[0].quantidade;
            const w = (f.quantidade / max) * 100;
            const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#FBBF24', '#06B6D4'];
            return (
              <div key={f.etapa} className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-20 text-right">{f.etapa}</span>
                <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg flex items-center justify-end pr-2" style={{ width: `${w}%`, background: `${colors[i]}25`, borderRight: `2px solid ${colors[i]}` }}>
                    <span className="text-xs font-medium" style={{ color: colors[i] }}>{f.quantidade}</span>
                  </div>
                </div>
                <span className="text-xs text-white/30 w-12">{f.taxa}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metricas por etapa */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Conversao por Etapa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {METRICA_FUNIL.map(m => (
            <div key={m.etapa} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-white/30 mb-1">{m.etapa}</p>
              <div className="flex items-end gap-2">
                <span className="text-lg font-medium text-white/80">{m.taxa}%</span>
                <span className="text-[10px] text-white/30 mb-0.5">{m.tempoMedio}d medio</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI por canal */}
      <div className="rounded-xl p-5" style={card}>
        <h3 className="text-sm font-semibold text-white/70 mb-4">ROI por Canal de Marketing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { canal: 'Instagram Ads', investido: 1200, retorno: 4500, leads: 18, conversoes: 5 },
            { canal: 'Google Ads', investido: 800, retorno: 2400, leads: 10, conversoes: 3 },
            { canal: 'Indicacao', investido: 0, retorno: 3500, leads: 8, conversoes: 4 },
          ].map(c => {
            const roi = c.investido > 0 ? (((c.retorno - c.investido) / c.investido) * 100).toFixed(0) : 'N/A';
            return (
              <div key={c.canal} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-white/50 font-medium mb-2">{c.canal}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-white/30">Investido</span><span className="text-white/60">R$ {c.investido}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Retorno</span><span className="text-emerald-400 font-medium">R$ {c.retorno}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">ROI</span><span className={`font-medium ${roi === 'N/A' ? 'text-white/40' : 'text-emerald-400'}`}>{roi === 'N/A' ? 'Organico' : `${roi}%`}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Leads</span><span className="text-white/60">{c.leads}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Conversoes</span><span className="text-white/60">{c.conversoes}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3.5" style={card}>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-medium tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/30">{label}</span>
        <span className="text-[10px] font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
