'use client';

import { useState } from 'react';
import {
  DollarSign, Users, TrendingUp, TrendingDown, Target, AlertTriangle,
  BarChart3, ArrowRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import Link from 'next/link';
import {
  OWNER_KPIS, RECEITA_MENSAL, DIST_MODALIDADE, DIST_PLANO,
  FUNIL_CONVERSAO, ALERTAS_NEGOCIO, COMPARATIVO_MES,
} from '@/lib/__mocks__/unit-owner.mock';

const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;

const tooltipStyle = {
  contentStyle: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: 'rgba(255,255,255,0.5)' },
  itemStyle: { color: '#fff' },
};

function fmt(n: number): string {
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`;
  return `R$ ${n}`;
}

export default function OwnerExecutiveDashboard() {
  const k = OWNER_KPIS;
  const [showComparativo, setShowComparativo] = useState(false);

  return (
    <div className="space-y-8">
      {/* ── KPIs Financeiros ── */}
      <Section title="KPIs Financeiros">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="MRR" value={`R$ ${(k.mrr/1000).toFixed(0)}k`} sub={`${k.mrrVariacao > 0 ? '+' : ''}${k.mrrVariacao}% vs anterior`} color="#22C55E" trend={k.mrrVariacao > 0 ? 'up' : 'down'} />
          <KpiCard label="ARR Projetado" value={`R$ ${(k.arr/1000).toFixed(0)}k`} color="#3B82F6" />
          <KpiCard label="Ticket Medio" value={`R$ ${k.ticketMedio}`} color="#FBBF24" />
          <KpiCard label="LTV Medio" value={`R$ ${(k.ltvMedio/1000).toFixed(1)}k`} color="#8B5CF6" />
          <KpiCard label="CAC Estimado" value={`R$ ${k.cacEstimado}`} color="#F97316" />
          <KpiCard label="ROI Mensal" value={`${k.roiMensal}%`} color="#10B981" />
        </div>
      </Section>

      {/* ── KPIs Operacionais ── */}
      <Section title="KPIs Operacionais">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Alunos Ativos" value={String(k.alunosAtivos)} color="#3B82F6" href="/usuarios" />
          <KpiCard label="Novos no Mes" value={`+${k.novosNoMes}`} color="#22C55E" />
          <KpiCard label="Cancelamentos" value={String(k.cancelamentosNoMes)} color="#EF4444" />
          <KpiCard label="Net Growth" value={`+${k.netGrowth}`} color={k.netGrowth > 0 ? '#22C55E' : '#EF4444'} />
          <KpiCard label="Retencao" value={`${k.taxaRetencao}%`} color={k.taxaRetencao >= 85 ? '#22C55E' : '#FBBF24'} />
          <KpiCard label="Inadimplencia" value={`${k.taxaInadimplencia}%`} color={k.taxaInadimplencia <= 5 ? '#22C55E' : k.taxaInadimplencia <= 10 ? '#FBBF24' : '#EF4444'} href="/financeiro" />
        </div>
      </Section>

      {/* ── KPIs Ocupacao ── */}
      <Section title="Ocupacao das Turmas">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Ocupacao Media" value={`${k.ocupacaoMedia}%`} color="#3B82F6" />
          <KpiCard label="Horario Mais Cheio" value={k.horarioMaisCheio} color="#F59E0B" small />
          <KpiCard label="Horario Mais Vazio" value={k.horarioMaisVazio} color="#6B7280" small />
          <KpiCard label="Turma Mais Lotada" value={k.turmaMaisLotada} color="#EF4444" small />
        </div>
      </Section>

      {/* ── Graficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Receita 12 meses */}
        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Receita - Ultimos 12 Meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RECEITA_MENSAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, 'Receita']} />
              <Line type="monotone" dataKey="receita" stroke="#22C55E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="despesa" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="text-[10px] text-white/30 flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Receita</span>
            <span className="text-[10px] text-white/30 flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block rounded border-dashed" /> Despesa</span>
          </div>
        </div>

        {/* Alunos Ativos 12 meses */}
        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Alunos Ativos - Ultimos 12 Meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RECEITA_MENSAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v, 'Alunos']} />
              <Line type="monotone" dataKey="alunos" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuicao por Modalidade (Pie) */}
        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Distribuicao por Modalidade</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={DIST_MODALIDADE} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={70} innerRadius={40} strokeWidth={0}>
                  {DIST_MODALIDADE.map((d, i) => <Cell key={i} fill={d.cor} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {DIST_MODALIDADE.map(d => (
                <div key={d.nome} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.cor }} />
                  <span className="text-xs text-white/50 flex-1">{d.nome}</span>
                  <span className="text-xs text-white/70 font-bold">{d.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribuicao por Plano (Pie) */}
        <div className="rounded-xl p-5" style={card}>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Distribuicao por Plano</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={DIST_PLANO} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={70} innerRadius={40} strokeWidth={0}>
                  {DIST_PLANO.map((d, i) => <Cell key={i} fill={d.cor} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {DIST_PLANO.map(d => (
                <div key={d.nome} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.cor }} />
                  <span className="text-xs text-white/50 flex-1">{d.nome}</span>
                  <span className="text-xs text-white/70 font-bold">{d.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Funil de Conversao ── */}
      <Section title="Funil de Conversao">
        <div className="rounded-xl p-5" style={card}>
          <div className="space-y-2">
            {FUNIL_CONVERSAO.map((f, i) => {
              const maxQ = FUNIL_CONVERSAO[0].quantidade;
              const width = (f.quantidade / maxQ) * 100;
              const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#FBBF24', '#06B6D4'];
              return (
                <div key={f.etapa} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-24 text-right">{f.etapa}</span>
                  <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${width}%`, background: `${colors[i]}30`, borderRight: `2px solid ${colors[i]}` }}
                    >
                      <span className="text-xs font-bold" style={{ color: colors[i] }}>{f.quantidade}</span>
                    </div>
                  </div>
                  <span className="text-xs text-white/30 w-12">{f.taxa}%</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-white/20 mt-3 text-center">Visitante → Trial → Matricula → Renovacao → Indicacao</p>
        </div>
      </Section>

      {/* ── Alertas de Negocio ── */}
      <Section title="Alertas de Negocio">
        <div className="space-y-2">
          {ALERTAS_NEGOCIO.map(a => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{
                background: a.tipo === 'critical' ? 'rgba(239,68,68,0.08)' : a.tipo === 'warning' ? 'rgba(251,191,36,0.08)' : 'rgba(59,130,246,0.08)',
                border: `1px solid ${a.tipo === 'critical' ? 'rgba(239,68,68,0.15)' : a.tipo === 'warning' ? 'rgba(251,191,36,0.15)' : 'rgba(59,130,246,0.15)'}`,
              }}
            >
              <AlertTriangle size={14} className={a.tipo === 'critical' ? 'text-red-400' : a.tipo === 'warning' ? 'text-amber-400' : 'text-blue-400'} style={{ marginTop: 2 }} />
              <div>
                <p className={`text-xs font-semibold ${a.tipo === 'critical' ? 'text-red-300' : a.tipo === 'warning' ? 'text-amber-300' : 'text-blue-300'}`}>{a.titulo}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{a.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Comparativo ── */}
      <Section title="Comparativo Mensal">
        <button
          onClick={() => setShowComparativo(!showComparativo)}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors mb-3"
        >
          {showComparativo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showComparativo ? 'Ocultar tabela' : 'Ver tabela comparativa'}
        </button>
        {showComparativo && (
          <div className="rounded-xl overflow-hidden" style={card}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-white/30 font-bold uppercase tracking-wider text-[10px]">Metrica</th>
                  <th className="text-right px-4 py-3 text-white/30 font-bold uppercase tracking-wider text-[10px]">Mes Atual</th>
                  <th className="text-right px-4 py-3 text-white/30 font-bold uppercase tracking-wider text-[10px]">Mes Anterior</th>
                  <th className="text-right px-4 py-3 text-white/30 font-bold uppercase tracking-wider text-[10px]">Mesmo Mes Ano Ant.</th>
                  <th className="text-right px-4 py-3 text-white/30 font-bold uppercase tracking-wider text-[10px]">Var. YoY</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVO_MES.map((c, i) => {
                  const yoy = c.mesmoMesAnoAnterior > 0 ? ((c.mesAtual - c.mesmoMesAnoAnterior) / c.mesmoMesAnoAnterior * 100).toFixed(1) : '—';
                  const yoyNum = typeof yoy === 'string' && yoy !== '—' ? parseFloat(yoy) : 0;
                  return (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-white/60 font-medium">{c.metrica}</td>
                      <td className="px-4 py-2.5 text-white/80 text-right font-bold">{c.mesAtual.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-white/40 text-right">{c.mesAnterior.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-white/40 text-right">{c.mesmoMesAnoAnterior.toLocaleString()}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${yoyNum > 0 ? 'text-emerald-400' : yoyNum < 0 ? 'text-red-400' : 'text-white/30'}`}>
                        {yoy !== '—' ? `${yoyNum > 0 ? '+' : ''}${yoy}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Quick Navigation ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink href="/financeiro-owner" icon={DollarSign} label="Financeiro Completo" color="#22C55E" />
        <QuickLink href="/equipe" icon={Users} label="Gestao de Pessoas" color="#3B82F6" />
        <QuickLink href="/crm" icon={Target} label="CRM e Vendas" color="#8B5CF6" />
        <QuickLink href="/metas" icon={BarChart3} label="Metas e OKRs" color="#FBBF24" />
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-white/20" />
        <h2 className="text-xs text-white/40 uppercase tracking-wider font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, color, trend, href, small }: {
  label: string; value: string; color: string; sub?: string; trend?: 'up' | 'down'; href?: string; small?: boolean;
}) {
  const inner = (
    <div className="rounded-xl p-3.5 hover:bg-white/[0.02] transition-all" style={card}>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <p className={`${small ? 'text-sm' : 'text-xl'} font-bold tabular-nums`} style={{ color }}>{value}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' && <TrendingUp size={10} className="text-emerald-400" />}
          {trend === 'down' && <TrendingDown size={10} className="text-red-400" />}
          <span className="text-[10px] text-white/30">{sub}</span>
        </div>
      )}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function QuickLink({ href, icon: Icon, label, color }: { href: string; icon: typeof DollarSign; label: string; color: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl p-3.5 hover:bg-white/[0.03] transition-all group" style={card}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors flex-1">{label}</span>
      <ArrowRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors" />
    </Link>
  );
}
