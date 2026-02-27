'use client';

import { useState, useEffect } from 'react';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';

/**
 * Hook para score de engajamento de um aluno.
 * Consome GET /api/ai/engagement/[memberId].
 *
 * Retorna score geral, dimensões (physical, pedagogical, social,
 * financial, digital), tier, tendência e prioridade de atenção.
 */
export function useEngagementScore(memberId: string) {
  const [score, setScore] = useState<EngagementScore | null>(null);
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

    fetch(`/api/ai/engagement/${memberId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar engagement: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setScore(json.data);
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

  return { score, loading, error };
}
