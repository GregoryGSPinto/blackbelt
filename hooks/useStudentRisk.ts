'use client';

import { useState, useEffect } from 'react';
import type { ChurnPrediction } from '@/lib/domain/intelligence';

/**
 * Hook para predição individual de risco de evasão.
 * Usado pelo professor na ficha do aluno.
 * Consome GET /api/ai/churn/[memberId].
 */
export function useStudentRisk(memberId: string) {
  const [prediction, setPrediction] = useState<ChurnPrediction | null>(null);
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

    fetch(`/api/ai/churn/${memberId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setPrediction(json.data);
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

  return { prediction, loading, error };
}
