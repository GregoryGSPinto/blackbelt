'use client';

import { useState, useEffect } from 'react';

/**
 * ViewModel for parent-facing insights.
 */
export interface ParentInsightsVM {
  childId: string;
  childName: string;
  childAvatar: string | null;
  progress: {
    currentBelt: string;
    overallScore: number;
    attendancePercentage: number;
    currentStreak: number;
    bestStreak: number;
    totalSessions: number;
  };
  recentAchievements: {
    title: string;
    description: string;
    date: string | null;
  }[];
  nextSteps: {
    nextMilestone: string;
    progressToNextMilestone: number;
    estimatedWeeksToPromotion: number | null;
  };
  engagementSummary: string;
  computedAt: string;
}

/**
 * Hook para insights de pais/responsáveis sobre o filho.
 * Consome GET /api/ai/parent-insights/[childId].
 *
 * Retorna progresso simplificado, conquistas recentes,
 * próximos passos e resumo de engajamento.
 */
export function useParentInsights(childId: string) {
  const [insights, setInsights] = useState<ParentInsightsVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/ai/parent-insights/${childId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar insights: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setInsights(json.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Erro desconhecido'));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [childId]);

  return { insights, loading, error };
}
