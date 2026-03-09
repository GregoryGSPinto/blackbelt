'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { CaptacaoTabs, LEAD_PIPELINE_STATUSES, ScoreBadge, SectionCard, StageBadge, currency } from '@/components/super-admin/captacao/ui';

export default function CaptacaoPipelinePage() {
  const toast = useToast();
  const [columns, setColumns] = useState<Array<{ status: any; leads: any[] }>>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const response = await fetch('/api/leads/pipeline');
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Falha ao carregar pipeline');
      return;
    }
    setColumns(payload.data.columns ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const moveLead = async (leadId: string, toStatus: string) => {
    const response = await fetch('/api/leads/pipeline', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, toStatus }),
    });
    if (!response.ok) {
      toast.error('Falha ao mover lead no pipeline');
      return;
    }
    toast.success('Pipeline atualizado');
    await load();
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Sales Pipeline</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Kanban comercial</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Arraste cards entre etapas para registrar avanço real de oportunidade.</p>
      </div>

      <CaptacaoTabs />

      {error ? <SectionCard title="Falha ao carregar pipeline" subtitle={error}><p className="text-sm text-[var(--text-secondary)]">Verifique autenticação e dados do módulo.</p></SectionCard> : null}

      <SectionCard title="Pipeline B2B" subtitle="NEW → WON/LOST com histórico completo">
        <div className="grid gap-4 xl:grid-cols-9">
          {LEAD_PIPELINE_STATUSES.map((status) => {
            const column = columns.find((item) => item.status === status) ?? { status, leads: [] };
            const totalValue = column.leads.reduce((sum, lead) => sum + Number(lead.proposed_price ?? lead.suggested_price ?? 0), 0);
            return (
              <div
                key={status}
                className="min-h-[24rem] rounded-2xl border border-white/10 bg-white/5 p-3"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const leadId = event.dataTransfer.getData('text/plain');
                  if (leadId) moveLead(leadId, status);
                }}
              >
                <div className="mb-3 space-y-1">
                  <StageBadge status={status} />
                  <p className="text-xs text-[var(--text-secondary)]">{column.leads.length} leads</p>
                  <p className="text-xs text-[var(--text-secondary)]">{currency(totalValue)}</p>
                </div>
                <div className="space-y-3">
                  {!column.leads.length ? <div className="rounded-2xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-[var(--text-secondary)]">Sem leads</div> : null}
                  {column.leads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', lead.id)}
                      className="cursor-grab rounded-2xl border border-white/10 bg-slate-950/40 p-3 active:cursor-grabbing"
                    >
                      <p className="text-sm font-medium text-[var(--text-primary)]">{lead.academy_name}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{lead.city}, {lead.state}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <ScoreBadge score={lead.score ?? 0} />
                        <span className="text-xs text-[var(--text-secondary)]">{currency(lead.proposed_price ?? lead.suggested_price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
