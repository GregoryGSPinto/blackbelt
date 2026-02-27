'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminChurnOverviewVM } from '@/lib/application/intelligence';

/**
 * Hook para dashboard de churn do admin.
 * Consome GET /api/ai/churn.
 */
export function useChurnInsights(academyId: string) {
  const [overview, setOverview] = useState<AdminChurnOverviewVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ai/churn?limit=100`);
      if (!res.ok) {
        throw new Error(`Erro ao carregar dados de churn: ${res.status}`);
      }
      const json = await res.json();
      setOverview(json.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { overview, loading, error, refetch: fetchData };
}
