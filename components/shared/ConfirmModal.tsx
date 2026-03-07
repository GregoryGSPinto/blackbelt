// ============================================================
// ConfirmModal — Reusable Confirmation Dialog
// ============================================================
// Used before destructive/critical actions:
//   - Excluir conta, cancelar plano, remover aluno, etc.
//
// Usage:
//   <ConfirmModal
//     open={showConfirm}
//     title="Excluir conta"
//     message="Esta ação não pode ser desfeita."
//     confirmLabel="Sim, excluir"
//     variant="danger"
//     onConfirm={handleDelete}
//     onCancel={() => setShowConfirm(false)}
//   />
// ============================================================
'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Variant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  /** Requires typing a word to confirm (e.g. "EXCLUIR") */
  requireTyping?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG: Record<Variant, {
  icon: typeof AlertTriangle;
  iconColor: string;
  iconBg: string;
}> = {
  danger: {
    icon: Trash2,
    iconColor: '#F87171',
    iconBg: 'rgba(248,113,113,0.1)',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#FBBF24',
    iconBg: 'rgba(251,191,36,0.1)',
  },
  info: {
    icon: Info,
    iconColor: '#60A5FA',
    iconBg: 'rgba(96,165,250,0.1)',
  },
  success: {
    icon: CheckCircle,
    iconColor: '#4ADE80',
    iconBg: 'rgba(74,222,128,0.1)',
  },
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
  requireTyping,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const t = useTranslations('common.confirm');
  const tActions = useTranslations('common.actions');
  const inputRef = useRef<HTMLInputElement>(null);
  const typingMatch = useRef(false);
  const effectiveConfirmLabel = confirmLabel || tActions('confirm');
  const effectiveCancelLabel = cancelLabel || tActions('cancel');

  // ESC close
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onCancel]);

  // Focus input when typing required
  useEffect(() => {
    if (open && requireTyping) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, requireTyping]);

  if (!open) return null;

  const cfg = VARIANT_CONFIG[variant];
  const Icon = cfg.icon;

  const handleConfirm = () => {
    if (requireTyping && !typingMatch.current) return;
    if (loading) return;
    onConfirm();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40"
        onClick={onCancel}
        style={{ animation: 'confirm-fade-in 150ms ease-out' }}
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div
          className="w-full max-w-sm rounded-xl p-4 sm:p-6 relative"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid black',
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            animation: 'confirm-scale-in 200ms cubic-bezier(0.16,1,0.3,1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close X */}
          <button
            onClick={onCancel}
            aria-label={effectiveCancelLabel}
            className="absolute top-3 right-3 p-1.5 transition-colors rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: cfg.iconBg }}
          >
            <Icon size={22} style={{ color: cfg.iconColor }} />
          </div>

          {/* Title */}
          <h3 id="confirm-title" className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>

          {/* Message */}
          <div id="confirm-message" className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </div>

          {/* Typing confirmation */}
          {requireTyping && (
            <div className="mb-4">
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                {t('typeToConfirm', { text: requireTyping })}
              </p>
              <input
                ref={inputRef}
                type="text"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                style={{ color: 'var(--text-primary)', background: 'var(--card-bg)', border: '1px solid black' }}
                placeholder={requireTyping}
                onChange={e => {
                  typingMatch.current = e.target.value === requireTyping;
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}
            >
              {effectiveCancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (!!requireTyping && !typingMatch.current)}
              className="flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}
            >
              {loading ? tActions('processing') : effectiveConfirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confirm-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes confirm-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </>
  );
}
