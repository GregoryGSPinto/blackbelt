'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { KidsHeader, MascotCard } from '@/components/kids';
import * as kidsService from '@/lib/api/kids.service';
import type { KidsMascot } from '@/lib/api/kids.service';
import { useTheme } from '@/contexts/ThemeContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';

export default function KidsMestresPage() {
  const t = useTranslations('kids.masters');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [mascotes, setMascotes] = useState<KidsMascot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await kidsService.getMascots();
        setMascotes(data);
      } catch (err) {
        setError(handleServiceError(err, 'KidsMestres'));
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

  if (mascotes.length === 0) {
    return (
      <div className="space-y-6">
        <KidsHeader title={t('title')} subtitle={t('subtitle')} icon="🥋" color="purple" />
        <PageEmpty title={t('noMasters')} message={t('noMastersDesc')} />
      </div>
    );
  }

  // ─── Theme colors ───
  const c = {
    heading:  isDark ? '#F1F5F9' : '#374151',
    label:    isDark ? '#CBD5E1' : '#4B5563',
    hint:     isDark ? '#94A3B8' : '#9CA3AF',
    cardBg:   isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.85)',
    border:   isDark ? 'rgba(20,184,166,0.15)' : 'rgba(0,0,0,0.06)',
  };

  return (
    <div className="space-y-6">
      <KidsHeader
        title={`🐯 ${t('title')}`}
        subtitle={t('subtitle')}
        icon="🥋"
        color="purple"
      />

      {/* Intro Card */}
      <div
        className="rounded-3xl p-6 shadow-md backdrop-blur-sm border-2"
        style={{ background: c.cardBg, borderColor: c.border }}
      >
        <p className="font-kids text-center text-lg" style={{ color: c.label }}>
          {t('lessonIntro')} 💪
        </p>
      </div>

      {/* Mascot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mascotes.map((mascot) => (
          <div key={mascot.id} className="text-center">
            <MascotCard mascot={mascot} size="lg" />
            <div
              className="mt-4 rounded-2xl p-4 shadow-md backdrop-blur-sm border"
              style={{ background: c.cardBg, borderColor: c.border }}
            >
              <p className="font-kids font-bold mb-1" style={{ color: c.heading }}>{mascot.personalidade}</p>
              <p className="font-kids text-sm" style={{ color: c.hint }}>{mascot.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Motivacional */}
      <div className="bg-gradient-to-r from-kids-orange to-kids-pink rounded-3xl p-6 shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-3">🏆</div>
          <h3 className="font-kids font-bold text-white text-2xl mb-2">
            {t('allProud')}
          </h3>
          <p className="font-kids text-white/90 text-lg">
            {t('allProudDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
