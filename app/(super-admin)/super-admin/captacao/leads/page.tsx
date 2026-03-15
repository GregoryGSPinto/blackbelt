'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { CaptacaoTabs, ScoreBadge, SectionCard, StageBadge, currency, dateOnly } from '@/components/super-admin/captacao/ui';

interface LeadListPayload {
  leads: any[];
  count: number;
  summary: {
    hot: number;
    warm: number;
    cold: number;
    won: number;
    revenuePotential: number;
  };
}

const initialFilters = {
  search: '',
  status: 'ALL',
  city: '',
  modality: '',
  source: '',
  scoreCategory: '',
};

export default function LeadsPage() {
  const t = useTranslations('common');
  const { user } = useAuth() as any;
  const toast = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState<LeadListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('limit', '100');
    return params.toString();
  }, [filters]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/leads?${query}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Falha ao carregar leads');
      setData(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  const updateLead = async (leadId: string, patch: Record<string, unknown>, message: string) => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      toast.error('Falha ao atualizar lead');
      return;
    }
    toast.success(message);
    await load();
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Lead CRM</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Leads & Oportunidades</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Filtre, atribua, avance pipeline, dispare propostas e acompanhe a base comercial.</p>
      </div>

      <CaptacaoTabs />

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Base" className="md:col-span-1" subtitle="Resumo rápido">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total</span><strong className="text-[var(--text-primary)]">{data?.count ?? 0}</strong></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Hot</span><strong className="text-emerald-300">{data?.summary.hot ?? 0}</strong></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Warm</span><strong className="text-amber-300">{data?.summary.warm ?? 0}</strong></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Cold</span><strong className="text-rose-300">{data?.summary.cold ?? 0}</strong></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Potencial</span><strong className="text-[var(--text-primary)]">{currency(data?.summary.revenuePotential)}</strong></div>
          </div>
        </SectionCard>

        <SectionCard title="Filtros" className="md:col-span-3" subtitle="Busca e segmentação do CRM">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder={t('actions.search')} value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
            <select className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="ALL">Todas etapas</option>
              <option value="NEW">NEW</option>
              <option value="ENRICHING">ENRICHING</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="OUTREACH_STARTED">OUTREACH_STARTED</option>
              <option value="MEETING_SCHEDULED">MEETING_SCHEDULED</option>
              <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
              <option value="NEGOTIATING">NEGOTIATING</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
            <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="Cidade" value={filters.city} onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))} />
            <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="Modalidade" value={filters.modality} onChange={(e) => setFilters((prev) => ({ ...prev, modality: e.target.value }))} />
            <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="Origem" value={filters.source} onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))} />
            <select className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" value={filters.scoreCategory} onChange={(e) => setFilters((prev) => ({ ...prev, scoreCategory: e.target.value }))}>
              <option value="">Hot/Warm/Cold</option>
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Lista de Leads" subtitle={loading ? t('loading.pipeline') : `${data?.count ?? 0} registros no CRM`}>
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                <th className="pb-3">Academia</th>
                <th className="pb-3">Local</th>
                <th className="pb-3">Modalidades</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Pipeline</th>
                <th className="pb-3">Pricing</th>
                <th className="pb-3">Último toque</th>
                <th className="pb-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !(data?.leads?.length) ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    {t('empty.noLeadsFiltered')}
                  </td>
                </tr>
              ) : null}
              {(data?.leads ?? []).map((lead) => (
                <tr key={lead.id} className="border-b border-white/5">
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{lead.academy_name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{lead.responsible_name} • {lead.email}</p>
                    </div>
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">{lead.city}, {lead.state}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {(lead.modalities ?? []).slice(0, 3).map((item: string) => (
                        <span key={item} className="rounded-full bg-white/10 px-2 py-1 text-xs text-[var(--text-primary)]">{item}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4"><ScoreBadge score={lead.score ?? 0} /></td>
                  <td className="py-4"><StageBadge status={lead.status} /></td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    <div>{currency(lead.proposed_price ?? lead.suggested_price)}</div>
                    <div className="text-xs">Alunos: {lead.current_students ?? 0}</div>
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">{dateOnly(lead.last_contact_at ?? lead.updated_at)}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-[var(--text-primary)]" onClick={() => updateLead(lead.id, { assigned_to: user?.id ?? null }, 'Lead atribuído a você')}>
                        Atribuir
                      </button>
                      <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300" onClick={() => updateLead(lead.id, { status: 'WON' }, 'Lead convertido para ganho')}>
                        Converter
                      </button>
                      <button className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300" onClick={() => updateLead(lead.id, { status: 'PROPOSAL_SENT' }, 'Lead movido para proposta')}>
                        Proposta
                      </button>
                      <button className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs text-sky-300" onClick={async () => {
                        const response = await fetch('/api/leads/tasks', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ lead_id: lead.id, title: 'Follow-up comercial', due_at: new Date(Date.now() + 86400000).toISOString() }),
                        });
                        if (response.ok) {
                          toast.success('Tarefa agendada');
                          await load();
                        } else {
                          toast.error('Falha ao agendar tarefa');
                        }
                      }}>
                        Tarefa
                      </button>
                      <Link href={`/super-admin/captacao/leads/${lead.id}`} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900">
                        Abrir
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
