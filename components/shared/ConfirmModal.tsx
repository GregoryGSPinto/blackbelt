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
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

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
  btnBg: string;
  btnHover: string;
  btnText: string;
}> = {
  danger: {
    icon: Trash2,
    iconColor: '#F87171',
    iconBg: 'rgba(248,113,113,0.1)',
    btnBg: 'rgba(239,68,68,0.9)',
    btnHover: 'rgba(239,68,68,1)',
    btnText: '#FFF',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#FBBF24',
    iconBg: 'rgba(251,191,36,0.1)',
    btnBg: 'rgba(245,158,11,0.9)',
    btnHover: 'rgba(245,158,11,1)',
    btnText: '#FFF',
  },
  info: {
    icon: Info,
    iconColor: '#60A5FA',
    iconBg: 'rgba(96,165,250,0.1)',
    btnBg: 'rgba(59,130,246,0.9)',
    btnHover: 'rgba(59,130,246,1)',
    btnText: '#FFF',
  },
  success: {
    icon: CheckCircle,
    iconColor: '#4ADE80',
    iconBg: 'rgba(74,222,128,0.1)',
    btnBg: 'rgba(34,197,94,0.9)',
    btnHover: 'rgba(34,197,94,1)',
    btnText: '#FFF',
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
  const { isDark } = useTheme();
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
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
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
          className="w-full max-w-sm rounded-2xl p-4 sm:p-6 relative"
          style={{
            background: isDark ? 'rgba(20, 20, 28, 0.97)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 24px 80px rgba(0,0,0,0.15)',
            animation: 'confirm-scale-in 200ms cubic-bezier(0.16,1,0.3,1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close X */}
          <button
            onClick={onCancel}
            aria-label={effectiveCancelLabel}
            className={`absolute top-3 right-3 p-1.5 transition-colors rounded-lg ${isDark ? 'text-white/20 hover:text-white/50' : 'text-slate-300 hover:text-slate-500'}`}
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
          <h3 id="confirm-title" className={`text-lg font-bold mb-2 ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
            {title}
          </h3>

          {/* Message */}
          <div id="confirm-message" className={`text-sm mb-5 leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {message}
          </div>

          {/* Typing confirmation */}
          {requireTyping && (
            <div className="mb-4">
              <p className={`text-xs mb-2 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                {t('typeToConfirm', { text: requireTyping })}
              </p>
              <input
                ref={inputRef}
                type="text"
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${isDark ? 'text-white bg-white/5 border border-white/10 focus:border-red-500/30' : 'text-slate-900 bg-slate-50 border border-slate-200 focus:border-red-400'}`}
                placeholder={requireTyping}
                onChange={e => {
                  typingMatch.current = e.target.value === requireTyping;
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={onCancel}
              disabled={loading}
              fullWidth
              className="min-h-[44px]"
            >
              {effectiveCancelLabel}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="md"
              onClick={handleConfirm}
              disabled={loading || (!!requireTyping && !typingMatch.current)}
              loading={loading}
              loadingText={tActions('processing')}
              fullWidth
              className="min-h-[44px]"
              style={{
                background: variant !== 'danger' ? cfg.btnBg : undefined,
                color: variant !== 'danger' ? cfg.btnText : undefined,
              }}
            >
              {effectiveConfirmLabel}
            </Button>
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
