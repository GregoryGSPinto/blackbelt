'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useStudentDNA } from '@/hooks/useStudentDNA';
import XPProgressBar from '@/components/teen/XPProgressBar';
import DailyQuestCard from '@/components/teen/DailyQuestCard';
import RivalChallengeCard from '@/components/teen/RivalChallengeCard';
import FunStatsCarousel from '@/components/teen/FunStatsCarousel';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function TeenInsightsPage() {
  const t = useTranslations('teen.insights');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [memberId, setMemberId] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch current teen's member ID
  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar perfil');
        return res.json();
      })
      .then(json => {
        if (json.data?.memberId) setMemberId(json.data.memberId);
      })
      .catch(err => {
        setUserError(err instanceof Error ? err.message : 'Erro desconhecido');
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const { dna, loading: dnaLoading, error: dnaError } = useStudentDNA(memberId);

  const isLoading = loadingUser || dnaLoading;
  const error = userError || dnaError?.message;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="h-16 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-48 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-32 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-40 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !dna) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 text-sm font-medium">
            Ops, algo deu errado
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-zinc-100">
          {t('title')}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* XP Progress Bar */}
      <XPProgressBar
        levelUp={{
          currentXP: dna ? Math.round((dna.dimensions.progression / 100) * 1500) : 0,
          nextLevelXP: 1500,
          progress: dna ? dna.dimensions.progression : 0,
          title: dna && dna.dimensions.progression >= 80
            ? t('levels.warrior')
            : dna && dna.dimensions.progression >= 50
            ? t('levels.advancedApprentice')
            : t('levels.beginner'),
        }}
      />

      {/* Daily Quest */}
      <DailyQuestCard
        quest={{
          title: t('dailyQuest'),
          description: t('dailyQuestDesc'),
          xpReward: 50,
          emoji: '🥋',
        }}
      />

      {/* Fun Stats Carousel */}
      <FunStatsCarousel
        stats={[
          { emoji: '🔥', text: `${t('consistency')} ${dna?.dimensions.consistency ?? 0}%` },
          { emoji: '💪', text: `${t('intensity')} ${dna?.dimensions.intensity ?? 0}%` },
          { emoji: '📈', text: `${t('progression')} ${dna?.dimensions.progression ?? 0}%` },
          { emoji: '🤝', text: `${t('social')} ${dna?.dimensions.socialConnection ?? 0}%` },
        ]}
      />

      {/* Rival Challenge */}
      <RivalChallengeCard challenge={undefined} />
    </div>
  );
}
