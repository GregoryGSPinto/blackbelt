'use client';

import { useState, useCallback } from 'react';
import type { AdaptiveTest } from '@/lib/domain/intelligence/models/adaptive-test.types';

/**
 * Hook para geração de provas adaptativas.
 * POSTs to /api/ai/adaptive-test.
 *
 * Retorna função `generate` que dispara a geração e o resultado.
 */

interface AdaptiveTestConfig {
  participantId: string;
  trackId: string;
  targetMilestoneId: string;
  testType: 'promotion' | 'periodic' | 'diagnostic';
  maxQuestions?: number;
}

export function useAdaptiveTest() {
  const [test, setTest] = useState<AdaptiveTest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (config: AdaptiveTestConfig): Promise<AdaptiveTest> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/adaptive-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error ?? `Erro ao gerar prova: ${res.status}`);
      }

      const json = await res.json();
      const generatedTest = json.data as AdaptiveTest;
      setTest(generatedTest);
      setLoading(false);
      return generatedTest;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { generate, test, loading, error };
}
