'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEAD_PIPELINE_STATUSES, type LeadPipelineStatus } from '@/lib/leads/types';

function cn(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ');
}

export const statusLabels: Record<LeadPipelineStatus, string> = {
  NEW: 'Novo',
  ENRICHING: 'Enriquecendo',
  QUALIFIED: 'Qualificado',
  OUTREACH_STARTED: 'Contato',
  MEETING_SCHEDULED: 'Reunião',
  PROPOSAL_SENT: 'Proposta',
  NEGOTIATING: 'Negociação',
  WON: 'Ganho',
  LOST: 'Perdido',
};

export const statusColors: Record<LeadPipelineStatus, string> = {
  NEW: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  ENRICHING: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  QUALIFIED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  OUTREACH_STARTED: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  MEETING_SCHEDULED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PROPOSAL_SENT: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  NEGOTIATING: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  WON: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  LOST: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export function getScoreTone(score: number) {
  if (score >= 75) return 'text-emerald-300';
  if (score >= 45) return 'text-amber-300';
  return 'text-rose-300';
}

export function currency(value?: number | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function dateTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

export function dateOnly(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function StageBadge({ status }: { status: LeadPipelineStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', statusColors[status])}>
      {statusLabels[status]}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full',
            score >= 75 ? 'bg-emerald-400' : score >= 45 ? 'bg-amber-400' : 'bg-rose-400',
          )}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={cn('text-sm font-semibold', getScoreTone(score))}>{score}</span>
    </div>
  );
}

export function CaptacaoTabs() {
  const pathname = usePathname();
  const items = [
    { href: '/super-admin/captacao/dashboard', label: 'Dashboard' },
    { href: '/super-admin/captacao/leads', label: 'Leads' },
    { href: '/super-admin/captacao/pipeline', label: 'Pipeline' },
    { href: '/super-admin/captacao/automations', label: 'Automations' },
    { href: '/super-admin/captacao/config', label: 'Config' },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition',
              active
                ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                : 'border-white/10 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('premium-card rounded-2xl border border-white/10 p-5', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      {helper ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{helper}</p> : null}
    </div>
  );
}

export { LEAD_PIPELINE_STATUSES };
