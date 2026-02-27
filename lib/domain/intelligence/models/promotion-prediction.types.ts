/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROMOTION PREDICTION TYPES — Previsão de Promoção              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Prediz quando o aluno estará pronto para a próxima faixa.      ║
 * ║  Progresso por critério, aceleradores, bloqueadores e           ║
 * ║  comparação com pares da academia.                              ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Confidence,
  Percentage,
  IntelligenceMetadata,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// PROMOTION PREDICTION — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface PromotionPrediction {
  participantId: string;

  /** Milestone atual do aluno */
  currentMilestone: MilestoneRef;

  /** Milestone alvo (próxima faixa) */
  targetMilestone: MilestoneRef;

  // ── Previsão principal ──────────────────────────────────
  /** Data estimada de prontidão (ISO date) */
  estimatedReadyDate: string | null;

  /** Semanas estimadas até a promoção */
  estimatedWeeks: number | null;

  /** Confiança da predição (0-1) */
  confidence: Confidence;

  // ── Progresso por critério ──────────────────────────────
  criteriaProgress: CriterionProgress[];

  // ── Aceleradores e Bloqueadores ─────────────────────────
  /** Ex: ["Aumentar frequência para 4x/semana economiza 3 semanas"] */
  accelerators: string[];

  /** Ex: ["Competência 'raspagem' abaixo do mínimo (35/70)"] */
  blockers: string[];

  // ── Comparação com pares ────────────────────────────────
  peerComparison: PeerComparison;

  // ── Metadados ───────────────────────────────────────────
  metadata: IntelligenceMetadata;
}

// ════════════════════════════════════════════════════════════════════
// REFERÊNCIA DE MILESTONE
// ════════════════════════════════════════════════════════════════════

export interface MilestoneRef {
  id: string;
  name: string;
  order: number;
}

// ════════════════════════════════════════════════════════════════════
// PROGRESSO POR CRITÉRIO
// ════════════════════════════════════════════════════════════════════

export interface CriterionProgress {
  /** Tipo do critério (ex: 'min_sessions', 'min_time', competency ID) */
  criterionType: string;

  /** Valor atual */
  currentValue: number;

  /** Valor requerido para promoção */
  requiredValue: number;

  /** Progresso 0-100% */
  progress: Percentage;

  /** Data estimada de conclusão deste critério (ISO date) */
  estimatedCompletionDate: string | null;

  /** Unidades por semana (velocidade atual) */
  velocity: number;

  /** Se este critério está atrasando a promoção */
  isBlocker: boolean;
}

// ════════════════════════════════════════════════════════════════════
// COMPARAÇÃO COM PARES
// ════════════════════════════════════════════════════════════════════

export interface PeerComparison {
  /** Média de semanas da academia para mesma transição */
  avgWeeksForThisTransition: number;

  /** Em que percentil o aluno está (velocidade) */
  percentilePlacement: Percentage;

  /** Se o aluno está mais rápido que a média */
  fasterThanAverage: boolean;
}
