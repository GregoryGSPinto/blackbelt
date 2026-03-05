// ============================================================
// app/error.tsx — Global route error boundary
// ============================================================
// Catches any unhandled error in any route segment.
// Prevents White Screen of Death.
// ============================================================
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { errorTracker } from '@/lib/monitoring/error-tracker';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('common.errors');
  const tActions = useTranslations('common.actions');
  useEffect(() => {
    errorTracker.captureError(error, {
      component: 'RootErrorBoundary',
      action: 'render-error',
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <AlertTriangle size={28} className="text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-white mb-2">{t('generic')}</h1>
        <p className="text-sm text-white/40 mb-6">
          Ocorreu um erro inesperado. Não se preocupe, sua sessão está segura.
        </p>

        {/* Error digest (for support) */}
        {error.digest && (
          <div className="mb-6 px-3 py-2 rounded-lg bg-white/3 border border-white/6">
            <p className="text-[10px] text-white/20 font-mono">
              Código: {error.digest}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400
                       transition-all shadow-lg"
          >
            <RefreshCw size={16} /> {tActions('tryAgain')}
          </button>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
                       bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
          >
            <Home size={16} /> {tActions('goHome')}
          </Link>
        </div>

        {/* Help text */}
        <p className="text-[10px] text-white/15 mt-6">
          Se o problema persistir, entre em contato com o suporte da unidade.
        </p>
      </div>
    </div>
  );
}
