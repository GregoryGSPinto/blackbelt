/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CONFIDENCE CALCULATOR — Calcula confiança das predições        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Confiança baseada em volume de dados + idade do membro.        ║
 * ║  Pure function. Reutilizado por todos os engines.               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { clampConfidence } from './scoring-utils';

/** Enrollment age tiers for confidence adjustment */
const ENROLLMENT_TIERS = [
  { maxDays: 7, multiplier: 0.2 },    // Brand new
  { maxDays: 30, multiplier: 0.5 },   // First month
  { maxDays: 90, multiplier: 0.8 },   // First quarter
] as const;

/**
 * Calculate confidence score for intelligence output.
 *
 * @param availableDataPoints - How many features/metrics had data
 * @param totalDataPoints - Total possible features/metrics
 * @param daysSinceEnrollment - How long the member has been enrolled
 * @param totalEvents - How many events we have for this member
 * @returns Confidence 0-1
 */
export function calculateConfidence(
  availableDataPoints: number,
  totalDataPoints: number,
  daysSinceEnrollment: number | null,
  totalEvents?: number,
): number {
  // Base: data completeness
  let confidence = totalDataPoints > 0 ? availableDataPoints / totalDataPoints : 0;

  // Enrollment age penalty (cold start)
  if (daysSinceEnrollment !== null) {
    for (const tier of ENROLLMENT_TIERS) {
      if (daysSinceEnrollment < tier.maxDays) {
        confidence *= tier.multiplier;
        break;
      }
    }
  }

  // Bonus for high event count (more data = more reliable)
  if (totalEvents !== undefined && totalEvents > 0) {
    const eventBonus = Math.min(1, totalEvents / 100); // 100+ events = full bonus
    confidence = confidence * 0.8 + eventBonus * 0.2;
  }

  return clampConfidence(confidence);
}

/**
 * Calculate minimum events needed for reliable predictions.
 */
export function isReliable(confidence: number): boolean {
  return confidence >= 0.5;
}

/**
 * Get human-readable confidence label.
 */
export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'Alta';
  if (confidence >= 0.5) return 'Moderada';
  if (confidence >= 0.3) return 'Baixa';
  return 'Insuficiente';
}
