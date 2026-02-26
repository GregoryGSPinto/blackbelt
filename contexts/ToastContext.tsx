// ============================================================
// ToastContext — Global toast notification system
// ============================================================
// Usage:
//   const { success, error, info, warning } = useToast();
//   success('Check-in confirmado!');
//   error('Falha ao salvar');
// ============================================================
'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ── Types ──

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);

// ── Constants ──

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 3000;

const TOAST_CONFIG: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string; text: string }> = {
  success: {
    icon: CheckCircle,
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.3)',
    text: '#4ADE80',
  },
  error: {
    icon: XCircle,
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.3)',
    text: '#F87171',
  },
  info: {
    icon: Info,
    bg: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.3)',
    text: '#60A5FA',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'rgba(251,191,36,0.15)',
    border: 'rgba(251,191,36,0.3)',
    text: '#FBBF24',
  },
};

// ── Styles ──

const TOAST_STYLES = `
  @keyframes toast-slide-in {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes toast-slide-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-8px) scale(0.95); }
  }
  .toast-enter { animation: toast-slide-in 0.3s ease both; }
  .toast-exit  { animation: toast-slide-out 0.25s ease both; }
`;

// ── Toast Item Component ──

function ToastItemView({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  return (
    <div
      className="toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-[90vw] sm:max-w-sm"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(24px) saturate(1.3)',
      }}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} style={{ color: config.text, flexShrink: 0 }} />
      <p className="text-sm font-medium flex-1" style={{ color: config.text }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg transition-colors hover:bg-white/10"
        aria-label="Fechar notificação"
      >
        <X size={14} style={{ color: config.text, opacity: 0.6 }} />
      </button>
    </div>
  );
}

// ── Toast Container ──

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{TOAST_STYLES}</style>
      {/* Mobile: bottom center */}
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-2 sm:hidden pointer-events-none"
        aria-label="Notificações"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItemView toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
      {/* Desktop: top right */}
      <div
        className="fixed top-4 right-4 z-[9999] hidden sm:flex flex-col gap-2 pointer-events-none"
        aria-label="Notificações"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItemView toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}

// ── Provider ──

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = DEFAULT_DURATION) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts(prev => {
      const next = [...prev, { id, message, type, duration }];
      return next.slice(-MAX_TOASTS);
    });
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const success = useCallback((msg: string, dur?: number) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg: string, dur?: number) => addToast(msg, 'error', dur), [addToast]);
  const info = useCallback((msg: string, dur?: number) => addToast(msg, 'info', dur), [addToast]);
  const warning = useCallback((msg: string, dur?: number) => addToast(msg, 'warning', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
