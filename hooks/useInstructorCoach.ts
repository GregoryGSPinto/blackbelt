'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InstructorCoachBriefing } from '@/lib/domain/intelligence/models/instructor-coach.types';

/**
 * Hook para briefing diário inteligente do instrutor.
 * Consome GET /api/ai/instructor-coach.
 *
 * Retorna briefing com resumo do dia, dicas pedagógicas,
 * spotlight students e métricas de performance.
 */
export function useInstructorCoach() {
  const [briefing, setBriefing] = useState<InstructorCoachBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/instructor-coach');
      if (!res.ok) throw new Error(`Erro ao carregar briefing: ${res.status}`);
      const json = await res.json();
      setBriefing(json.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchData().catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  return { briefing, loading, error, refetch: fetchData };
}
