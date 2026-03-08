'use client';

import { useState, useEffect } from 'react';
import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';

/**
 * Hook para DNA comportamental do aluno.
 * Consome GET /api/ai/student-dna/[memberId].
 *
 * Retorna dimensões comportamentais, padrões descobertos,
 * perfil de dificuldade e predições.
 */
export function useStudentDNA(memberId: string) {
  const [dna, setDna] = useState<StudentDNA | null>(null);
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

    fetch(`/api/ai/student-dna/${memberId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar DNA: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setDna(json.data);
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

  return { dna, loading, error };
}
