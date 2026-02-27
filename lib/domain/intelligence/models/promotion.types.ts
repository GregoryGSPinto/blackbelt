/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROMOTION TYPES — Predição de Promoção de Faixa               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Input e Output do engine de predição de promoção.              ║
 * ║  Estima readiness, data provável e bloqueadores.                ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  Confidence,
  Percentage,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// PROMOTION INPUT — Dados de entrada
// ════════════════════════════════════════════════════════════════════

export interface PromotionCriterion {
  id: string;
  name: string;
  currentValue: number;
  requiredValue: number;
  weight: number;
}

export interface PromotionInput {
  participantId: string;
  participantName: string;
  currentMilestone: string;
  nextMilestone: string;
  criteria: PromotionCriterion[];
  weeklyVelocity: Record<string, number>; // criterion id -> units/week
  daysSinceLastPromotion: number;
  peerAvgDaysToPromote: number;
  engagementScore: Score0to100;
  consistencyScore: Score0to100;
  churnRisk: Score0to100;
}

// ════════════════════════════════════════════════════════════════════
// PROMOTION BLOCKERS & ACCELERATORS
// ════════════════════════════════════════════════════════════════════

export interface PromotionBlocker {
  criterionId: string;
  criterionName: string;
  gap: number;
  estimatedDaysToClose: number | null;
  suggestion: string;
}

export interface PromotionAccelerator {
  description: string;
  potentialDaysSaved: number;
  criterionId?: string;
}

// ════════════════════════════════════════════════════════════════════
// PROMOTION PREDICTION — Output principal
// ════════════════════════════════════════════════════════════════════

export interface PromotionPrediction {
  participantId: string;
  participantName: string;
  currentMilestone: string;
  nextMilestone: string;
  readinessScore: Score0to100;
  estimatedDaysToPromotion: number | null;
  estimatedDate: string | null;
  blockers: PromotionBlocker[];
  accelerators: PromotionAccelerator[];
  peerComparison: {
    averageDays: number;
    participantEstimate: number | null;
    percentile: Percentage;
  };
  confidence: Confidence;
  computedAt: string;
}
