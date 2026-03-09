'use client';

import { CaptacaoTabs, SectionCard } from '@/components/super-admin/captacao/ui';

export default function CaptacaoConfigPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Config</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Motor de scoring e playbook comercial</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Referência operacional para o time de vendas e futuras automações inteligentes.</p>
      </div>

      <CaptacaoTabs />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Scoring 0-100" subtitle="Pesos atualmente implementados">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>Students: até 30 pontos.</p>
            <p>Estimated revenue: até 25 pontos.</p>
            <p>Modalities mix: até 15 pontos, com bônus para BJJ, Muay Thai, MMA e Boxe.</p>
            <p>City size / state proxy: até 15 pontos.</p>
            <p>Data completeness: até 15 pontos.</p>
          </div>
        </SectionCard>

        <SectionCard title="Categorias" subtitle="Classificação operacional para vendas">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>Hot: score 75-100. Prioridade máxima para outreach e reunião.</p>
            <p>Warm: score 45-74. Trabalhar enriquecimento e proposta consultiva.</p>
            <p>Cold: score 0-44. Nutrição, automação e requalificação.</p>
          </div>
        </SectionCard>

        <SectionCard title="Loss reasons" subtitle="Padronização para analytics de conversão">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>PRICE_TOO_HIGH</p>
            <p>NO_RESPONSE</p>
            <p>SMALL_ACADEMY</p>
            <p>USING_COMPETITOR</p>
            <p>NOT_INTERESTED</p>
            <p>DELAYED</p>
          </div>
        </SectionCard>

        <SectionCard title="Proposal playbook" subtitle="Fluxo comercial recomendado">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>1. Ajustar `suggested_price` conforme score e porte.</p>
            <p>2. Gerar proposta versionada em `lead_proposals`.</p>
            <p>3. Enviar PDF pelo endpoint `/api/leads/proposal`.</p>
            <p>4. Aceite atualiza pipeline para `WON`; rejeição mantém rastreabilidade.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
