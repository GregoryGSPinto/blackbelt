'use client';

import { useEffect, useState } from 'react';
import { CaptacaoTabs, SectionCard } from '@/components/super-admin/captacao/ui';

export default function CaptacaoAutomationsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leads/metrics')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || 'Falha ao carregar automations');
        return payload.data;
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar automations'));
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Automations</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Sales automations readiness</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Base preparada para AI assistant, descoberta automática e cadências comerciais.</p>
      </div>

      <CaptacaoTabs />

      {error ? (
        <SectionCard title="Falha ao carregar" subtitle={error}>
          <p className="text-sm text-[var(--text-secondary)]">A arquitetura segue disponível, mas as métricas não carregaram.</p>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Cadências sugeridas" subtitle="Próximas automações do growth engine">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>NEW → ENRICHING: enriquecimento automático de website, Instagram e porte.</p>
            <p>QUALIFIED → OUTREACH_STARTED: geração de e-mail/WhatsApp com argumento por modalidade.</p>
            <p>PROPOSAL_SENT → NEGOTIATING: lembretes e follow-up após 3 e 7 dias.</p>
          </div>
        </SectionCard>

        <SectionCard title="Sinais de prioridade" subtitle="Leads que merecem automação primeiro">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>{data?.summary?.totalLeads ?? 0} leads disponíveis para ranking automatizado.</p>
            <p>{data?.pipelineDistribution?.find((item: any) => item.status === 'QUALIFIED')?.count ?? 0} leads qualificados prontos para cadência.</p>
            <p>{data?.lossReasons?.[0]?.reason ?? 'Sem perdas ainda'} é hoje a principal objeção conhecida.</p>
          </div>
        </SectionCard>

        <SectionCard title="AI-ready architecture" subtitle="Extensões futuras previstas">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>`lead_score_history` já suporta explicabilidade para priorização automática.</p>
            <p>`lead_status_history` e `lead_interactions` já dão contexto para copiloto comercial.</p>
            <p>`lead_proposals` suporta geração automática de proposta e tracking de aceite.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
