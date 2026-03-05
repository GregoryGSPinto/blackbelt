/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CHURN ENGINE — Motor de scoring puro                           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Segue o padrão dos 8 projectors existentes.                   ║
 * ║                                                                 ║
 * ║  Input:  ChurnFeatureVector (dados já extraídos via ACL)       ║
 * ║  Output: ChurnPrediction (score + fatores + recomendações)     ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  ChurnFeatureVector,
  ChurnPrediction,
  ChurnFactor,
  ChurnRiskLevel,
  Recommendation,
} from '../models/churn-score';
import type { RiskFactorType, RiskLevel, RiskFactorDefinition } from '../models/risk-factors';
import { DEFAULT_RISK_FACTORS, RISK_LEVEL_MULTIPLIERS } from '../models/risk-factors';
import { CHURN_LEVEL_THRESHOLDS } from './weights';
import type { SegmentType } from '@/lib/domain';
import { resolveWeights } from './weights';
import { utcNow } from '../../shared/time';

// ════════════════════════════════════════════════════════════════════
// MAIN PREDICTION FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Prediz risco de churn para um participante.
 *
 * @param features - Vetor de features extraído via ACL
 * @param segmentType - Tipo de segmento (afeta pesos)
 * @returns ChurnPrediction com score, fatores e recomendações
 */
export function predictChurn(
  features: ChurnFeatureVector,
  segmentType?: SegmentType,
): ChurnPrediction {
  const weights = resolveWeights(segmentType);
  const factors: ChurnFactor[] = [];
  let availableFactors = 0;
  const totalFactors = Object.keys(DEFAULT_RISK_FACTORS).length;

  // Compute each factor
  for (const [key, definition] of Object.entries(DEFAULT_RISK_FACTORS)) {
    const factorType = key as RiskFactorType;
    const rawValue = extractRawValue(features, factorType);

    if (rawValue === null) {
      // Skip factors with no data
      continue;
    }

    availableFactors++;
    const weight = weights[factorType];
    const riskLevel = computeRiskLevel(rawValue, definition);
    const multiplier = RISK_LEVEL_MULTIPLIERS[riskLevel];
    const contribution = weight * multiplier;

    factors.push({
      type: factorType,
      weight,
      riskLevel,
      rawValue,
      threshold: definition.thresholds,
      contribution,
      description: buildFactorDescription(factorType, rawValue, riskLevel),
    });
  }

  // Sort factors by contribution (desc)
  factors.sort((a, b) => b.contribution - a.contribution);

  // Calculate total score (0-100)
  const rawScore = factors.reduce((sum, f) => sum + f.contribution, 0);
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  // Classify risk level
  const riskLevel = classifyRiskLevel(score);

  // Calculate confidence
  const confidence = computeConfidence(features, availableFactors, totalFactors);

  // Generate recommendations
  const recommendations = generateRecommendations(factors, riskLevel);

  return {
    participantId: features.participantId,
    participantName: features.participantName,
    participantAvatar: features.participantAvatar,
    score,
    riskLevel,
    factors,
    recommendations,
    confidence,
    computedAt: utcNow(),
    dataQuality: {
      availableFactors,
      totalFactors,
      oldestDataPoint: features.collectedAt,
      completeness: availableFactors / totalFactors,
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// EXTRACT RAW VALUE FROM FEATURES
// ════════════════════════════════════════════════════════════════════

function extractRawValue(
  features: ChurnFeatureVector,
  factorType: RiskFactorType,
): number | null {
  switch (factorType) {
    case 'ATTENDANCE_DROP':
      return features.attendancePercentage;

    case 'STREAK_BROKEN': {
      if (features.currentStreak === null || features.bestStreak === null) return null;
      if (features.bestStreak === 0) return 100; // Nunca teve streak → sem risco por este fator
      return Math.round((features.currentStreak / features.bestStreak) * 100);
    }

    case 'DAYS_SINCE_LAST_CHECKIN':
      return features.daysSinceLastCheckin;

    case 'LONG_PLATEAU': {
      if (features.monthsInCurrentMilestone === null) return null;
      // Se tem progressão recente de sublevel, reduz em 50%
      const months = features.monthsInCurrentMilestone;
      return features.hasRecentSublevelProgress ? Math.round(months * 0.5) : months;
    }

    case 'PAYMENT_ISSUES':
      return features.paymentIssueLevel;

    case 'LOW_ENGAGEMENT_SCORE':
      return features.overallScore;

    case 'DECLINING_POINTS':
      return features.weeklyPointsTrend;

    default:
      return null;
  }
}

// ════════════════════════════════════════════════════════════════════
// RISK LEVEL COMPUTATION
// ════════════════════════════════════════════════════════════════════

function computeRiskLevel(
  rawValue: number,
  definition: RiskFactorDefinition,
): RiskLevel {
  const { thresholds, direction } = definition;

  if (direction === 'asc') {
    // Higher value = higher risk (e.g., days since checkin)
    if (rawValue >= thresholds.critical) return 'critical';
    if (rawValue >= thresholds.high) return 'high';
    if (rawValue >= thresholds.medium) return 'medium';
    if (rawValue >= thresholds.low) return 'low';
    return 'none';
  } else {
    // Lower value = higher risk (e.g., attendance %)
    if (rawValue <= thresholds.critical) return 'critical';
    if (rawValue <= thresholds.high) return 'high';
    if (rawValue <= thresholds.medium) return 'medium';
    if (rawValue <= thresholds.low) return 'low';
    return 'none';
  }
}

// ════════════════════════════════════════════════════════════════════
// RISK LEVEL CLASSIFICATION
// ════════════════════════════════════════════════════════════════════

function classifyRiskLevel(score: number): ChurnRiskLevel {
  if (score >= CHURN_LEVEL_THRESHOLDS.at_risk) return 'critical';
  if (score >= CHURN_LEVEL_THRESHOLDS.watch) return 'at_risk';
  if (score >= CHURN_LEVEL_THRESHOLDS.safe) return 'watch';
  return 'safe';
}

// ════════════════════════════════════════════════════════════════════
// CONFIDENCE CALCULATION
// ════════════════════════════════════════════════════════════════════

function computeConfidence(
  features: ChurnFeatureVector,
  availableFactors: number,
  totalFactors: number,
): number {
  // Base confidence from data completeness
  let confidence = availableFactors / totalFactors;

  // Reduce confidence for new members (cold start)
  if (features.daysSinceEnrollment !== null) {
    if (features.daysSinceEnrollment < 7) {
      confidence *= 0.2;
    } else if (features.daysSinceEnrollment < 30) {
      confidence *= 0.5;
    } else if (features.daysSinceEnrollment < 90) {
      confidence *= 0.8;
    }
    // 90+ days = full confidence multiplier
  }

  return Math.round(confidence * 100) / 100;
}

// ════════════════════════════════════════════════════════════════════
// FACTOR DESCRIPTIONS
// ════════════════════════════════════════════════════════════════════

function buildFactorDescription(
  type: RiskFactorType,
  rawValue: number,
  riskLevel: RiskLevel,
): string {
  if (riskLevel === 'none') {
    return descriptionMap[type].safe;
  }

  switch (type) {
    case 'ATTENDANCE_DROP':
      return `Frequência em ${rawValue}% no último período`;
    case 'STREAK_BROKEN':
      return `Sequência atual é ${rawValue}% da melhor`;
    case 'DAYS_SINCE_LAST_CHECKIN':
      return `${rawValue} dias sem check-in`;
    case 'LONG_PLATEAU':
      return `${rawValue} meses no mesmo nível`;
    case 'PAYMENT_ISSUES':
      return paymentDescription(rawValue);
    case 'LOW_ENGAGEMENT_SCORE':
      return `Score de engajamento: ${rawValue}/100`;
    case 'DECLINING_POINTS':
      return `Pontos com tendência de ${rawValue > 0 ? '+' : ''}${rawValue}%`;
    default:
      return '';
  }
}

function paymentDescription(level: number): string {
  switch (level) {
    case 1: return 'Fatura com pagamento atrasado';
    case 2: return 'Assinatura suspensa';
    case 3: return 'Assinatura cancelada';
    case 4: return 'Múltiplas faturas em atraso';
    default: return 'Pagamento em dia';
  }
}

const descriptionMap: Record<RiskFactorType, { safe: string }> = {
  ATTENDANCE_DROP: { safe: 'Frequência dentro do esperado' },
  STREAK_BROKEN: { safe: 'Sequência mantida' },
  DAYS_SINCE_LAST_CHECKIN: { safe: 'Check-in recente' },
  LONG_PLATEAU: { safe: 'Progressão adequada' },
  PAYMENT_ISSUES: { safe: 'Pagamento em dia' },
  LOW_ENGAGEMENT_SCORE: { safe: 'Engajamento satisfatório' },
  DECLINING_POINTS: { safe: 'Pontos estáveis ou em crescimento' },
};

// ════════════════════════════════════════════════════════════════════
// RECOMMENDATION ENGINE
// ════════════════════════════════════════════════════════════════════

function generateRecommendations(
  factors: ChurnFactor[],
  overallRisk: ChurnRiskLevel,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Only active factors (non-none)
  const activeFactors = factors.filter(f => f.riskLevel !== 'none');

  for (const factor of activeFactors) {
    const recs = RECOMMENDATION_MAP[factor.type];
    if (!recs) continue;

    for (const rec of recs) {
      if (meetsMinimumRisk(factor.riskLevel, rec.minRisk)) {
        recommendations.push({
          priority: mapPriority(factor.riskLevel, overallRisk),
          action: rec.action,
          targetRole: rec.targetRole,
          automatable: rec.automatable,
          relatedFactor: factor.type,
        });
      }
    }
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

function meetsMinimumRisk(actual: RiskLevel, minimum: RiskLevel): boolean {
  const order: Record<RiskLevel, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
  return order[actual] >= order[minimum];
}

function mapPriority(
  factorRisk: RiskLevel,
  overallRisk: ChurnRiskLevel,
): Recommendation['priority'] {
  if (overallRisk === 'critical' || factorRisk === 'critical') return 'urgent';
  if (overallRisk === 'at_risk' || factorRisk === 'high') return 'high';
  if (factorRisk === 'medium') return 'medium';
  return 'low';
}

interface RecommendationTemplate {
  action: string;
  targetRole: Recommendation['targetRole'];
  automatable: boolean;
  minRisk: RiskLevel;
}

const RECOMMENDATION_MAP: Record<RiskFactorType, RecommendationTemplate[]> = {
  ATTENDANCE_DROP: [
    { action: 'Enviar mensagem de reengajamento personalizada', targetRole: 'system', automatable: true, minRisk: 'medium' },
    { action: 'Agendar conversa individual com o aluno', targetRole: 'instructor', automatable: false, minRisk: 'high' },
  ],
  STREAK_BROKEN: [
    { action: 'Enviar notificação motivacional de recuperação de sequência', targetRole: 'system', automatable: true, minRisk: 'medium' },
    { action: 'Oferecer aula experimental gratuita para reativação', targetRole: 'admin', automatable: false, minRisk: 'high' },
  ],
  DAYS_SINCE_LAST_CHECKIN: [
    { action: 'Enviar lembrete de próxima aula disponível', targetRole: 'system', automatable: true, minRisk: 'low' },
    { action: 'Ligar para o aluno para entender ausência', targetRole: 'admin', automatable: false, minRisk: 'high' },
    { action: 'Enviar oferta de retorno com benefício', targetRole: 'admin', automatable: true, minRisk: 'critical' },
  ],
  LONG_PLATEAU: [
    { action: 'Agendar avaliação de progresso com instrutor', targetRole: 'instructor', automatable: false, minRisk: 'medium' },
    { action: 'Sugerir aula particular para acelerar evolução', targetRole: 'instructor', automatable: false, minRisk: 'high' },
  ],
  PAYMENT_ISSUES: [
    { action: 'Enviar lembrete de pagamento pendente', targetRole: 'system', automatable: true, minRisk: 'low' },
    { action: 'Oferecer renegociação ou plano alternativo', targetRole: 'admin', automatable: false, minRisk: 'high' },
  ],
  LOW_ENGAGEMENT_SCORE: [
    { action: 'Sugerir conteúdos e desafios personalizados', targetRole: 'system', automatable: true, minRisk: 'medium' },
    { action: 'Incluir aluno em grupo de desafio semanal', targetRole: 'instructor', automatable: false, minRisk: 'high' },
  ],
  DECLINING_POINTS: [
    { action: 'Destacar conquistas disponíveis próximas', targetRole: 'system', automatable: true, minRisk: 'medium' },
    { action: 'Criar meta personalizada de pontos semanais', targetRole: 'instructor', automatable: false, minRisk: 'high' },
  ],
};
