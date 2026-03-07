// ============================================================
// app/error.tsx — Global route error boundary
// ============================================================
// Catches any unhandled error in any route segment.
// Prevents White Screen of Death.
// ============================================================
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
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
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{t('generic')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {t('unexpectedError')}
        </p>

        {/* Error digest (for support) */}
        {error.digest && (
          <div className="mb-6 px-3 py-2 rounded-lg" style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
            <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
              {t('errorCode')} {error.digest}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                       transition-all shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #C9A227, #A68521)',
              color: '#1A1A2E',
            }}
          >
            <RefreshCw size={16} /> {tActions('tryAgain')}
          </button>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
                       border transition-colors"
            style={{
              background: 'rgba(201,162,39,0.05)',
              borderColor: 'rgba(201,162,39,0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            <Home size={16} /> {tActions('goHome')}
          </Link>
        </div>

        {/* Help text */}
        <p className="text-[10px] text-[var(--text-tertiary)] mt-6 flex items-center justify-center gap-1">
          <MessageCircle size={10} />
          {t('supportContact')}
        </p>
      </div>
    </div>
  );
}
