/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ENGAGEMENT TYPES — Score Unificado de Engajamento              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Mede QUALIDADE do envolvimento do aluno. Diferente do churn    ║
 * ║  (que prediz saída), o engagement mede valor ativo.             ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  TrendDirection,
  TrendDelta,
  EngagementTier,
  AttentionLevel,
  IntelligenceMetadata,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// ENGAGEMENT SCORE — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface EngagementScore {
  participantId: string;

  // ── Score composto ────────────────────────────────────────
  /** Score geral 0-100 */
  overall: Score0to100;

  /** Tendência últimas 4 semanas */
  trend: TrendDirection;

  /** +/- pontos vs mês anterior */
  trendDelta: TrendDelta;

  // ── Subdimensões ──────────────────────────────────────────
  dimensions: EngagementDimensions;

  // ── Classificação ─────────────────────────────────────────
  /** Tier de engajamento */
  tier: EngagementTier;

  /** Desde quando está neste tier (ISO date) */
  tierSince: string;

  // ── Prioridade de atenção ─────────────────────────────────
  /** Sistema de prioridade que alimenta o professor */
  attentionPriority: AttentionPriority;

  // ── Metadados ─────────────────────────────────────────────
  metadata: IntelligenceMetadata;
}

// ════════════════════════════════════════════════════════════════════
// SUBDIMENSÕES DE ENGAJAMENTO
// ════════════════════════════════════════════════════════════════════

export interface EngagementDimensions {
  /** Presença real (check-ins, horas) — peso 30% */
  physical: Score0to100;

  /** Evolução técnica (scores, sublevels, promoções) — peso 25% */
  pedagogical: Score0to100;

  /** Interação (ranking, conquistas, treinos em grupo) — peso 20% */
  social: Score0to100;

  /** Pagamentos em dia, plano ativo — peso 15% */
  financial: Score0to100;

  /** Uso do app (check-in digital, visualização de conteúdo) — peso 10% */
  digital: Score0to100;
}

// ════════════════════════════════════════════════════════════════════
// PRIORIDADE DE ATENÇÃO
// ════════════════════════════════════════════════════════════════════

export interface AttentionPriority {
  /** 1 = precisa de atenção urgente, 5 = autônomo */
  level: AttentionLevel;

  /** Razões da prioridade. Ex: ["Queda de 30% na frequência"] */
  reasons: string[];

  /** Ação sugerida. Ex: "Conversa individual sobre motivação" */
  suggestedAction: string;
}

// ════════════════════════════════════════════════════════════════════
// ENGAGEMENT INPUT — Vetor de features para o engine
// ════════════════════════════════════════════════════════════════════

export interface EngagementInput {
  participantId: string;

  // ── Physical dimension ─────────────────────────────────────
  checkinsLast30Days: number;
  academyAvgCheckins: number;
  hoursReal: number;
  hoursExpected: number;
  currentStreak: number;

  // ── Pedagogical dimension ──────────────────────────────────
  overallScore: number;
  sublevelsGained90Days: number;
  maxSublevels: number;
  evaluationsApproved: number;
  evaluationsTotal: number;

  // ── Social dimension ───────────────────────────────────────
  rankingPositionNormalized: number;    // 0-100, top=100
  achievementsUnlocked: number;
  achievementsAvailable: number;
  socialConnectionScore: number;        // 0-100

  // ── Financial dimension ────────────────────────────────────
  paymentStatus: 'current' | 'overdue_15' | 'overdue_30' | 'paused' | 'cancelled';

  // ── Digital dimension ──────────────────────────────────────
  digitalCheckin: boolean;
  appAccessLast7Days: boolean;
  viewedContent: boolean;

  // ── Context ────────────────────────────────────────────────
  daysSinceEnrollment: number | null;
  previousOverallScore?: number;
}
