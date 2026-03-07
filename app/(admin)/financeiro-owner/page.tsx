'use client';
import { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Receipt, BarChart3, Send, Ban, MessageSquare, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';
import { OWNER_KPIS, RECEITA_MENSAL, RECEITA_POR_MODALIDADE, RECEITA_POR_PLANO, DESPESAS, INADIMPLENTES, REGUA_COBRANCA, type ReguaCobranca, type Despesa } from '@/lib/__mocks__/unit-owner.mock';

type Tab = 'receitas' | 'despesas' | 'inadimplencia' | 'dre';

const cardStyle = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
const tooltipStyle = { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' } as const;

const COLORS_MODALIDADE = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#10B981'];
const COLORS_PLANO = ['#F59E0B', '#3B82F6', '#6B7280', '#10B981'];
const COLORS_DESPESA = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899'];

function formatCurrency(v: number) {
  return `R$${v.toLocaleString('pt-BR')}`;
}

export default function FinanceiroOwnerPage() {
  const [tab, setTab] = useState<Tab>('receitas');
  const [selectedInadimplentes, setSelectedInadimplentes] = useState<string[]>([]);
  const [reguaState, setReguaState] = useState<ReguaCobranca[]>([...REGUA_COBRANCA]);
  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [newDespesa, setNewDespesa] = useState({ nome: '', categoria: '', valor: '', tipo: 'fixa' as 'fixa' | 'variavel', recorrencia: 'mensal' as 'mensal' | 'anual' | 'avulsa' });
  const [despesasList, setDespesasList] = useState<Despesa[]>([...DESPESAS]);
  const [expandedCategoria, setExpandedCategoria] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'receitas', label: 'Receitas' },
    { key: 'despesas', label: 'Despesas' },
    { key: 'inadimplencia', label: 'Inadimplencia' },
    { key: 'dre', label: 'DRE' },
  ];

  // Calculations
  const totalDespesasFixas = despesasList.filter(d => d.tipo === 'fixa').reduce((s, d) => s + d.valor, 0);
  const totalDespesasVariaveis = despesasList.filter(d => d.tipo === 'variavel').reduce((s, d) => s + d.valor, 0);
  const totalDespesas = totalDespesasFixas + totalDespesasVariaveis;
  const lucroOperacional = OWNER_KPIS.mrr - totalDespesas;
  const margem = ((lucroOperacional / OWNER_KPIS.mrr) * 100).toFixed(1);
  const pontoEquilibrio = Math.ceil(totalDespesasFixas / OWNER_KPIS.ticketMedio);

  // Group despesas by categoria
  const despesasPorCategoria = despesasList.reduce<Record<string, Despesa[]>>((acc, d) => {
    if (!acc[d.categoria]) acc[d.categoria] = [];
    acc[d.categoria].push(d);
    return acc;
  }, {});

  const despesaPieData = Object.entries(despesasPorCategoria).map(([cat, items]) => ({
    name: cat,
    value: items.reduce((s, d) => s + d.valor, 0),
  }));

  // Projection
  const lastReceita = RECEITA_MENSAL[RECEITA_MENSAL.length - 1].receita;
  const projecao = [
    { mes: 'Abr/26', receita: Math.round(lastReceita * 1.05) },
    { mes: 'Mai/26', receita: Math.round(lastReceita * 1.05 * 1.05) },
    { mes: 'Jun/26', receita: Math.round(lastReceita * 1.05 * 1.05 * 1.05) },
  ];

  // Inadimplencia totals
  const totalInadimplentes = INADIMPLENTES.length;
  const totalValorInadimplencia = INADIMPLENTES.reduce((s, i) => s + i.valor, 0);

  function toggleInadimplente(id: string) {
    setSelectedInadimplentes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleAllInadimplentes() {
    if (selectedInadimplentes.length === INADIMPLENTES.length) {
      setSelectedInadimplentes([]);
    } else {
      setSelectedInadimplentes(INADIMPLENTES.map(i => i.id));
    }
  }

  function toggleRegua(dia: number) {
    setReguaState(prev => prev.map(r => r.dia === dia ? { ...r, ativo: !r.ativo } : r));
  }

  function handleAddDespesa() {
    if (!newDespesa.nome || !newDespesa.categoria || !newDespesa.valor) return;
    const nova: Despesa = {
      id: String(Date.now()),
      nome: newDespesa.nome,
      categoria: newDespesa.categoria,
      valor: Number(newDespesa.valor),
      tipo: newDespesa.tipo,
      recorrencia: newDespesa.recorrencia,
    };
    setDespesasList(prev => [...prev, nova]);
    setNewDespesa({ nome: '', categoria: '', valor: '', tipo: 'fixa', recorrencia: 'mensal' });
    setShowDespesaModal(false);
  }

  function diasAtrasoColor(dias: number) {
    if (dias > 15) return '#EF4444';
    if (dias > 7) return '#F59E0B';
    return '#3B82F6';
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        Gestao Financeira Completa
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: tab === t.key ? '#3B82F6' : 'var(--card-bg)',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
              border: '1px solid black',
              borderRadius: 12,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ======================== TAB: RECEITAS ======================== */}
      {tab === 'receitas' && (
        <div className="space-y-6">
          {/* KPIs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'MRR', value: formatCurrency(OWNER_KPIS.mrr), icon: DollarSign, color: '#10B981' },
              { label: 'ARR', value: formatCurrency(OWNER_KPIS.arr), icon: TrendingUp, color: '#3B82F6' },
              { label: 'Ticket Medio', value: formatCurrency(OWNER_KPIS.ticketMedio), icon: CreditCard, color: '#F59E0B' },
              { label: 'Variacao MRR', value: `+${OWNER_KPIS.mrrVariacao}%`, icon: TrendingUp, color: '#8B5CF6' },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-4" style={cardStyle}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: `${kpi.color}20` }}>
                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{kpi.label}</p>
                    <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{kpi.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Receita Mensal Line Chart */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Receita Mensal (12 meses)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={RECEITA_MENSAL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mes" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                  <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Receita']} />
                  <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Receita por Modalidade + Receita por Plano */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Modalidade */}
            <div className="rounded-xl p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Receita por Modalidade</h2>
              <div className="space-y-3">
                {RECEITA_POR_MODALIDADE.map((item, i) => (
                  <div key={item.categoria}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.categoria}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(item.valor)} ({item.percentual}%)
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${item.percentual}%`, background: COLORS_MODALIDADE[i] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plano - Pie Chart */}
            <div className="rounded-xl p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Receita por Plano</h2>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <RPieChart>
                    <Pie
                      data={RECEITA_POR_PLANO.map(p => ({ name: p.categoria, value: p.valor }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {RECEITA_POR_PLANO.map((_, i) => (
                        <Cell key={i} fill={COLORS_PLANO[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Receita']} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {RECEITA_POR_PLANO.map((p, i) => (
                  <div key={p.categoria} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS_PLANO[i] }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.categoria}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projecao */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Projecao Proximos 3 Meses (+5%/mes)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {projecao.map(p => (
                <div key={p.mes} className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12 }}>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{p.mes}</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.receita)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" style={{ color: '#10B981' }} />
                    <span className="text-xs" style={{ color: '#10B981' }}>+5%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================== TAB: DESPESAS ======================== */}
      {tab === 'despesas' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4" style={cardStyle}>
              <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Despesas Fixas</p>
              <p className="text-xl font-semibold" style={{ color: '#3B82F6' }}>{formatCurrency(totalDespesasFixas)}</p>
            </div>
            <div className="rounded-xl p-4" style={cardStyle}>
              <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Despesas Variaveis</p>
              <p className="text-xl font-semibold" style={{ color: '#F59E0B' }}>{formatCurrency(totalDespesasVariaveis)}</p>
            </div>
            <div className="rounded-xl p-4" style={cardStyle}>
              <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Total Despesas</p>
              <p className="text-xl font-semibold" style={{ color: '#EF4444' }}>{formatCurrency(totalDespesas)}</p>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowDespesaModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#3B82F6', color: '#fff', borderRadius: 12 }}
            >
              + Nova Despesa
            </button>
          </div>

          {/* Despesas by Categoria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Despesas por Categoria</h2>
              {Object.entries(despesasPorCategoria).map(([cat, items]) => (
                <div key={cat} className="rounded-xl overflow-hidden" style={cardStyle}>
                  <button
                    onClick={() => setExpandedCategoria(expandedCategoria === cat ? null : cat)}
                    className="w-full flex items-center justify-between p-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{cat}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                        {formatCurrency(items.reduce((s, d) => s + d.valor, 0))}
                      </span>
                    </div>
                    {expandedCategoria === cat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedCategoria === cat && (
                    <div className="px-4 pb-4 space-y-2">
                      {items.map(d => (
                        <div key={d.id} className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <div>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{d.nome}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.recorrencia}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: d.tipo === 'fixa' ? 'rgba(59,130,246,0.2)' : 'rgba(249,115,22,0.2)',
                                color: d.tipo === 'fixa' ? '#3B82F6' : '#F97316',
                              }}
                            >
                              {d.tipo}
                            </span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {formatCurrency(d.valor)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pie Chart */}
            <div className="rounded-xl p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Distribuicao de Despesas</h2>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <RPieChart>
                    <Pie
                      data={despesaPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {despesaPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS_DESPESA[i % COLORS_DESPESA.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {despesaPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS_DESPESA[i % COLORS_DESPESA.length] }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Despesa Modal */}
          {showDespesaModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="rounded-xl p-6 w-full max-w-md" style={{ ...cardStyle, background: 'var(--card-bg)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Nova Despesa</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-normal block mb-1" style={{ color: 'var(--text-secondary)' }}>Nome</label>
                    <input
                      type="text"
                      value={newDespesa.nome}
                      onChange={e => setNewDespesa(p => ({ ...p, nome: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-normal block mb-1" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                    <input
                      type="text"
                      value={newDespesa.categoria}
                      onChange={e => setNewDespesa(p => ({ ...p, categoria: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', outline: 'none' }}
                      placeholder="Ex: Infraestrutura, Pessoal..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-normal block mb-1" style={{ color: 'var(--text-secondary)' }}>Valor (R$)</label>
                    <input
                      type="number"
                      value={newDespesa.valor}
                      onChange={e => setNewDespesa(p => ({ ...p, valor: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-normal block mb-1" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                      <select
                        value={newDespesa.tipo}
                        onChange={e => setNewDespesa(p => ({ ...p, tipo: e.target.value as 'fixa' | 'variavel' }))}
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', outline: 'none' }}
                      >
                        <option value="fixa">Fixa</option>
                        <option value="variavel">Variavel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-normal block mb-1" style={{ color: 'var(--text-secondary)' }}>Recorrencia</label>
                      <select
                        value={newDespesa.recorrencia}
                        onChange={e => setNewDespesa(p => ({ ...p, recorrencia: e.target.value as 'mensal' | 'anual' | 'avulsa' }))}
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', outline: 'none' }}
                      >
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                        <option value="avulsa">Avulsa</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowDespesaModal(false)}
                    className="px-4 py-2 rounded-xl text-sm"
                    style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddDespesa}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: '#3B82F6', color: '#fff', borderRadius: 12 }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================== TAB: INADIMPLENCIA ======================== */}
      {tab === 'inadimplencia' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.2)' }}>
                  <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Total Inadimplentes</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{totalInadimplentes}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.2)' }}>
                  <DollarSign className="w-5 h-5" style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Valor Total em Atraso</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalValorInadimplencia)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={cardStyle}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Recuperados este Mes</p>
                  <p className="text-xl font-semibold" style={{ color: '#10B981' }}>R$2.400 (3 alunos)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Batch actions */}
          {selectedInadimplentes.length > 0 && (
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ ...cardStyle, background: 'rgba(59,130,246,0.1)' }}>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {selectedInadimplentes.length} selecionado(s)
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: '#3B82F6', color: '#fff' }}>
                  <Send className="w-3 h-3" /> Enviar Lembrete
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: '#EF4444', color: '#fff' }}>
                  <Ban className="w-3 h-3" /> Bloquear Acesso
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: '#F59E0B', color: '#fff' }}>
                  <MessageSquare className="w-3 h-3" /> Negociar
                </button>
              </div>
            </div>
          )}

          {/* Inadimplentes List */}
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Lista de Inadimplentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="text-left px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedInadimplentes.length === INADIMPLENTES.length}
                        onChange={toggleAllInadimplentes}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Dias Atraso</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Valor</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Contato</th>
                    <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {INADIMPLENTES.map(inad => (
                    <tr key={inad.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedInadimplentes.includes(inad.id)}
                          onChange={() => toggleInadimplente(inad.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{inad.nome}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            background: `${diasAtrasoColor(inad.diasAtraso)}20`,
                            color: diasAtrasoColor(inad.diasAtraso),
                          }}
                        >
                          {inad.diasAtraso} dias
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(inad.valor)}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <div>{inad.telefone}</div>
                          <div>{inad.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button className="p-1.5 rounded-lg" title="Enviar Lembrete" style={{ background: 'rgba(59,130,246,0.2)' }}>
                            <Send className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                          </button>
                          <button className="p-1.5 rounded-lg" title="Bloquear Acesso" style={{ background: 'rgba(239,68,68,0.2)' }}>
                            <Ban className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                          </button>
                          <button className="p-1.5 rounded-lg" title="Negociar" style={{ background: 'rgba(245,158,11,0.2)' }}>
                            <MessageSquare className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regua de Cobranca */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Regua de Cobranca</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="space-y-6">
                {reguaState.map((r, i) => {
                  const tipoColors: Record<string, string> = { lembrete: '#3B82F6', aviso: '#F59E0B', bloqueio: '#EF4444' };
                  const cor = tipoColors[r.tipo] || '#6B7280';
                  return (
                    <div key={r.dia} className="flex items-start gap-4 relative">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-sm font-bold"
                        style={{
                          background: r.ativo ? `${cor}30` : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${r.ativo ? cor : 'rgba(255,255,255,0.2)'}`,
                          color: r.ativo ? cor : 'var(--text-secondary)',
                        }}
                      >
                        D{r.dia}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.acao}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${cor}20`, color: cor }}
                          >
                            {r.tipo}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Dia {r.dia} de atraso</p>
                      </div>
                      <button
                        onClick={() => toggleRegua(r.dia)}
                        className="flex-shrink-0 w-10 h-5 rounded-full relative transition-colors"
                        style={{ background: r.ativo ? '#10B981' : 'rgba(255,255,255,0.15)' }}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: r.ativo ? '22px' : '2px' }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== TAB: DRE ======================== */}
      {tab === 'dre' && (
        <div className="space-y-6">
          {/* DRE Simplificado */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>DRE Simplificado</h2>
            <div className="space-y-3">
              {[
                { label: '(+) Receita Total', value: OWNER_KPIS.mrr, color: '#10B981', bold: false },
                { label: '(-) Despesas Fixas', value: totalDespesasFixas, color: '#EF4444', bold: false },
                { label: '(-) Despesas Variaveis', value: totalDespesasVariaveis, color: '#F59E0B', bold: false },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: row.color }}>{formatCurrency(row.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 border-b-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>(=) Lucro Operacional</span>
                <span className="text-base font-bold" style={{ color: lucroOperacional >= 0 ? '#10B981' : '#EF4444' }}>
                  {formatCurrency(lucroOperacional)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Margem Operacional</span>
                <span className="text-sm font-semibold" style={{ color: Number(margem) >= 0 ? '#10B981' : '#EF4444' }}>{margem}%</span>
              </div>
            </div>
          </div>

          {/* Ponto de Equilibrio */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ponto de Equilibrio</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Custos fixos ({formatCurrency(totalDespesasFixas)}) / Ticket medio ({formatCurrency(OWNER_KPIS.ticketMedio)})
            </p>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)', borderRadius: 12 }}>
                <Users className="w-6 h-6" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{pontoEquilibrio} alunos</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Minimo de alunos para cobrir custos fixos (atual: {OWNER_KPIS.alunosAtivos} alunos)
                </p>
              </div>
              <div className="ml-auto">
                {OWNER_KPIS.alunosAtivos >= pontoEquilibrio ? (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                    Acima do equilibrio
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                    Abaixo do equilibrio
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bar Chart: Receita vs Despesa */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Receita vs Despesa por Mes</h2>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={RECEITA_MENSAL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mes" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                  <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [formatCurrency(value), name === 'receita' ? 'Receita' : 'Despesa']} />
                  <Bar dataKey="receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Despesa</span>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => alert('Exportar CSV — funcionalidade em breve')}
              className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ border: '1px solid black', borderRadius: 12, color: 'var(--text-primary)', background: 'var(--card-bg)' }}
            >
              <Receipt className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => alert('Exportar PDF — funcionalidade em breve')}
              className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#3B82F6', color: '#fff', borderRadius: 12 }}
            >
              <BarChart3 className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
