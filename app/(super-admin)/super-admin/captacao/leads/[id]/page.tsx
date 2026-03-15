'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { CaptacaoTabs, LEAD_PIPELINE_STATUSES, ScoreBadge, SectionCard, StageBadge, currency, dateOnly, dateTime, statusLabels } from '@/components/super-admin/captacao/ui';

export default function LeadDetailPage() {
  const t = useTranslations('common');
  const tc = useTranslations('common.actions');
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [proposalValue, setProposalValue] = useState('');

  const load = async () => {
    setError(null);
    const response = await fetch(`/api/leads/${params.id}`);
    const api = await response.json();
    if (!response.ok) {
      setError(api?.error?.message || 'Falha ao carregar lead');
      return;
    }
    setPayload(api.data);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const lead = payload?.lead;

  const updateLead = async (patch: Record<string, unknown>, success: string) => {
    const response = await fetch(`/api/leads/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      toast.error('Falha ao atualizar lead');
      return;
    }
    toast.success(success);
    await load();
  };

  if (!lead) {
    return <div className="p-8 text-sm text-[var(--text-secondary)]">{error || t('loading.lead')}</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/super-admin/captacao/leads" className="text-sm text-amber-300">Voltar para leads</Link>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{lead.academy_name}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Lead criado em {dateOnly(lead.created_at)} • responsável {lead.responsible_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={lead.score ?? 0} />
          <StageBadge status={lead.status} />
        </div>
      </div>

      <CaptacaoTabs />

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <SectionCard title="Academia & Contatos" subtitle="Perfil comercial e dados do negócio">
            <div className="grid gap-4 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Email</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.email || '-'}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Telefone</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.phone || '-'}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Cidade</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.city}, {lead.state}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Origem</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.lead_source || '-'}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Website</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.website || '-'}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Instagram</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.instagram || '-'}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Alunos</p><p className="mt-1 text-sm text-[var(--text-primary)]">{lead.current_students ?? 0}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Faturamento</p><p className="mt-1 text-sm text-[var(--text-primary)]">{currency(lead.monthly_revenue)}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(lead.modalities ?? []).map((item: string) => (
                <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--text-primary)]">{item}</span>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Notas estratégicas</p>
              <p className="mt-2 text-sm text-[var(--text-primary)]">{lead.notes || 'Sem notas ainda.'}</p>
            </div>
          </SectionCard>

          <SectionCard title="Histórico de Interações" subtitle="Timeline consolidada de comunicação e mudanças">
            <div className="space-y-4">
              {(payload?.interactions ?? []).map((interaction: any) => (
                <div key={interaction.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{interaction.type}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{dateTime(interaction.created_at)}</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{interaction.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="Adicionar nota comercial" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white" onClick={() => updateLead({ new_note: note }, 'Nota registrada')}>
                {tc('saveNote')}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Histórico de Pipeline" subtitle="Rastreabilidade completa das transições">
            <div className="space-y-3">
              {(payload?.statusHistory ?? []).map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      {entry.from_status ? statusLabels[entry.from_status as keyof typeof statusLabels] : 'Início'} → {statusLabels[entry.to_status as keyof typeof statusLabels]}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">{entry.reason || 'Sem razão registrada'}</p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{dateTime(entry.changed_at)}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Controle Comercial" subtitle="Pipeline, pricing e conversão">
            <div className="space-y-3">
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" value={lead.status} onChange={(e) => updateLead({ status: e.target.value }, 'Pipeline atualizado')}>
                {LEAD_PIPELINE_STATUSES.map((status) => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Suggested</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{currency(lead.suggested_price)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Closed</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{currency(lead.closed_price)}</p>
                </div>
              </div>
              <button className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white" onClick={() => updateLead({ status: 'WON' }, 'Lead marcado como ganho')}>
                Converter em Academia
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Tasks" subtitle="Próximas ações do vendedor">
            <div className="space-y-3">
              {(payload?.tasks ?? []).map((task: any) => (
                <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{task.title}</p>
                    <span className="text-xs text-[var(--text-secondary)]">{task.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Prazo {dateTime(task.due_at)}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="Nova tarefa" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                <button className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-300" onClick={async () => {
                  const response = await fetch('/api/leads/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_id: lead.id, title: taskTitle, due_at: new Date(Date.now() + 86400000).toISOString() }),
                  });
                  if (response.ok) {
                    toast.success('Tarefa criada');
                    setTaskTitle('');
                    await load();
                  } else {
                    toast.error('Falha ao criar tarefa');
                  }
                }}>Criar</button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Propostas" subtitle="Gestão comercial, PDF e aceite">
            <div className="space-y-3">
              {(payload?.proposals ?? []).map((proposal: any) => (
                <div key={proposal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{currency(proposal.proposal_value)}</p>
                    <span className="text-xs text-[var(--text-secondary)]">{proposal.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">Criada em {dateOnly(proposal.created_at)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {proposal.pdf_url ? <a href={proposal.pdf_url} target="_blank" className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-[var(--text-primary)]">PDF</a> : null}
                    <button className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300" onClick={async () => {
                      const response = await fetch('/api/leads/proposal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'send', proposal_id: proposal.id, lead_id: lead.id, proposal_value: proposal.proposal_value, currency: proposal.currency }),
                      });
                      if (response.ok) {
                        toast.success('Proposta enviada');
                        await load();
                      } else {
                        toast.error('Falha ao enviar proposta');
                      }
                    }}>Enviar</button>
                    <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300" onClick={async () => {
                      const response = await fetch('/api/leads/proposal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'accept', proposal_id: proposal.id, lead_id: lead.id, proposal_value: proposal.proposal_value, currency: proposal.currency }),
                      });
                      if (response.ok) {
                        toast.success('Proposta aceita');
                        await load();
                      } else {
                        toast.error('Falha ao aceitar proposta');
                      }
                    }}>Aceitar</button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)]" placeholder="Valor da nova proposta" value={proposalValue} onChange={(e) => setProposalValue(e.target.value)} />
                <button className="rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white" onClick={async () => {
                  const response = await fetch('/api/leads/proposal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_id: lead.id, proposal_value: Number(proposalValue), currency: 'BRL', status: 'DRAFT', action: 'create' }),
                  });
                  if (response.ok) {
                    toast.success('Proposta criada');
                    setProposalValue('');
                    await load();
                  } else {
                    toast.error('Falha ao criar proposta');
                  }
                }}>Nova proposta</button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
