'use client';

/**
 * academyProgress — Estado de progresso do aluno na unidade
 * Mantém progresso em memória (React state).
 * TODO(FE-031): Persistir progresso via POST /academy/progress
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ACADEMY_AREAS } from './academyConfig';
import { ACADEMY_TESTS } from './academyTests';

export interface AreaProgress {
  areaId: string;
  contentRead: boolean;         // leu o conteúdo teórico
  testCompleted: boolean;       // completou o teste
  testScore: number;            // acertos (0–N)
  testTotal: number;            // total de perguntas
  answers: Record<string, string>; // questionId → answer label
}

interface AcademyProgressCtx {
  progress: Record<string, AreaProgress>;
  markContentRead: (areaId: string) => void;
  submitTestAnswers: (areaId: string, answers: Record<string, string>) => { score: number; total: number };
  resetArea: (areaId: string) => void;
  getAreaPercent: (areaId: string) => number;
  getOverallPercent: () => number;
}

const Ctx = createContext<AcademyProgressCtx | null>(null);

function initProgress(): Record<string, AreaProgress> {
  const map: Record<string, AreaProgress> = {};
  ACADEMY_AREAS.forEach(a => {
    map[a.id] = {
      areaId: a.id,
      contentRead: false,
      testCompleted: false,
      testScore: 0,
      testTotal: ACADEMY_TESTS.find(t => t.areaId === a.id)?.questions.length ?? 0,
      answers: {},
    };
  });
  return map;
}

export function AcademyProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Record<string, AreaProgress>>(initProgress);

  const markContentRead = useCallback((areaId: string) => {
    setProgress(prev => ({
      ...prev,
      [areaId]: { ...prev[areaId], contentRead: true },
    }));
  }, []);

  const submitTestAnswers = useCallback((areaId: string, answers: Record<string, string>) => {
    const test = ACADEMY_TESTS.find(t => t.areaId === areaId);
    if (!test) return { score: 0, total: 0 };

    let score = 0;
    test.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });

    setProgress(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        testCompleted: true,
        testScore: score,
        testTotal: test.questions.length,
        answers,
      },
    }));

    return { score, total: test.questions.length };
  }, []);

  const resetArea = useCallback((areaId: string) => {
    setProgress(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        testCompleted: false,
        testScore: 0,
        answers: {},
      },
    }));
  }, []);

  const getAreaPercent = useCallback((areaId: string) => {
    const p = progress[areaId];
    if (!p) return 0;
    let pct = 0;
    if (p.contentRead) pct += 50;  // 50% por ler conteúdo
    if (p.testCompleted) {
      pct += p.testTotal > 0 ? Math.round((p.testScore / p.testTotal) * 50) : 0; // 50% pelo teste
    }
    return pct;
  }, [progress]);

  const getOverallPercent = useCallback(() => {
    const total = ACADEMY_AREAS.length;
    if (total === 0) return 0;
    const sum = ACADEMY_AREAS.reduce((acc, a) => acc + getAreaPercent(a.id), 0);
    return Math.round(sum / total);
  }, [getAreaPercent]);

  return (
    <Ctx.Provider value={{ progress, markContentRead, submitTestAnswers, resetArea, getAreaPercent, getOverallPercent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAcademyProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAcademyProgress must be inside AcademyProgressProvider');
  return ctx;
}
