// ============================================================
// ProactiveAlert — Dismissable alert banners with actions
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import type { AlertaInteligente, AlertaCategoria } from '@/lib/api/alertas-inteligentes.service';
import { dismissAlert } from '@/lib/api/alertas-inteligentes.service';

// ── Color mapping ──

const CATEGORY_STYLES: Record<AlertaCategoria, { bg: string; border: string; accent: string }> = {
  warning: {
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.12)',
    accent: '#FBBF24',
  },
  info: {
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.12)',
    accent: '#60A5FA',
  },
  success: {
    bg: 'rgba(74,222,128,0.06)',
    border: 'rgba(74,222,128,0.12)',
    accent: '#4ADE80',
  },
  celebration: {
    bg: 'rgba(168,85,247,0.06)',
    border: 'rgba(168,85,247,0.12)',
    accent: '#A855F7',
  },
};

// ── Single alert card ──

interface AlertCardProps {
  alerta: AlertaInteligente;
  onDismiss: (id: string) => void;
  index: number;
}

function AlertCard({ alerta, onDismiss, index }: AlertCardProps) {
  const t = useTranslations('common.actions');
  const router = useRouter();
  const style = CATEGORY_STYLES[alerta.categoria];

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl p-3.5 transition-all duration-300 group"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        animation: `anim-fade-in 300ms ease ${index * 80}ms both`,
      }}
    >
      {/* Emoji */}
      <span className="text-lg flex-shrink-0 mt-0.5">{alerta.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm font-semibold leading-snug">{alerta.titulo}</p>
        <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{alerta.descricao}</p>

        {alerta.acaoLabel && (
          <button
            onClick={() => alerta.acaoHref && router.push(alerta.acaoHref)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: style.accent }}
          >
            {alerta.acaoLabel}
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(alerta.id)}
        className="flex-shrink-0 p-1 rounded-lg text-white/15 hover:text-white/40 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
        aria-label={t('close')}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Alert list ──

interface ProactiveAlertListProps {
  alertas: AlertaInteligente[];
  /** Max alerts to show (default: 5) */
  maxVisible?: number;
  className?: string;
}

export function ProactiveAlertList({
  alertas,
  maxVisible = 5,
  className = '',
}: ProactiveAlertListProps) {
  const tAlerts = useTranslations('admin.alerts');
  const tStatus = useTranslations('common.status');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((id: string) => {
    dismissAlert(id);
    setDismissed(prev => new Set([...Array.from(prev), id]));
  }, []);

  const visible = alertas
    .filter(a => !dismissed.has(a.id) && !a.dispensado)
    .slice(0, maxVisible);

  if (visible.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/70">{tAlerts('title')}</h3>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
            style={{ background: 'rgba(251,191,36,0.2)', color: '#FBBF24' }}
          >
            {visible.length}
          </span>
        </div>
        {visible.length > 3 && (
          <span className="text-[10px] text-white/25 tracking-wider uppercase">
            {visible.length} {tStatus('active')}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((alerta, i) => (
          <AlertCard key={alerta.id} alerta={alerta} onDismiss={handleDismiss} index={i} />
        ))}
      </div>
    </section>
  );
}
