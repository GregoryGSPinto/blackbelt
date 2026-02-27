/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CHURN SCORE — Value Objects e tipos do modelo de churn         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Tipos puros do domínio. Sem side effects. Sem imports de infra.║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { RiskFactorType, RiskLevel } from './risk-factors';

// ════════════════════════════════════════════════════════════════════
// FEATURE VECTOR — Input para o motor de scoring
// ════════════════════════════════════════════════════════════════════

export interface ChurnFeatureVector {
  participantId: string;
  participantName: string;
  participantAvatar?: string;

  /** Frequência % no último mês (0-100). null = sem dados */
  attendancePercentage: number | null;

  /** Streak atual */
  currentStreak: number | null;

  /** Melhor streak histórico */
  bestStreak: number | null;

  /** Dias desde o último check-in */
  daysSinceLastCheckin: number | null;

  /** Meses no milestone atual */
  monthsInCurrentMilestone: number | null;

  /** Se o aluno tem sublevel atual < max (indica progressão recente) */
  hasRecentSublevelProgress: boolean;

  /** Problemas de pagamento: 0=ok, 1=atrasado, 2=suspenso, 3=cancelado, 4=múltiplas faturas */
  paymentIssueLevel: number | null;

  /** Overall engagement score (0-100) */
  overallScore: number | null;

  /** Tendência de pontos: % de mudança nas últimas 4 semanas (-100 a +100) */
  weeklyPointsTrend: number | null;

  /** Dias desde a matrícula (para ajustar confidence) */
  daysSinceEnrollment: number | null;

  /** Timestamp da coleta */
  collectedAt: string;
}

// ════════════════════════════════════════════════════════════════════
// CHURN FACTOR — Fator individual computado
// ════════════════════════════════════════════════════════════════════

export interface ChurnFactor {
  type: RiskFactorType;
  weight: number;
  riskLevel: RiskLevel;
  /** Valor real do feature */
  rawValue: number;
  /** Thresholds usados */
  threshold: { low: number; medium: number; high: number; critical: number };
  /** Contribuição para o score final (0-100) */
  contribution: number;
  /** Descrição legível: "14 dias sem check-in" */
  description: string;
}

// ════════════════════════════════════════════════════════════════════
// CHURN PREDICTION — Output do motor de scoring
// ════════════════════════════════════════════════════════════════════

export type ChurnRiskLevel = 'safe' | 'watch' | 'at_risk' | 'critical';

export interface ChurnPrediction {
  participantId: string;
  participantName: string;
  participantAvatar?: string;

  /** Score 0-100 (0=retido, 100=churn iminente) */
  score: number;

  /** Classificação de risco */
  riskLevel: ChurnRiskLevel;

  /** Fatores ativos ordenados por contribuição (desc) */
  factors: ChurnFactor[];

  /** Recomendações de ação */
  recommendations: Recommendation[];

  /** Confiança da predição (0-1) */
  confidence: number;

  /** Quando foi computado */
  computedAt: string;

  /** Qualidade dos dados usados */
  dataQuality: DataQuality;
}

export interface DataQuality {
  /** Quantos fatores tinham dados disponíveis */
  availableFactors: number;
  /** Total de fatores possíveis */
  totalFactors: number;
  /** Timestamp do dado mais antigo usado */
  oldestDataPoint: string;
  /** Ratio de dados disponíveis (0-1) */
  completeness: number;
}

// ════════════════════════════════════════════════════════════════════
// RECOMMENDATION — Ação sugerida
// ════════════════════════════════════════════════════════════════════

export interface Recommendation {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  action: string;
  targetRole: 'admin' | 'instructor' | 'system';
  automatable: boolean;
  relatedFactor: RiskFactorType;
}
