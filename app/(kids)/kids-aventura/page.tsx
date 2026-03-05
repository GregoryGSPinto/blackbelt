'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useStudentDNA } from '@/hooks/useStudentDNA';
import AdventureProgress from '@/components/kids/AdventureProgress';
import StickerCollection from '@/components/kids/StickerCollection';
import MascotBubble from '@/components/kids/MascotBubble';
import SimpleProgressStars from '@/components/kids/SimpleProgressStars';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function KidsAventuraPage() {
  const t = useTranslations('kids.adventure');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [memberId, setMemberId] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch current kid's member ID
  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error(t('error'));
        return res.json();
      })
      .then(json => {
        if (json.data?.memberId) setMemberId(json.data.memberId);
      })
      .catch(err => {
        setUserError(err instanceof Error ? err.message : t('unknownError'));
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
          <div className="h-24 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-40 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-20 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="h-48 rounded-3xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !dna) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-red-300 text-sm font-medium">
            {t('oops')}
          </p>
          <p className="text-red-300/60 text-xs mt-1">
            {t('tryAgainLater')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 font-kids">
          {t('title')}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-kids">
          {t('subtitle')}
        </p>
      </div>

      {/* Mascot greeting at top */}
      <MascotBubble
        mood={dna && dna.dimensions.consistency >= 70 ? 'proud' : 'encouraging'}
        message={t('greeting')}
      />

      {/* Adventure Progress Map */}
      <AdventureProgress
        adventure={{
          currentChapter: dna ? `Capitulo ${Math.ceil(dna.dimensions.progression / 20)}` : 'Capitulo 1',
          starsCollected: dna ? Math.round(dna.dimensions.progression / 20) : 0,
          totalStars: 5,
          mascotMessage: dna && dna.dimensions.consistency >= 60
            ? t('doingGreat')
            : t('keepGoing'),
          mascotMood: dna && dna.dimensions.consistency >= 70 ? 'proud' : 'encouraging',
        }}
      />

      {/* Stars Progress */}
      <SimpleProgressStars
        stars={{
          technique: dna ? Math.round(dna.dimensions.progression / 20) : 0,
          effort: dna ? Math.round(dna.dimensions.intensity / 20) : 0,
          behavior: dna ? Math.round(dna.dimensions.consistency / 20) : 0,
          lastUpdated: dna?.computedAt ? new Date(dna.computedAt).toLocaleDateString('pt-BR') : '--',
        }}
      />

      {/* Sticker Collection */}
      <StickerCollection
        stickers={{
          earned: [],
          nextToEarn: {
            name: t('firstTraining'),
            hint: t('unlockMore'),
            progress: dna ? Math.min(100, dna.dimensions.consistency) : 0,
          },
        }}
      />
    </div>
  );
}
