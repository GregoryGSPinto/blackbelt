import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Home, ArrowLeft, Shield } from 'lucide-react';

export default async function NotFound() {
  const t = await getTranslations('common.errors');
  const tActions = await getTranslations('common.actions');
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
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}
        >
          <Shield size={36} className="text-[#C9A227]" />
        </div>

        {/* 404 number */}
        <div
          className="text-7xl font-semibold mb-2"
          style={{
            background: 'linear-gradient(135deg, #C9A227, #FFD11A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </div>

        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          {t('notFoundTitle')}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          {t('notFoundSubtitle')}
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                       transition-all shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #C9A227, #A68521)',
              color: '#1A1A2E',
            }}
          >
            <Home size={16} /> {t('backToDashboard')}
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
                       border transition-colors"
            style={{
              background: 'rgba(201,162,39,0.05)',
              borderColor: 'rgba(201,162,39,0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft size={16} /> {tActions('back')}
          </Link>
        </div>

        <p className="text-[10px] text-[var(--text-tertiary)] mt-6">
          BlackBelt OS
        </p>
      </div>
    </div>
  );
}
