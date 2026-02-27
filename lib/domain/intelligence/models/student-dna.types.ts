/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STUDENT DNA TYPES — Perfil Comportamental Inteligente          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Tipos do DNA do aluno: dimensões comportamentais, padrões      ║
 * ║  descobertos, perfil de dificuldade e predições.                ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  Confidence,
  DropoffPattern,
  LearningStyle,
  LearningSpeed,
  MotivationDriver,
  TimeSlot,
  IntelligenceMetadata,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// STUDENT DNA — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface StudentDNA {
  participantId: string;

  // ── Dimensões comportamentais (0-100 cada) ──────────────
  dimensions: StudentDNADimensions;

  // ── Padrões descobertos ─────────────────────────────────
  patterns: StudentDNAPatterns;

  // ── Perfil de Dificuldade (alimenta provas adaptativas) ──
  difficultyProfile: DifficultyProfile;

  // ── Predições ───────────────────────────────────────────
  predictions: {
    nextPromotionEstimate: string | null;  // ISO date estimado
    churnRisk: Score0to100;                // 0-100 (do churn engine)
    nextMilestoneWeeks: number | null;     // Semanas estimadas
    plateauRisk: Score0to100;              // 0-100, risco de estagnação
  };

  // ── Metadados ───────────────────────────────────────────
  dataPoints: number;           // Quantos eventos alimentaram este DNA
  confidence: Confidence;       // 0-1 (cresce com dados)
  computedAt: string;
  firstEventAt: string;         // Desde quando tem dados
}

// ════════════════════════════════════════════════════════════════════
// DIMENSÕES COMPORTAMENTAIS
// ════════════════════════════════════════════════════════════════════

export interface StudentDNADimensions {
  /** Regularidade de presença (padrão semanal) */
  consistency: Score0to100;

  /** Frequência x duração real */
  intensity: Score0to100;

  /** Velocidade de avanço vs média da faixa */
  progression: Score0to100;

  /** Capacidade de manter streak após quebra */
  resilience: Score0to100;

  /** Quanto treina com os mesmos colegas */
  socialConnection: Score0to100;

  /** Engajamento com ranking/pontos/conquistas */
  competitiveness: Score0to100;

  /** Diversidade de turmas/horários que frequenta */
  curiosity: Score0to100;

  /** Rapidez de resposta a feedback do professor */
  responsiveness: Score0to100;
}

// ════════════════════════════════════════════════════════════════════
// PADRÕES DESCOBERTOS
// ════════════════════════════════════════════════════════════════════

export interface StudentDNAPatterns {
  /** Dias da semana mais frequentes (0=dom, 6=sab) */
  preferredDays: number[];

  /** Horário preferido */
  preferredTimeSlot: TimeSlot;

  /** Média de sessões por semana */
  averageSessionsPerWeek: number;

  /** Dia que mais se destaca (0=dom) */
  peakPerformanceDay: number;

  /** Como abandona (gradual, abrupto, sazonal) */
  dropoffPattern: DropoffPattern;

  /** Estilo de aprendizagem */
  learningStyle: LearningStyle;

  /** O que mais motiva (ranking, badges, promoção, social) */
  motivationDrivers: MotivationDriver[];
}

// ════════════════════════════════════════════════════════════════════
// PERFIL DE DIFICULDADE
// ════════════════════════════════════════════════════════════════════

export interface DifficultyProfile {
  /** IDs das competências fortes */
  strongCompetencies: string[];

  /** IDs das competências fracas */
  weakCompetencies: string[];

  /** Baseado em tempo entre sublevels */
  learningSpeed: LearningSpeed;

  /** % de skills que mantém após 30 dias sem praticar */
  retentionRate: number;

  /** 0-100, nível ideal de dificuldade (Zona de Desenvolvimento Proximal) */
  optimalChallengeLevel: Score0to100;
}
