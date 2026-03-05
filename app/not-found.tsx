import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Home, ArrowLeft } from 'lucide-react';

export default async function NotFound() {
  const t = await getTranslations('common.errors');
  const tActions = await getTranslations('common.actions');
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
        <div className="text-6xl font-black text-white/10 mb-4">404</div>
        <h1 className="text-xl font-bold text-white mb-2">{t('notFound')}</h1>
        <p className="text-sm text-white/40 mb-8">
          A pagina que voce procura nao existe ou foi movida.
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400
                       transition-all shadow-lg"
          >
            <Home size={16} /> {tActions('goHome')}
          </Link>

          <Link
            href="javascript:history.back()"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
                       bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={16} /> {tActions('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
