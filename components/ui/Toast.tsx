'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ─── Context ────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Icon + Color maps ─────────────────────────────────────
const TYPE_CONFIG: Record<ToastType, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

// ─── Single Toast ───────────────────────────────────────────
function ToastEntry({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;
  const duration = item.duration ?? 4000;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const remainingRef = useRef(duration);

  useEffect(() => {
    if (paused) return;
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(item.id), remainingRef.current);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, ((remainingRef.current - elapsed) / duration) * 100);
      setProgress(pct);
    }, 50);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(interval);
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [paused, item.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      aria-live="polite"
      className={[
        'relative flex items-start gap-3 w-80 rounded-token-lg p-3.5 pr-10',
        'bg-[var(--card-bg)] border border-[var(--border)] shadow-token-lg',
        'overflow-hidden',
      ].join(' ')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`flex-shrink-0 p-1 rounded-full ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-snug flex-1">
        {item.message}
      </p>
      <button
        onClick={() => onDismiss(item.id)}
        className="absolute top-2 right-2 p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--bg-secondary)]">
        <div
          className={`h-full ${config.color.replace('text-', 'bg-')} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

// ─── Provider ───────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
    },
    [],
  );

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[10000] flex flex-col-reverse gap-2 sm:bottom-6 sm:right-6"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t, i) => (
            <div
              key={t.id}
              style={{
                transform: i > 0 && !prefersReducedMotion
                  ? `translateY(${-4 * i}px) scale(${1 - i * 0.02})`
                  : undefined,
                opacity: i > 2 ? 0 : 1,
              }}
            >
              <ToastEntry item={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
