'use client';

import { useState, useEffect } from 'react';
import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';

/**
 * Hook unificado que combina múltiplos dados de IA.
 * Fetches DNA + Engagement em paralelo para um membro.
 *
 * Ideal para dashboards que precisam de ambos os dados
 * sem fazer chamadas separadas.
 */
export function useAIInsights(memberId: string) {
  const [dna, setDna] = useState<StudentDNA | null>(null);
  const [engagement, setEngagement] = useState<EngagementScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/ai/student-dna/${memberId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Erro ao carregar DNA: ${res.status}`);
          return res.json();
        })
        .then(json => json.data as StudentDNA),

      fetch(`/api/ai/engagement/${memberId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Erro ao carregar engagement: ${res.status}`);
          return res.json();
        })
        .then(json => json.data as EngagementScore),
    ])
      .then(([dnaResult, engagementResult]) => {
        if (!cancelled) {
          setDna(dnaResult);
          setEngagement(engagementResult);
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
  }, [memberId]);

  return { dna, engagement, loading, error };
}
