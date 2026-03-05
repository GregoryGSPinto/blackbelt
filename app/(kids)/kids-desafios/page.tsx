'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { KidsHeader, KidsCard, StarRating } from '@/components/kids';
import * as kidsService from '@/lib/api/kids.service';
import type { KidsChallenge } from '@/lib/api/kids.service';
import { useTheme } from '@/contexts/ThemeContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';

export default function KidsDesafiosPage() {
  const t = useTranslations('kids.challenges');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [kidschallenges, setKidschallenges] = useState<KidsChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await kidsService.getChallenges();
        setKidschallenges(data);
      } catch (err) {
        setError(handleServiceError(err, 'KidsDesafios'));
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
  if (kidschallenges.length === 0) {
    return <PageEmpty title="Nenhum desafio disponível" message="Novos desafios serão adicionados em breve!" />;
  }

  // ─── Theme colors ───
  const c = {
    heading:  isDark ? '#F1F5F9' : '#374151',
    label:    isDark ? '#CBD5E1' : '#4B5563',
    hint:     isDark ? '#94A3B8' : '#9CA3AF',
    cardBg:   isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.85)',
    border:   isDark ? 'rgba(20,184,166,0.15)' : 'rgba(0,0,0,0.06)',
    trail:    isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
  };

  return (
    <div className="space-y-6">
      <KidsHeader
        title={`🏆 ${t('title')}`}
        subtitle={t('subtitle')}
        icon="🎯"
        color="orange"
      />

      {/* Desafio Destaque */}
      <KidsCard color="yellow">
        <div className="text-center">
          <div className="text-6xl mb-3">🐯</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-kids mb-2">
            Qual o nome dessa posição?
          </h3>

          <div className="flex justify-center gap-3 my-4">
            <button className="px-6 py-3 bg-kids-green text-white rounded-2xl font-kids font-bold hover:bg-kids-green-dark transition-colors shadow-lg">
              Armlock
            </button>
            <button
              className="px-6 py-3 rounded-2xl font-kids font-bold transition-colors shadow-lg"
              style={{
                background: isDark ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#374151',
              }}
            >
              Kimura
            </button>
          </div>

          <div className="flex justify-center mb-2">
            <StarRating stars={3} maxStars={5} size="lg" />
          </div>

          <p className="font-kids text-white/80">{t('completeForStars')}</p>
        </div>
      </KidsCard>

      {/* Lista de Desafios */}
      <div>
        <h3 className="text-xl font-bold font-kids mb-4 flex items-center gap-2" style={{ color: c.heading }}>
          📋 {t('allChallenges')}
        </h3>

        <div className="space-y-3">
          {kidschallenges.map((desafio) => (
            <div
              key={desafio.id}
              className="rounded-2xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer backdrop-blur-sm border"
              style={{ background: c.cardBg, borderColor: c.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {desafio.tipo === 'quiz' && '❓'}
                      {desafio.tipo === 'memoria' && '🧩'}
                      {desafio.tipo === 'semanal' && '📅'}
                    </span>
                    <h4 className="font-kids font-bold" style={{ color: c.heading }}>{desafio.titulo}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating stars={desafio.estrelas} maxStars={5} size="sm" />

                    {desafio.concluido ? (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-kids font-semibold"
                        style={{
                          background: isDark ? 'rgba(74,222,128,0.15)' : '#DCFCE7',
                          color: isDark ? '#4ADE80' : '#15803D',
                        }}
                      >
                        ✓ {t('completedLabel')}
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-kids font-semibold"
                        style={{
                          background: isDark ? 'rgba(251,146,60,0.15)' : '#FFEDD5',
                          color: isDark ? '#FB923C' : '#C2410C',
                        }}
                      >
                        {t('percentComplete', { pct: desafio.progresso })}
                      </span>
                    )}
                  </div>
                </div>

                {!desafio.concluido && (
                  <button className="px-4 py-2 bg-kids-blue text-white rounded-xl font-kids font-semibold hover:bg-kids-blue-dark transition-colors">
                    {t('playBtn')}
                  </button>
                )}
              </div>

              {/* Barra de Progresso */}
              {!desafio.concluido && desafio.progresso > 0 && (
                <div className="mt-3">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: c.trail }}>
                    <div
                      className="h-full bg-kids-orange rounded-full transition-all duration-300"
                      style={{ width: `${desafio.progresso}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dica */}
      <div className="bg-gradient-to-r from-kids-purple to-kids-pink rounded-3xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-4xl">🐼</span>
          <div>
            <p className="font-kids font-bold text-white mb-1">{t('mascotSays', { name: 'Pandi' })}</p>
            <p className="font-kids text-white/90 text-sm">
              {t('mascotAdvice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
