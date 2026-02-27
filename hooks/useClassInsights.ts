'use client';

import { useState, useEffect } from 'react';
import type { ClassInsight } from '@/lib/domain/intelligence/models/class-insight.types';

/**
 * Hook para insights inteligentes de uma turma.
 * Consome GET /api/ai/class-insights?classScheduleId=xxx.
 *
 * Retorna saúde da turma, composição, recomendações e foco sugerido.
 */
export function useClassInsights(classScheduleId: string) {
  const [insight, setInsight] = useState<ClassInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!classScheduleId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/ai/class-insights?classScheduleId=${encodeURIComponent(classScheduleId)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar insights da turma: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setInsight(json.data);
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
  }, [classScheduleId]);

  return { insight, loading, error };
}
