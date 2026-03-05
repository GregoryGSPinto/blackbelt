// ============================================================
// AutoSaveIndicator — Subtle save status indicator
// RestoreDialog — Recovery prompt for saved drafts
// ============================================================
'use client';

import { useTranslations } from 'next-intl';
import { Save, Check, Loader2 } from 'lucide-react';
import type { AutoSaveStatus } from '@/hooks/useAutoSave';

// ── AutoSaveIndicator ──

interface IndicatorProps {
  status: AutoSaveStatus;
  lastSaved: string | null;
  className?: string;
}

function formatSavedTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function AutoSaveIndicator({ status, lastSaved, className = '' }: IndicatorProps) {
  const t = useTranslations('common.actions');
  if (status === 'idle' && !lastSaved) return null;

  return (
    <div aria-live="polite" className={`flex items-center gap-1.5 text-[10px] ${className}`}>
      {status === 'saving' ? (
        <>
          <Loader2 size={10} className="text-white/25 animate-spin" />
          <span className="text-white/25">{t('saving')}</span>
        </>
      ) : status === 'saved' ? (
        <>
          <Check size={10} className="text-emerald-400/50" />
          <span className="text-emerald-400/50">{t('saveDraft')}</span>
        </>
      ) : lastSaved ? (
        <>
          <Save size={10} className="text-white/15" />
          <span className="text-white/15">{t('saved')} {formatSavedTime(lastSaved)}</span>
        </>
      ) : null}
    </div>
  );
}

// ── RestoreDialog ──

interface RestoreDialogProps {
  show: boolean;
  timestamp: string | null;
  onRestore: () => void;
  onDiscard: () => void;
}

export function RestoreDialog({ show, timestamp, onRestore, onDiscard }: RestoreDialogProps) {
  const t = useTranslations('common.actions');
  if (!show) return null;

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{
        background: 'rgba(96,165,250,0.08)',
        border: '1px solid rgba(96,165,250,0.15)',
        animation: 'anim-fade-in 300ms ease both',
      }}
    >
      <p className="text-white/70 text-sm mb-1">
        {t('saveDraft')}{timeStr && <> — <strong className="text-white/90">{timeStr}</strong></>}
      </p>
      <p className="text-white/30 text-xs mb-3">{t('confirm')}?</p>
      <div className="flex gap-2">
        <button
          onClick={onRestore}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'rgba(96,165,250,0.2)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)' }}
        >
          {t('confirm')}
        </button>
        <button
          onClick={onDiscard}
          className="px-4 py-2 rounded-lg text-xs font-medium text-white/30 hover:text-white/50 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {t('delete')}
        </button>
      </div>
    </div>
  );
}
