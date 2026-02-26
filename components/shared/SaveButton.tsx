// ============================================================
// SaveButton — Reusable save button with loading/success states
// ============================================================
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => Promise<void>;
  label?: string;
  loadingLabel?: string;
  successLabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'subtle';
  className?: string;
  fullWidth?: boolean;
}

const VARIANTS = {
  primary: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg',
  secondary: 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/10',
  subtle: 'bg-white/5 hover:bg-white/10 text-white/60',
};

type BtnState = 'idle' | 'loading' | 'success';

export function SaveButton({
  onSave,
  label = 'Salvar',
  loadingLabel = 'Salvando...',
  successLabel = 'Salvo!',
  disabled = false,
  variant = 'primary',
  className = '',
  fullWidth = true,
}: SaveButtonProps) {
  const [state, setState] = useState<BtnState>('idle');

  useEffect(() => {
    if (state === 'success') {
      const t = setTimeout(() => setState('idle'), 1500);
      return () => clearTimeout(t);
    }
  }, [state]);

  const handleClick = useCallback(async () => {
    if (state !== 'idle') return;
    setState('loading');
    try {
      await onSave();
      setState('success');
    } catch {
      setState('idle');
    }
  }, [onSave, state]);

  const icon = state === 'loading'
    ? <Loader2 size={16} className="animate-spin" />
    : state === 'success'
      ? <Check size={16} />
      : <Save size={16} />;

  const text = state === 'loading' ? loadingLabel : state === 'success' ? successLabel : label;

  const successStyles = state === 'success'
    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
    : VARIANTS[variant];

  return (
    <button
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${fullWidth ? 'w-full' : 'px-6'}
                  ${successStyles}
                  ${className}`}
      aria-label={text}
      aria-busy={state === 'loading'}
    >
      {icon}
      {text}
    </button>
  );
}
