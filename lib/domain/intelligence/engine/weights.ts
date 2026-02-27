/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WEIGHTS — Pesos configuráveis por segmento                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Cada segmento pode ter pesos diferentes para os fatores.       ║
 * ║  Ex: Fitness valoriza mais streak, Martial Arts mais plateau.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { RiskFactorType } from '../models/risk-factors';
import { DEFAULT_RISK_FACTORS } from '../models/risk-factors';
import type { SegmentType } from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// SEGMENT WEIGHT OVERRIDES
// ════════════════════════════════════════════════════════════════════

type WeightOverrides = Partial<Record<RiskFactorType, number>>;

/**
 * Override de pesos por segmento.
 * Apenas os fatores listados são alterados; os demais mantêm o default.
 * Os pesos são renormalizados automaticamente para somar 100.
 */
const SEGMENT_WEIGHT_OVERRIDES: Partial<Record<SegmentType, WeightOverrides>> = {
  martial_arts: {
    // Default — sem overrides
  },
  fitness: {
    STREAK_BROKEN: 25,         // Fitness depende muito de hábito
    LONG_PLATEAU: 10,          // Menos relevante (sem faixa)
    ATTENDANCE_DROP: 25,
  },
  dance: {
    LONG_PLATEAU: 10,          // Repertório, sem faixa linear
    DECLINING_POINTS: 10,      // Performance matters
  },
  pilates: {
    STREAK_BROKEN: 25,         // Regularidade é chave
    LONG_PLATEAU: 5,           // Sem progressão hierárquica
    ATTENDANCE_DROP: 30,
  },
  music: {
    LOW_ENGAGEMENT_SCORE: 10,  // Avaliações importam mais
    LONG_PLATEAU: 20,          // Estagnação em nível = frustração
  },
};

// ════════════════════════════════════════════════════════════════════
// WEIGHT RESOLVER
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve pesos para um segmento, renormalizando para somar 100.
 */
export function resolveWeights(
  segmentType?: SegmentType,
): Record<RiskFactorType, number> {
  const overrides = segmentType ? SEGMENT_WEIGHT_OVERRIDES[segmentType] : undefined;

  // Start with defaults
  const raw: Record<string, number> = {};
  for (const [key, def] of Object.entries(DEFAULT_RISK_FACTORS)) {
    raw[key] = overrides?.[key as RiskFactorType] ?? def.weight;
  }

  // Normalize to sum 100
  const sum = Object.values(raw).reduce((a, b) => a + b, 0);
  if (sum === 0) return raw as Record<RiskFactorType, number>;

  const factor = 100 / sum;
  for (const key of Object.keys(raw)) {
    raw[key] = Math.round(raw[key] * factor * 100) / 100;
  }

  return raw as Record<RiskFactorType, number>;
}

// ════════════════════════════════════════════════════════════════════
// CHURN RISK LEVEL THRESHOLDS
// ════════════════════════════════════════════════════════════════════

/** Score thresholds para classificação de risco */
export const CHURN_LEVEL_THRESHOLDS = {
  safe: 25,        // 0-24 = safe
  watch: 45,       // 25-44 = watch
  at_risk: 70,     // 45-69 = at_risk
  critical: 100,   // 70-100 = critical
} as const;
