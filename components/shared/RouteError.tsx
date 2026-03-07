// ============================================================
// RouteError — Reusable error UI for route group error.tsx
// ============================================================
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { errorTracker } from '@/lib/monitoring/error-tracker';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  moduleName?: string;
  homeHref?: string;
}

export function RouteError({
  error,
  reset,
  moduleName = 'BlackBelt',
  homeHref = '/dashboard',
}: RouteErrorProps) {
  const t = useTranslations('auth.error');
  const tActions = useTranslations('common.actions');
  useEffect(() => {
    errorTracker.captureError(error, {
      component: `ErrorBoundary:${moduleName}`,
      action: 'render-error',
      extra: { digest: error.digest },
    });
  }, [error, moduleName]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div
        className="max-w-sm w-full rounded-2xl p-6 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <AlertTriangle size={24} className="text-red-400" />
        </div>

        <h2 className="text-lg font-semibold text-white mb-1.5">{t('routeError')}</h2>
        <p className="text-xs text-white/40 mb-5">
          {t('moduleLabel')} {moduleName}. {t('feedbackHelps')}
        </p>

        {error.digest && (
          <p className="text-[10px] text-white/15 font-mono mb-4">
            ref: {error.digest}
          </p>
        )}

        <div className="space-y-2.5">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all"
          >
            <RefreshCw size={14} /> {tActions('tryAgain')}
          </button>
          <Link
            href={homeHref}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm
                       bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-colors"
          >
            <Home size={14} /> {tActions('goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
