// ============================================================
// ActiveClassContext — Manages Active Class Session State
// ============================================================
// Persists in localStorage so reloading doesn't lose state.
// Used by ActiveClassMode and instrutor dashboard.
// ============================================================
'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { TurmaResumo, AlunoPresenca } from '@/lib/api/instrutor.service';

// ── Types ──

interface ActiveClassState {
  turmaId: string;
  turmaNome: string;
  turmaCategoria: string;
  startTime: string; // ISO
  students: AlunoPresenca[];
  observacao: string;
}

interface ActiveClassContextType {
  /** Whether a class is currently active */
  isActive: boolean;
  /** Current active class data */
  classData: ActiveClassState | null;
  /** Elapsed time in seconds */
  elapsedSeconds: number;
  /** Start a new class */
  startClass: (turma: TurmaResumo, students: AlunoPresenca[]) => void;
  /** End the current class (returns summary) */
  endClass: () => { presentes: number; ausentes: number; naoMarcados: number } | null;
  /** Toggle a student's presence status */
  toggleStudent: (studentId: string) => void;
  /** Update observation */
  setObservacao: (obs: string) => void;
}

const ActiveClassContext = createContext<ActiveClassContextType>({
  isActive: false,
  classData: null,
  elapsedSeconds: 0,
  startClass: () => {},
  endClass: () => null,
  toggleStudent: () => {},
  setObservacao: () => {},
});

const STORAGE_KEY = 'blackbelt_active_class';

// ── Provider ──

export function ActiveClassProvider({ children }: { children: ReactNode }) {
  const [classData, setClassData] = useState<ActiveClassState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveClassState;
        setClassData(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Timer
  useEffect(() => {
    if (!classData) {
      setElapsedSeconds(0);
      return;
    }
    const update = () => {
      const start = new Date(classData.startTime).getTime();
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [classData?.startTime]);

  // Persist to localStorage
  useEffect(() => {
    if (classData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [classData]);

  const startClass = useCallback((turma: TurmaResumo, students: AlunoPresenca[]) => {
    setClassData({
      turmaId: turma.id,
      turmaNome: turma.nome,
      turmaCategoria: turma.categoria,
      startTime: new Date().toISOString(),
      students,
      observacao: '',
    });
  }, []);

  const endClass = useCallback(() => {
    if (!classData) return null;
    const presentes = classData.students.filter(s => s.status === 'presente').length;
    const ausentes = classData.students.filter(s => s.status === 'falta').length;
    const naoMarcados = classData.students.filter(s => s.status === 'nao_marcado').length;
    setClassData(null);
    return { presentes, ausentes, naoMarcados };
  }, [classData]);

  const toggleStudent = useCallback((studentId: string) => {
    setClassData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        students: prev.students.map(s => {
          if (s.id !== studentId) return s;
          // Cycle: nao_marcado → presente → falta → presente
          const next = s.status === 'nao_marcado' ? 'presente'
            : s.status === 'presente' ? 'falta'
            : 'presente';
          return { ...s, status: next as AlunoPresenca['status'] };
        }),
      };
    });
  }, []);

  const setObservacao = useCallback((obs: string) => {
    setClassData(prev => prev ? { ...prev, observacao: obs } : prev);
  }, []);

  return (
    <ActiveClassContext.Provider value={{
      isActive: classData !== null,
      classData,
      elapsedSeconds,
      startClass,
      endClass,
      toggleStudent,
      setObservacao,
    }}>
      {children}
    </ActiveClassContext.Provider>
  );
}

export function useActiveClass() {
  return useContext(ActiveClassContext);
}
