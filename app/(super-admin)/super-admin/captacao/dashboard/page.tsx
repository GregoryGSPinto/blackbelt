'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, DollarSign, MapPinned, Sparkles, Target, Workflow } from 'lucide-react';
import { CaptacaoTabs, SectionCard, StatCard, currency, statusLabels } from '@/components/super-admin/captacao/ui';

interface MetricsPayload {
  summary: {
    totalLeads: number;
    conversionRate: number;
    avgDealSize: number;
    revenuePotential: number;
    pipelineValue: number;
  };
  pipelineDistribution: Array<{ status: keyof typeof statusLabels; count: number; value: number }>;
  stageConversion: Array<{ status: keyof typeof statusLabels; entrants: number; won: number; rate: number }>;
  topCities: Array<{ city: string; count: number }>;
  modalitiesPerformance: Array<{ modality: string; count: number; won: number; rate: number }>;
  lossReasons: Array<{ reason: string; count: number }>;
  monthly: Array<{ month: string; leads: number; won: number; proposals: number }>;
}

const palette = ['#38bdf8', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#84cc16', '#ef4444', '#14b8a6', '#f97316'];

export default function CaptacaoDashboardPage() {
  const [data, setData] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leads/metrics')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || 'Falha ao carregar dashboard');
        return payload.data;
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Growth Engine</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Lead Acquisition & Sales Intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
            Captação, qualificação, proposta e conversão de academias dentro do mesmo Super Admin.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/super-admin/captacao/leads" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)]">
            Abrir CRM
          </Link>
          <Link href="/super-admin/captacao/pipeline" className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white">
            Ver Pipeline
          </Link>
        </div>
      </div>

      <CaptacaoTabs />

      {error ? (
        <SectionCard title="Falha ao carregar" subtitle={error}>
          <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </SectionCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Leads" value={loading ? '...' : String(data?.summary.totalLeads ?? 0)} helper="Base completa de academias prospectadas" />
        <StatCard label="Conversão" value={loading ? '...' : `${data?.summary.conversionRate ?? 0}%`} helper="Leads ganhos / base total" />
        <StatCard label="Ticket Médio" value={loading ? '...' : currency(data?.summary.avgDealSize)} helper="Valor médio dos contratos ganhos" />
        <StatCard label="Receita Potencial" value={loading ? '...' : currency(data?.summary.revenuePotential)} helper="Somatório das oportunidades abertas" />
        <StatCard label="Pipeline Value" value={loading ? '...' : currency(data?.summary.pipelineValue)} helper="Valor ativo antes de ganho/perda" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <SectionCard title="Pipeline Distribution" subtitle="Volume e valor por etapa comercial">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.pipelineDistribution ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="status" tickFormatter={(value) => statusLabels[value as keyof typeof statusLabels]} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(data?.pipelineDistribution ?? []).map((item, index) => <Cell key={item.status} fill={palette[index % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Conversão por Etapa" subtitle="Eficiência do pipeline até ganho">
          <div className="space-y-3">
            {(data?.stageConversion ?? []).map((stage) => (
              <div key={stage.status} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--text-primary)]">{statusLabels[stage.status]}</p>
                  <p className="text-sm text-emerald-300">{stage.rate}%</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${stage.rate}%` }} />
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{stage.won} ganhos de {stage.entrants} leads que passaram por esta etapa</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Evolução Mensal" subtitle="Leads, propostas e ganhos">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#38bdf8" strokeWidth={3} />
                <Line type="monotone" dataKey="proposals" stroke="#f59e0b" strokeWidth={3} />
                <Line type="monotone" dataKey="won" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top Cities" subtitle="Onde o crescimento está mais concentrado">
          <div className="space-y-3">
            {!loading && !(data?.topCities?.length) ? <p className="text-sm text-[var(--text-secondary)]">Nenhuma cidade mapeada ainda.</p> : null}
            {(data?.topCities ?? []).map((city) => (
              <div key={city.city} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <MapPinned className="h-4 w-4 text-sky-300" />
                  <span className="text-sm text-[var(--text-primary)]">{city.city}</span>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">{city.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Loss Reasons" subtitle="Causas estruturadas de perda">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.lossReasons ?? []} dataKey="count" nameKey="reason" innerRadius={55} outerRadius={90}>
                  {(data?.lossReasons ?? []).map((entry, index) => <Cell key={entry.reason} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="Modalidades com melhor desempenho" subtitle="Pipeline e ganho por nicho">
          <div className="space-y-3">
            {!loading && !(data?.modalitiesPerformance?.length) ? <p className="text-sm text-[var(--text-secondary)]">Sem modalidades suficientes para análise.</p> : null}
            {(data?.modalitiesPerformance ?? []).slice(0, 8).map((row) => (
              <div key={row.modality} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--text-primary)]">{row.modality}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{row.count} leads</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${row.rate}%` }} />
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{row.won} ganhos • {row.rate}% de taxa de vitória</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ações" subtitle="Operações rápidas do time comercial">
          <div className="space-y-3">
            {[
              { label: 'Abrir CRM de leads', href: '/super-admin/captacao/leads', icon: Target },
              { label: 'Gerenciar kanban comercial', href: '/super-admin/captacao/pipeline', icon: Workflow },
              { label: 'Revisar automações', href: '/super-admin/captacao/automations', icon: Sparkles },
              { label: 'Configurar scoring e proposta', href: '/super-admin/captacao/config', icon: DollarSign },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-amber-300" />
                  <span className="text-sm text-[var(--text-primary)]">{item.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
