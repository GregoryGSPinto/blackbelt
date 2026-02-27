/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ENGAGEMENT SCORER — Motor de engajamento multi-dimensional     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Calcula score unificado a partir de 5 dimensões:               ║
 * ║    Physical (30%) + Pedagogical (25%) + Social (20%)            ║
 * ║    + Financial (15%) + Digital (10%)                            ║
 * ║                                                                 ║
 * ║  Input:  EngagementInput (dados já extraídos via ACL)           ║
 * ║  Output: EngagementScore (score + tier + atenção + tendência)   ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { EngagementInput, EngagementScore, EngagementDimensions, AttentionPriority } from '../models/engagement.types';
import type { EngagementTier, AttentionLevel, TrendDirection } from '../core/types';
import {
  clampScore,
  clampConfidence,
  safeDivide,
  classifyEngagementTier,
  computeAttentionLevel,
} from '../core/scoring-utils';
import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// DIMENSION WEIGHTS
// ════════════════════════════════════════════════════════════════════

const WEIGHTS = {
  physical: 0.30,
  pedagogical: 0.25,
  social: 0.20,
  financial: 0.15,
  digital: 0.10,
} as const;

// ════════════════════════════════════════════════════════════════════
// FINANCIAL STATUS SCORES
// ════════════════════════════════════════════════════════════════════

const FINANCIAL_SCORES: Record<EngagementInput['paymentStatus'], number> = {
  current: 100,
  overdue_15: 60,
  overdue_30: 30,
  paused: 10,
  cancelled: 0,
};

// ════════════════════════════════════════════════════════════════════
// TIER THRESHOLDS
// ════════════════════════════════════════════════════════════════════

const TIER_THRESHOLDS: { min: number; tier: EngagementTier }[] = [
  { min: 90, tier: 'champion' },
  { min: 70, tier: 'committed' },
  { min: 50, tier: 'active' },
  { min: 30, tier: 'drifting' },
  { min: 0, tier: 'disconnected' },
];

// ════════════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Computa score de engajamento unificado para um participante.
 *
 * @param input - Vetor de features de engajamento
 * @returns EngagementScore com score, tier, dimensões e tendência
 */
export function computeEngagementScore(input: EngagementInput): EngagementScore {
  // ── Compute each dimension ──────────────────────────────────
  const physicalScore = computePhysicalDimension(input);
  const pedagogicalScore = computePedagogicalDimension(input);
  const socialScore = computeSocialDimension(input);
  const financialScore = computeFinancialDimension(input);
  const digitalScore = computeDigitalDimension(input);

  const dimensions: EngagementDimensions = {
    physical: physicalScore,
    pedagogical: pedagogicalScore,
    social: socialScore,
    financial: financialScore,
    digital: digitalScore,
  };

  // ── Compute overall (weighted average) ──────────────────────
  const overall = clampScore(
    physicalScore * WEIGHTS.physical +
    pedagogicalScore * WEIGHTS.pedagogical +
    socialScore * WEIGHTS.social +
    financialScore * WEIGHTS.financial +
    digitalScore * WEIGHTS.digital,
  );

  // ── Classify tier ───────────────────────────────────────────
  const tier = classifyTier(overall);

  // ── Compute trend ───────────────────────────────────────────
  const { trend, trendDelta } = computeTrend(overall, input.previousOverallScore);

  // ── Compute attention priority ──────────────────────────────
  const attentionPriority = buildAttentionPriority(overall, trend, trendDelta, input);

  // ── Compute confidence ──────────────────────────────────────
  const availableDataPoints = countAvailableDataPoints(input);
  const totalDataPoints = 16; // total input fields used for scoring
  const confidence = calculateConfidence(
    availableDataPoints,
    totalDataPoints,
    input.daysSinceEnrollment,
  );

  return {
    participantId: input.participantId,
    overall,
    trend,
    trendDelta,
    dimensions,
    tier,
    tierSince: new Date().toISOString(), // Will be overridden by projector with real data
    attentionPriority,
    metadata: {
      computedAt: new Date().toISOString(),
      confidence,
      dataPoints: availableDataPoints,
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// PHYSICAL DIMENSION (30%)
// ════════════════════════════════════════════════════════════════════
// Formula: checkinsRatio * 40 + hoursRatio * 30 + streakFactor * 30

function computePhysicalDimension(input: EngagementInput): number {
  // Checkins ratio: participant vs academy average
  const checkinsRatio = safeDivide(input.checkinsLast30Days, input.academyAvgCheckins, 0);
  const checkinsScore = clampScore(checkinsRatio * 100);

  // Hours ratio: real vs expected
  const hoursRatio = safeDivide(input.hoursReal, input.hoursExpected, 0);
  const hoursScore = clampScore(hoursRatio * 100);

  // Streak factor: current streak up to 30 days = 100
  const streakFactor = clampScore(safeDivide(input.currentStreak, 30, 0) * 100);

  return clampScore(
    checkinsScore * 0.40 +
    hoursScore * 0.30 +
    streakFactor * 0.30,
  );
}

// ════════════════════════════════════════════════════════════════════
// PEDAGOGICAL DIMENSION (25%)
// ════════════════════════════════════════════════════════════════════
// Formula: overallScore * 0.4 + sublevelsRatio * 0.3 + evaluationsRatio * 0.3

function computePedagogicalDimension(input: EngagementInput): number {
  // Overall technical score (already 0-100)
  const techScore = clampScore(input.overallScore);

  // Sublevels gained ratio: gained / max possible
  const sublevelsRatio = safeDivide(input.sublevelsGained90Days, input.maxSublevels, 0);
  const sublevelsScore = clampScore(sublevelsRatio * 100);

  // Evaluations passed ratio
  const evalsRatio = safeDivide(input.evaluationsApproved, input.evaluationsTotal, 0);
  const evalsScore = clampScore(evalsRatio * 100);

  return clampScore(
    techScore * 0.40 +
    sublevelsScore * 0.30 +
    evalsScore * 0.30,
  );
}

// ════════════════════════════════════════════════════════════════════
// SOCIAL DIMENSION (20%)
// ════════════════════════════════════════════════════════════════════
// Formula: ranking * 0.3 + achievementsRatio * 0.3 + socialConnection * 0.4

function computeSocialDimension(input: EngagementInput): number {
  // Ranking position normalized (0-100, top=100)
  const rankingScore = clampScore(input.rankingPositionNormalized);

  // Achievements unlocked ratio
  const achievementsRatio = safeDivide(input.achievementsUnlocked, input.achievementsAvailable, 0);
  const achievementsScore = clampScore(achievementsRatio * 100);

  // Social connection score (from DNA or default 50)
  const socialScore = clampScore(input.socialConnectionScore);

  return clampScore(
    rankingScore * 0.30 +
    achievementsScore * 0.30 +
    socialScore * 0.40,
  );
}

// ════════════════════════════════════════════════════════════════════
// FINANCIAL DIMENSION (15%)
// ════════════════════════════════════════════════════════════════════
// Discrete mapping: current=100, overdue_15=60, overdue_30=30, paused=10, cancelled=0

function computeFinancialDimension(input: EngagementInput): number {
  return FINANCIAL_SCORES[input.paymentStatus] ?? 0;
}

// ════════════════════════════════════════════════════════════════════
// DIGITAL DIMENSION (10%)
// ════════════════════════════════════════════════════════════════════
// digitalCheckin=+20, appAccess=+40, viewedContent=+40
// If none tracked, default 50

function computeDigitalDimension(input: EngagementInput): number {
  const hasAnyDigitalData =
    input.digitalCheckin ||
    input.appAccessLast7Days ||
    input.viewedContent;

  // If no digital tracking at all, default to neutral 50
  if (!hasAnyDigitalData) return 50;

  let score = 0;
  if (input.digitalCheckin) score += 20;
  if (input.appAccessLast7Days) score += 40;
  if (input.viewedContent) score += 40;

  return clampScore(score);
}

// ════════════════════════════════════════════════════════════════════
// TIER CLASSIFICATION
// ════════════════════════════════════════════════════════════════════

function classifyTier(score: number): EngagementTier {
  for (const { min, tier } of TIER_THRESHOLDS) {
    if (score >= min) return tier;
  }
  return 'disconnected';
}

// ════════════════════════════════════════════════════════════════════
// TREND COMPUTATION
// ════════════════════════════════════════════════════════════════════

function computeTrend(
  current: number,
  previous?: number,
): { trend: TrendDirection; trendDelta: number } {
  if (previous === undefined || previous === null) {
    return { trend: 'stable', trendDelta: 0 };
  }

  const delta = current - previous;

  if (delta > 5) return { trend: 'rising', trendDelta: delta };
  if (delta < -5) return { trend: 'declining', trendDelta: delta };
  return { trend: 'stable', trendDelta: delta };
}

// ════════════════════════════════════════════════════════════════════
// ATTENTION PRIORITY
// ════════════════════════════════════════════════════════════════════

function buildAttentionPriority(
  overall: number,
  trend: TrendDirection,
  trendDelta: number,
  input: EngagementInput,
): AttentionPriority {
  const level = computeAttentionLevel(overall, trend, trendDelta);

  const reasons: string[] = [];
  const suggestedActions: string[] = [];

  // Level 1: Urgent attention
  if (level === 1) {
    reasons.push('Engajamento criticamente baixo com tendência de queda');
    suggestedActions.push('Conversa individual urgente sobre motivação e obstáculos');
  }

  // Level 2: High attention
  if (level <= 2) {
    if (overall < 50) reasons.push(`Score de engajamento baixo: ${overall}/100`);
    if (trend === 'declining') reasons.push(`Tendência de queda: ${trendDelta} pontos`);
    if (input.paymentStatus !== 'current') {
      reasons.push('Situação financeira irregular');
    }
    suggestedActions.push('Acompanhar presença e propor metas semanais acessíveis');
  }

  // Level 3: Moderate attention
  if (level === 3) {
    reasons.push('Engajamento moderado — oportunidade de melhoria');
    suggestedActions.push('Incluir em desafios e atividades de grupo');
  }

  // Level 4: Light monitoring
  if (level === 4) {
    reasons.push('Engajamento bom — manter o ritmo');
    suggestedActions.push('Reconhecer progresso e sugerir próximos objetivos');
  }

  // Level 5: Autonomous
  if (level === 5) {
    reasons.push('Engajamento excelente — aluno autônomo');
    suggestedActions.push('Pode atuar como referência para colegas');
  }

  return {
    level,
    reasons,
    suggestedAction: suggestedActions[0] ?? 'Monitorar evolução',
  };
}

// ════════════════════════════════════════════════════════════════════
// DATA POINT COUNTING
// ════════════════════════════════════════════════════════════════════

function countAvailableDataPoints(input: EngagementInput): number {
  let count = 0;

  // Physical
  if (input.checkinsLast30Days > 0 || input.academyAvgCheckins > 0) count++;
  if (input.hoursReal > 0 || input.hoursExpected > 0) count++;
  if (input.currentStreak >= 0) count++;

  // Pedagogical
  if (input.overallScore >= 0) count++;
  if (input.maxSublevels > 0) count++;
  if (input.evaluationsTotal > 0) count++;

  // Social
  if (input.rankingPositionNormalized >= 0) count++;
  if (input.achievementsAvailable > 0) count++;
  if (input.socialConnectionScore >= 0) count++;

  // Financial
  if (input.paymentStatus) count++;

  // Digital
  if (input.digitalCheckin !== undefined) count++;
  if (input.appAccessLast7Days !== undefined) count++;
  if (input.viewedContent !== undefined) count++;

  // Context
  if (input.daysSinceEnrollment !== null) count++;
  if (input.previousOverallScore !== undefined) count++;

  // Always have participantId
  count++;

  return count;
}
