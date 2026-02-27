'use client';

import { useState, useEffect } from 'react';
import { useStudentDNA } from '@/hooks/useStudentDNA';
import { useEngagementScore } from '@/hooks/useEngagementScore';
import { PersonalInsightsCard } from '@/components/aluno/PersonalInsightsCard';
import { WeeklyChallengeCard } from '@/components/aluno/WeeklyChallengeCard';
import { PromotionPredictionCard } from '@/components/aluno/PromotionPredictionCard';
import { TrainingBuddiesWidget } from '@/components/aluno/TrainingBuddiesWidget';
import { MotivationalBanner } from '@/components/aluno/MotivationalBanner';

export default function MeusInsightsPage() {
  const [memberId, setMemberId] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch current user's member ID
  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar perfil');
        return res.json();
      })
      .then(json => {
        if (json.data?.memberId) setMemberId(json.data.memberId);
        if (json.data?.nome) setMemberName(json.data.nome.split(' ')[0]);
      })
      .catch(err => {
        setUserError(err instanceof Error ? err.message : 'Erro desconhecido');
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const { dna, loading: dnaLoading, error: dnaError } = useStudentDNA(memberId);
  const { score, loading: engLoading, error: engError } = useEngagementScore(memberId);

  const isLoading = loadingUser || dnaLoading || engLoading;
  const error = userError || dnaError?.message || engError?.message;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
        <div className="space-y-4">
          <div className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-48 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !dna && !score) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 text-sm font-medium">
            Erro ao carregar insights
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
          Meus Insights
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {memberName
            ? `Ola, ${memberName}! Veja o que a IA descobriu sobre seu treino.`
            : 'Descubra o que a IA descobriu sobre seu treino.'}
        </p>
      </div>

      {/* Motivational Banner */}
      <MotivationalBanner dna={dna} engagement={score} />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonalInsightsCard dna={dna} />
        <WeeklyChallengeCard dna={dna} />
        <PromotionPredictionCard dna={dna} engagement={score} />
        <TrainingBuddiesWidget memberId={memberId} />
      </div>
    </div>
  );
}
