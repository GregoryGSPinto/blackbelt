/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  RISK FACTORS — Definição dos fatores de risco de evasão        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Cada fator tem um peso configurável e thresholds escalonados. ║
 * ║  Total de pesos: 100.                                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════
// RISK FACTOR TYPE
// ════════════════════════════════════════════════════════════════════

export type RiskFactorType =
  | 'ATTENDANCE_DROP'
  | 'STREAK_BROKEN'
  | 'DAYS_SINCE_LAST_CHECKIN'
  | 'LONG_PLATEAU'
  | 'PAYMENT_ISSUES'
  | 'LOW_ENGAGEMENT_SCORE'
  | 'DECLINING_POINTS';

// ════════════════════════════════════════════════════════════════════
// RISK LEVEL
// ════════════════════════════════════════════════════════════════════

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

/** Multiplier applied to weight based on risk level */
export const RISK_LEVEL_MULTIPLIERS: Record<RiskLevel, number> = {
  none: 0,
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  critical: 1.0,
};

// ════════════════════════════════════════════════════════════════════
// RISK FACTOR DEFINITION
// ════════════════════════════════════════════════════════════════════

export interface RiskFactorDefinition {
  type: RiskFactorType;
  /** Peso do fator (soma de todos = 100) */
  weight: number;
  /** Thresholds escalonados para cada nível de risco */
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  /** Descrição do fator para UI */
  label: string;
  /** Direção: 'asc' = valor maior = mais risco, 'desc' = valor menor = mais risco */
  direction: 'asc' | 'desc';
}

// ════════════════════════════════════════════════════════════════════
// DEFAULT FACTOR DEFINITIONS
// ════════════════════════════════════════════════════════════════════

export const DEFAULT_RISK_FACTORS: Record<RiskFactorType, RiskFactorDefinition> = {
  ATTENDANCE_DROP: {
    type: 'ATTENDANCE_DROP',
    weight: 25,
    thresholds: { low: 70, medium: 50, high: 35, critical: 20 },
    label: 'Queda de frequência',
    direction: 'desc', // menor % = mais risco
  },
  STREAK_BROKEN: {
    type: 'STREAK_BROKEN',
    weight: 20,
    thresholds: { low: 60, medium: 40, high: 20, critical: 5 },
    label: 'Sequência quebrada',
    direction: 'desc', // menor ratio current/best = mais risco
  },
  DAYS_SINCE_LAST_CHECKIN: {
    type: 'DAYS_SINCE_LAST_CHECKIN',
    weight: 20,
    thresholds: { low: 5, medium: 10, high: 14, critical: 21 },
    label: 'Dias sem check-in',
    direction: 'asc', // mais dias = mais risco
  },
  LONG_PLATEAU: {
    type: 'LONG_PLATEAU',
    weight: 15,
    thresholds: { low: 4, medium: 6, high: 10, critical: 18 },
    label: 'Estagnação no nível',
    direction: 'asc', // mais meses = mais risco
  },
  PAYMENT_ISSUES: {
    type: 'PAYMENT_ISSUES',
    weight: 10,
    thresholds: { low: 1, medium: 2, high: 3, critical: 4 },
    label: 'Problemas financeiros',
    direction: 'asc', // mais issues = mais risco
  },
  LOW_ENGAGEMENT_SCORE: {
    type: 'LOW_ENGAGEMENT_SCORE',
    weight: 5,
    thresholds: { low: 50, medium: 30, high: 15, critical: 5 },
    label: 'Engajamento baixo',
    direction: 'desc', // menor score = mais risco
  },
  DECLINING_POINTS: {
    type: 'DECLINING_POINTS',
    weight: 5,
    thresholds: { low: -10, medium: -25, high: -50, critical: -75 },
    label: 'Pontos em declínio',
    direction: 'desc', // mais negativo = mais risco
  },
};
