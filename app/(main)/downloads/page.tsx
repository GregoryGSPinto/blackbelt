import { getTranslations } from 'next-intl/server';
import DownloadsContent from './_components/DownloadsContent';

/**
 * Downloads Page — Server Component
 * Shell renderizada no servidor. Conteúdo interativo (download/delete actions)
 * delegado ao Client Component.
 *
 * TODO(FE-025): Implementar offline storage (Service Worker + IndexedDB)
 * de downloads do usuário via server-side fetch.
 */
export default async function DownloadsPage() {
  const t = await getTranslations('athlete');
  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      {/* Header — Server-rendered */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2" style={{ color: 'rgb(var(--color-text))' }}>{t('downloads.title')}</h1>
        <p style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>{t('downloads.subtitle')}</p>
      </div>

      {/* Interactive content — Client Component */}
      <DownloadsContent />
    </div>
  );
}
