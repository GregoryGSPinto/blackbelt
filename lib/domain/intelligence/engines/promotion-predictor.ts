/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROMOTION PREDICTOR — Predição de Promoção de Faixa            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Estima readiness score, data de promoção, bloqueadores e       ║
 * ║  aceleradores. Compara com velocidade média dos pares.          ║
 * ║                                                                 ║
 * ║  Input:  PromotionInput (critérios + velocidade + contexto)     ║
 * ║  Output: PromotionPrediction (readiness + ETA + blockers)       ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  PromotionInput,
  PromotionCriterion,
  PromotionPrediction,
  PromotionBlocker,
  PromotionAccelerator,
} from '../models/promotion.types';
import {
  clampScore,
  safeDivide,
  weightedAverage,
} from '../core/scoring-utils';
import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// ENGAGEMENT BOOST FACTORS
// ════════════════════════════════════════════════════════════════════

const ENGAGEMENT_VELOCITY_MULTIPLIERS: Record<string, number> = {
  champion: 1.2,     // High engagement speeds up
  committed: 1.1,
  active: 1.0,       // Baseline
  drifting: 0.8,     // Low engagement slows down
  disconnected: 0.5,
};

// ════════════════════════════════════════════════════════════════════
// MAIN PREDICTION FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Prediz readiness e tempo estimado para promoção.
 *
 * @param input - Dados de critérios, velocidade e contexto
 * @returns PromotionPrediction com readiness, ETA, blockers e accelerators
 */
export function predictPromotion(input: PromotionInput): PromotionPrediction {
  // ── Compute readiness score ─────────────────────────────────
  const readinessScore = computeReadinessScore(input);

  // ── Identify blockers ───────────────────────────────────────
  const blockers = identifyBlockers(input);

  // ── Estimate days to promotion ──────────────────────────────
  const estimatedDays = estimateDaysToPromotion(input, blockers);

  // ── Compute estimated date ──────────────────────────────────
  const estimatedDate = estimatedDays !== null
    ? computeEstimatedDate(estimatedDays)
    : null;

  // ── Identify accelerators ──────────────────────────────────
  const accelerators = identifyAccelerators(input, blockers);

  // ── Peer comparison ─────────────────────────────────────────
  const peerComparison = computePeerComparison(input, estimatedDays);

  // ── Confidence ──────────────────────────────────────────────
  const criteriaWithVelocity = input.criteria.filter(
    c => input.weeklyVelocity[c.id] !== undefined && input.weeklyVelocity[c.id] > 0,
  ).length;
  const confidence = calculateConfidence(
    criteriaWithVelocity + (input.peerAvgDaysToPromote > 0 ? 1 : 0),
    input.criteria.length + 1,
    null, // not enrollment-dependent for this engine
  );

  return {
    participantId: input.participantId,
    participantName: input.participantName,
    currentMilestone: input.currentMilestone,
    nextMilestone: input.nextMilestone,
    readinessScore,
    estimatedDaysToPromotion: estimatedDays,
    estimatedDate,
    blockers,
    accelerators,
    peerComparison,
    confidence,
    computedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// READINESS SCORE
// ════════════════════════════════════════════════════════════════════

function computeReadinessScore(input: PromotionInput): number {
  if (input.criteria.length === 0) return 0;

  // Weighted average of individual criterion completion percentages
  const items = input.criteria.map(criterion => {
    const completion = safeDivide(criterion.currentValue, criterion.requiredValue, 0);
    return {
      value: Math.min(completion, 1) * 100,
      weight: criterion.weight,
    };
  });

  const baseReadiness = weightedAverage(items);

  // Apply engagement modifier (+/- 10%)
  const engagementModifier = getEngagementModifier(input.engagementScore);

  // Apply consistency modifier (+/- 5%)
  const consistencyModifier = getConsistencyModifier(input.consistencyScore);

  // Apply churn risk penalty (high churn = unlikely to reach promotion)
  const churnPenalty = input.churnRisk > 70 ? -10 : input.churnRisk > 50 ? -5 : 0;

  return clampScore(baseReadiness + engagementModifier + consistencyModifier + churnPenalty);
}

function getEngagementModifier(engagementScore: number): number {
  if (engagementScore >= 90) return 10;
  if (engagementScore >= 70) return 5;
  if (engagementScore >= 50) return 0;
  if (engagementScore >= 30) return -5;
  return -10;
}

function getConsistencyModifier(consistencyScore: number): number {
  if (consistencyScore >= 80) return 5;
  if (consistencyScore >= 60) return 2;
  if (consistencyScore >= 40) return 0;
  return -5;
}

// ════════════════════════════════════════════════════════════════════
// BLOCKER IDENTIFICATION
// ════════════════════════════════════════════════════════════════════

function identifyBlockers(input: PromotionInput): PromotionBlocker[] {
  const blockers: PromotionBlocker[] = [];

  for (const criterion of input.criteria) {
    const gap = criterion.requiredValue - criterion.currentValue;

    // Only flag as blocker if there's a meaningful gap
    if (gap <= 0) continue;

    const velocity = input.weeklyVelocity[criterion.id] ?? 0;
    const estimatedDaysToClose = velocity > 0
      ? Math.ceil((gap / velocity) * 7) // convert weeks to days
      : null;

    const suggestion = buildBlockerSuggestion(criterion, gap, velocity);

    blockers.push({
      criterionId: criterion.id,
      criterionName: criterion.name,
      gap: Math.round(gap * 100) / 100,
      estimatedDaysToClose,
      suggestion,
    });
  }

  // Sort by estimated days (null = longest, then by gap size)
  blockers.sort((a, b) => {
    if (a.estimatedDaysToClose === null && b.estimatedDaysToClose === null) {
      return b.gap - a.gap;
    }
    if (a.estimatedDaysToClose === null) return 1;
    if (b.estimatedDaysToClose === null) return -1;
    return b.estimatedDaysToClose - a.estimatedDaysToClose;
  });

  return blockers;
}

function buildBlockerSuggestion(
  criterion: PromotionCriterion,
  gap: number,
  velocity: number,
): string {
  if (velocity === 0) {
    return `Sem progresso recente em "${criterion.name}". Priorize esta competência nas próximas aulas.`;
  }

  const weeksNeeded = Math.ceil(gap / velocity);

  if (weeksNeeded > 12) {
    return `"${criterion.name}" precisa de atenção especial — ${Math.round(gap)} unidades pendentes. Considere aulas extras ou treino dirigido.`;
  }

  if (weeksNeeded > 4) {
    return `"${criterion.name}" no ritmo atual levará ~${weeksNeeded} semanas. Intensificar treino pode acelerar.`;
  }

  return `"${criterion.name}" quase lá — faltam ${Math.round(gap)} unidades (~${weeksNeeded} semanas no ritmo atual).`;
}

// ════════════════════════════════════════════════════════════════════
// DAYS TO PROMOTION ESTIMATION
// ════════════════════════════════════════════════════════════════════

function estimateDaysToPromotion(
  input: PromotionInput,
  blockers: PromotionBlocker[],
): number | null {
  if (blockers.length === 0) return 0; // All criteria met

  // Find the longest blocker (bottleneck)
  const estimatedDays = blockers
    .map(b => b.estimatedDaysToClose)
    .filter((d): d is number => d !== null);

  if (estimatedDays.length === 0) return null; // No velocity data

  const maxDays = Math.max(...estimatedDays);

  // Apply engagement velocity multiplier
  const engagementMultiplier = getEngagementVelocityMultiplier(input.engagementScore);

  // Adjusted estimate
  const adjusted = Math.round(maxDays / engagementMultiplier);

  return adjusted;
}

function getEngagementVelocityMultiplier(engagementScore: number): number {
  if (engagementScore >= 90) return 1.2;
  if (engagementScore >= 70) return 1.1;
  if (engagementScore >= 50) return 1.0;
  if (engagementScore >= 30) return 0.8;
  return 0.5;
}

function computeEstimatedDate(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ════════════════════════════════════════════════════════════════════
// ACCELERATOR IDENTIFICATION
// ════════════════════════════════════════════════════════════════════

function identifyAccelerators(
  input: PromotionInput,
  blockers: PromotionBlocker[],
): PromotionAccelerator[] {
  const accelerators: PromotionAccelerator[] = [];

  // ── Increase training frequency ─────────────────────────────
  if (input.consistencyScore < 70) {
    const potentialSaved = Math.round(
      blockers.reduce((sum, b) => sum + (b.estimatedDaysToClose ?? 0), 0) * 0.15,
    );
    if (potentialSaved > 0) {
      accelerators.push({
        description: 'Aumentar frequência de treino para 3+ sessões/semana pode acelerar todas as competências',
        potentialDaysSaved: potentialSaved,
      });
    }
  }

  // ── Focus on slowest criterion ──────────────────────────────
  const slowestBlocker = blockers.find(b => b.estimatedDaysToClose !== null);
  if (slowestBlocker && slowestBlocker.estimatedDaysToClose !== null) {
    accelerators.push({
      description: `Foco extra em "${slowestBlocker.criterionName}" — é o gargalo principal`,
      potentialDaysSaved: Math.round(slowestBlocker.estimatedDaysToClose * 0.2),
      criterionId: slowestBlocker.criterionId,
    });
  }

  // ── Private lessons ─────────────────────────────────────────
  const zeroVelocityBlockers = blockers.filter(b => b.estimatedDaysToClose === null);
  if (zeroVelocityBlockers.length > 0) {
    accelerators.push({
      description: `Aula particular focada em: ${zeroVelocityBlockers.map(b => b.criterionName).join(', ')}`,
      potentialDaysSaved: 14, // rough estimate
    });
  }

  // ── Engagement boost ────────────────────────────────────────
  if (input.engagementScore < 70) {
    const currentMultiplier = getEngagementVelocityMultiplier(input.engagementScore);
    const targetMultiplier = 1.1; // committed level
    const speedup = targetMultiplier / currentMultiplier;

    const longestBlocker = blockers
      .map(b => b.estimatedDaysToClose)
      .filter((d): d is number => d !== null);

    if (longestBlocker.length > 0) {
      const maxDays = Math.max(...longestBlocker);
      const daysSaved = Math.round(maxDays - maxDays / speedup);
      if (daysSaved > 0) {
        accelerators.push({
          description: 'Melhorar engajamento geral (participação, presença, treino em grupo) acelera progressão',
          potentialDaysSaved: daysSaved,
        });
      }
    }
  }

  // Sort by potential savings
  accelerators.sort((a, b) => b.potentialDaysSaved - a.potentialDaysSaved);

  return accelerators;
}

// ════════════════════════════════════════════════════════════════════
// PEER COMPARISON
// ════════════════════════════════════════════════════════════════════

function computePeerComparison(
  input: PromotionInput,
  estimatedDays: number | null,
): PromotionPrediction['peerComparison'] {
  const totalEstimatedDays = estimatedDays !== null
    ? input.daysSinceLastPromotion + estimatedDays
    : null;

  // Percentile: how does participant compare to peers?
  // Lower total days = higher percentile (faster promotion)
  let percentile = 50; // default
  if (totalEstimatedDays !== null && input.peerAvgDaysToPromote > 0) {
    const ratio = safeDivide(totalEstimatedDays, input.peerAvgDaysToPromote, 1);
    // ratio < 1 = faster = higher percentile
    // ratio = 0.5 = twice as fast = ~95th percentile
    // ratio = 1.0 = average = 50th percentile
    // ratio = 2.0 = twice as slow = ~5th percentile
    percentile = clampScore(Math.round((1 - (ratio - 0.5) / 1.5) * 100));
  }

  return {
    averageDays: input.peerAvgDaysToPromote,
    participantEstimate: totalEstimatedDays,
    percentile,
  };
}
