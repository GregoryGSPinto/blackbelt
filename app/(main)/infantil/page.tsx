import { getTranslations } from 'next-intl/server';

export default async function InfantilPage() {
  const t = await getTranslations('athlete');
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🥋</div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4">{t('infantil.title')}</h1>
        <p className="text-lg text-white/40 mb-8">
          {t('infantil.description')}
        </p>
        <a href="/selecionar-perfil" className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-6 py-3 rounded-full font-semibold hover:bg-amber-500/30 transition-colors">
          {t('infantil.selectProfile')}
        </a>
      </div>
    </div>
  );
}
