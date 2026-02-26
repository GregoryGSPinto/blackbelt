// ============================================================
// useContextualMenu — Time-based contextual suggestions
// ============================================================
// Detects current time, matches against turma schedules,
// and returns contextual suggestions for professors/admins.
//
// Usage:
//   const { turmaAtual, proximaTurma, sugestoes } = useContextualMenu(turmas);
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import type { TurmaResumo } from '@/lib/api/instrutor.service';

export interface TurmaContextual extends TurmaResumo {
  /** Is this turma's class happening right now? */
  emAndamento: boolean;
  /** Minutes until this turma's next class starts (negative if already started) */
  minutosParaInicio: number;
}

export interface Sugestao {
  id: string;
  tipo: 'chamada' | 'mensagem' | 'graduacao' | 'aniversario';
  titulo: string;
  descricao: string;
  emoji: string;
  prioridade: number; // lower = higher priority
  acao?: string; // route or action id
}

interface ContextualMenuResult {
  /** Turma happening right now (null if none) */
  turmaAtual: TurmaContextual | null;
  /** Next upcoming turma (null if none today) */
  proximaTurma: TurmaContextual | null;
  /** All turmas enriched with contextual data */
  turmasContextuais: TurmaContextual[];
  /** Current day abbreviation (Seg, Ter, etc) */
  diaAtual: string;
  /** Whether there are any classes today */
  temAulaHoje: boolean;
}

// ── Day mapping ──

const DIAS_MAP: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb',
};

/**
 * Parse a time string like "19:30" into minutes since midnight.
 */
function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Extract start and end times from horario like "19:30 – 21:00".
 */
function parseHorario(horario: string): { inicio: number; fim: number } {
  const parts = horario.split(/\s*[–-]\s*/);
  return {
    inicio: parseTime(parts[0]?.trim() || '00:00'),
    fim: parseTime(parts[1]?.trim() || '23:59'),
  };
}

/**
 * Check if a turma runs on a given day.
 * dias format: "Seg · Qua · Sex" or "Ter · Qui"
 */
function turmaRunsOnDay(dias: string, diaAbrev: string): boolean {
  return dias.includes(diaAbrev);
}

// ══════════════════════════════════════════════════════════════

export function useContextualMenu(turmas: TurmaResumo[]): ContextualMenuResult {
  const [now, setNow] = useState(new Date());

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const diaAtual = DIAS_MAP[now.getDay()] || 'Seg';
    const minutosAgora = now.getHours() * 60 + now.getMinutes();

    // Enrich turmas with contextual data
    const turmasContextuais: TurmaContextual[] = turmas.map((turma) => {
      const runsToday = turmaRunsOnDay(turma.dias, diaAtual);
      const { inicio, fim } = parseHorario(turma.horario);

      const emAndamento = runsToday && minutosAgora >= inicio && minutosAgora <= fim;
      const minutosParaInicio = runsToday ? inicio - minutosAgora : 999;

      return { ...turma, emAndamento, minutosParaInicio };
    });

    // Sort by proximity: active first, then by minutes to start
    const sorted = [...turmasContextuais].sort((a, b) => {
      if (a.emAndamento && !b.emAndamento) return -1;
      if (!a.emAndamento && b.emAndamento) return 1;
      return a.minutosParaInicio - b.minutosParaInicio;
    });

    const turmaAtual = sorted.find(t => t.emAndamento) ?? null;

    // Next upcoming = runs today, hasn't started yet, closest
    const proximaTurma = sorted.find(t =>
      !t.emAndamento && t.minutosParaInicio > 0 && t.minutosParaInicio < 999
    ) ?? null;

    const temAulaHoje = turmasContextuais.some(t =>
      turmaRunsOnDay(t.dias, diaAtual)
    );

    return {
      turmaAtual,
      proximaTurma,
      turmasContextuais,
      diaAtual,
      temAulaHoje,
    };
  }, [turmas, now]);
}

/**
 * Format minutes-to-start as human readable.
 * e.g., 90 → "em 1h 30min", -10 → "há 10min", 0 → "agora"
 */
export function formatMinutosParaInicio(min: number): string {
  if (min <= 0 && min > -5) return 'agora';
  if (min < 0) return `há ${Math.abs(min)}min`;
  if (min < 60) return `em ${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `em ${h}h ${m}min` : `em ${h}h`;
}
