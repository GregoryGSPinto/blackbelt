'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useStudentDNA } from '@/hooks/useStudentDNA';
import { useEngagementScore } from '@/hooks/useEngagementScore';
import { PersonalInsightsCard } from '@/components/aluno/PersonalInsightsCard';
import { WeeklyChallengeCard } from '@/components/aluno/WeeklyChallengeCard';
import { PromotionPredictionCard } from '@/components/aluno/PromotionPredictionCard';
import { TrainingBuddiesWidget } from '@/components/aluno/TrainingBuddiesWidget';
import { MotivationalBanner } from '@/components/aluno/MotivationalBanner';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

function getMoodDriver(dna: { dimensions: { consistency: number; intensity: number; progression: number } } | null): string {
  if (!dna) return 'mastery';
  const { consistency, intensity, progression } = dna.dimensions;
  if (consistency >= 70) return 'consistency';
  if (progression >= 70) return 'mastery';
  if (intensity >= 70) return 'intensity';
  return 'social';
}

export default function MeusInsightsPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

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
            {t('insights.error')}
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
          {t('insights.title')}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {memberName
            ? t('insights.greeting', { name: memberName })
            : t('insights.greetingGeneric')}
        </p>
      </div>

      {/* Motivational Banner */}
      <MotivationalBanner
        message={
          dna && dna.dimensions.consistency >= 70
            ? 'Voce esta em uma sequencia incrivel! Continue assim!'
            : 'Cada treino conta. Vamos manter o ritmo!'
        }
        driver={getMoodDriver(dna)}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonalInsightsCard
          insights={{
            bestDay: dna?.patterns ? ['Domingo','Segunda','Terca','Quarta','Quinta','Sexta','Sabado'][dna.patterns.peakPerformanceDay] ?? 'Ainda calculando...' : 'Ainda calculando...',
            optimalFrequency: dna ? `${Math.round(dna.dimensions.consistency / 25)}x por semana` : '--',
            strongPoint: 'Continue treinando para descobrir!',
            improvementArea: 'A IA precisa de mais dados.',
            funFact: dna ? `Seu DNA de treino tem confianca de ${Math.round(dna.confidence * 100)}%` : '--',
          }}
        />
        <WeeklyChallengeCard
          challenge={{
            title: 'Desafio da Semana',
            description: 'Treine pelo menos 3 vezes esta semana!',
            reward: 100,
            basedOn: 'consistencia',
            difficulty: dna && dna.dimensions.consistency >= 70 ? 'hard' : 'medium',
          }}
        />
        <PromotionPredictionCard
          prediction={dna ? {
            estimatedWeeks: dna.predictions.nextMilestoneWeeks ?? 8,
            progress: dna.dimensions.progression,
            currentBelt: 'Atual',
            nextBelt: 'Proxima',
            isAheadOfAverage: dna.dimensions.progression >= 60,
          } : null}
        />
        <TrainingBuddiesWidget
          buddies={[]}
          communityRole="Aluno"
          networkStrength="Iniciante"
        />
      </div>
    </div>
  );
}
