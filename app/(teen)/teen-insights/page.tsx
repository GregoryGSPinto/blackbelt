'use client';

import { useState, useEffect } from 'react';
import { useStudentDNA } from '@/hooks/useStudentDNA';
import { XPProgressBar } from '@/components/teen/XPProgressBar';
import { DailyQuestCard } from '@/components/teen/DailyQuestCard';
import { RivalChallengeCard } from '@/components/teen/RivalChallengeCard';
import { FunStatsCarousel } from '@/components/teen/FunStatsCarousel';

export default function TeenInsightsPage() {
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
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
          Seus Insights
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          A IA analisou seus treinos e trouxe novidades pra voce!
        </p>
      </div>

      {/* XP Progress Bar */}
      <XPProgressBar dna={dna} />

      {/* Daily Quest */}
      <DailyQuestCard dna={dna} />

      {/* Fun Stats Carousel */}
      <FunStatsCarousel dna={dna} />

      {/* Rival Challenge */}
      <RivalChallengeCard dna={dna} memberId={memberId} />
    </div>
  );
}
