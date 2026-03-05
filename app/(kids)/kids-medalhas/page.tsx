'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { KidsHeader } from '@/components/kids';
import * as kidsService from '@/lib/api/kids.service';
import type { KidsMedal } from '@/lib/api/kids.service';
import { useTheme } from '@/contexts/ThemeContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

export default function KidsConquistasPage() {
  const t = useTranslations('kids.medals');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();
  const [kidsmedals, setKidsmedals] = useState<KidsMedal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await kidsService.getMedals();
        setKidsmedals(data);
      } catch (err) {
        setError(handleServiceError(err, 'KidsConquistas'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (kidsmedals.length === 0) {
    return <PageEmpty title={t('loading')} message={t('loading')} />;
  }

  const conquistadas = kidsmedals.filter(m => m.conquistada);
  const proximas = kidsmedals.filter(m => !m.conquistada);

  // ─── Theme colors ───
  const c = {
    heading:  isDark ? '#F1F5F9' : '#374151',
    label:    isDark ? '#CBD5E1' : '#4B5563',
    hint:     isDark ? '#94A3B8' : '#9CA3AF',
    muted:    isDark ? '#64748B' : '#6B7280',
    cardBg:   isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.85)',
    border:   isDark ? 'rgba(20,184,166,0.15)' : 'rgba(0,0,0,0.06)',
    dashed:   isDark ? 'rgba(148,163,184,0.25)' : '#D1D5DB',
    yellow:   isDark ? '#FACC15' : '#EAB308',
  };

  return (
    <div className="space-y-6">
      <KidsHeader
        title={`🎖️ ${t('title')}`}
        subtitle={t('achievementCount', { count: conquistadas.length })}
        icon="🏆"
        color="yellow"
      />

      {/* Resumo */}
      <div
        className="rounded-3xl p-6 shadow-md backdrop-blur-sm border-2"
        style={{ background: c.cardBg, borderColor: c.border }}
      >
        <div className="text-center">
          <div className="text-6xl mb-3">🏆</div>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-kids mb-2" style={{ color: c.yellow }}>
            {conquistadas.length}
          </p>
          <p className="font-kids" style={{ color: c.label }}>{t('unlockedTab')}</p>
        </div>
      </div>

      {/* Conquistas Conquistadas */}
      <div>
        <h3 className="text-xl font-bold font-kids mb-4 flex items-center gap-2" style={{ color: c.heading }}>
          ✨ {t('unlockedTab')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conquistadas.map((conquista) => (
            <div
              key={conquista.id}
              className="rounded-3xl p-5 shadow-md border-2"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(250,204,21,0.1), rgba(251,191,36,0.08))'
                  : 'linear-gradient(135deg, #FFF9C4, #FFD54F)',
                borderColor: isDark ? 'rgba(250,204,21,0.2)' : '#FBC02D',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{conquista.icone}</div>
                <div className="flex-1">
                  <h4 className="font-kids font-bold text-lg mb-1" style={{ color: c.heading }}>
                    {conquista.nome}
                  </h4>
                  <p className="font-kids text-sm mb-2" style={{ color: c.label }}>
                    {conquista.descricao}
                  </p>
                  <p className="font-kids text-xs" style={{ color: c.hint }}>
                    {formatDate(conquista.dataConquista!)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proximas Conquistas */}
      <div>
        <h3 className="text-xl font-bold font-kids mb-4 flex items-center gap-2" style={{ color: c.heading }}>
          🎯 {t('nextTab')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proximas.map((conquista) => (
            <div
              key={conquista.id}
              className="rounded-3xl p-5 shadow-md border-2 border-dashed backdrop-blur-sm"
              style={{ background: c.cardBg, borderColor: c.dashed }}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl opacity-50">{conquista.icone}</div>
                <div className="flex-1">
                  <h4 className="font-kids font-bold text-lg mb-1" style={{ color: c.muted }}>
                    {conquista.nome}
                  </h4>
                  <p className="font-kids text-sm" style={{ color: c.hint }}>
                    {conquista.descricao}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensagem Motivacional */}
      <div className="bg-gradient-to-r from-kids-green to-kids-blue rounded-3xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-4xl">🦁</span>
          <div>
            <p className="font-kids font-bold text-white mb-1">{t('mascotSays', { name: 'Leo' })}</p>
            <p className="font-kids text-white/90 text-sm">
              {t('mascotEncouragement', { unlocked: conquistadas.length, remaining: proximas.length })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
