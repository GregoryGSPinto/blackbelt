import DownloadsContent from './_components/DownloadsContent';

/**
 * Downloads Page — Server Component
 * Shell renderizada no servidor. Conteúdo interativo (download/delete actions)
 * delegado ao Client Component.
 *
 * TODO(FE-025): Implementar offline storage (Service Worker + IndexedDB)
 * de downloads do usuário via server-side fetch.
 */
export default function DownloadsPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      {/* Header — Server-rendered */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'rgb(var(--color-text))' }}>Downloads</h1>
        <p style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>Conteúdo salvo para assistir offline</p>
      </div>

      {/* Interactive content — Client Component */}
      <DownloadsContent />
    </div>
  );
}
