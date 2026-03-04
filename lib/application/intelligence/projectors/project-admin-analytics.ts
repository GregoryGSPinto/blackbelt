/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ADMIN AI ANALYTICS PROJECTOR — ViewModel do Admin              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Agrega dados de todos os engines para apresentar ao admin:     ║
 * ║  saude da academia, mapa de risco, predicoes, insights e        ║
 * ║  metricas de performance por instrutor.                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ChurnPrediction } from '@/lib/domain/intelligence';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';
import type { ClassInsight } from '@/lib/domain/intelligence/models/class-insight.types';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface AdminAIAnalyticsVM {
  academyHealth: {
    overallScore: number;
    trend: string;
    retention: { value: number; label: string };
    engagement: { value: number; label: string };
    revenue: { value: number; label: string };
    growth: { value: number; label: string };
  };
  riskMap: {
    critical: RiskGroupVM;
    atRisk: RiskGroupVM;
    watch: RiskGroupVM;
    safe: RiskGroupVM;
    champion: RiskGroupVM;
  };
  predictions: {
    expectedChurnNext30Days: number;
    expectedRevenueImpact: number;
    highestRiskFactor: string;
    avgChurnScore: number;
    trendVsLastMonth: string;
  };
  actionableInsights: ActionableInsightVM[];
  classesNeedingAttention: ClassAttentionVM[];
  instructorPerformance: InstructorPerformanceVM[];
  aiSystemMetrics: {
    predictionsGenerated: number;
    alertsGenerated: number;
    avgConfidence: number;
    lastComputedAt: string;
  };
}

export interface RiskGroupVM {
  count: number;
  percentage: number;
  topStudents: { id: string; name: string; score: number }[];
}

export interface ActionableInsightVM {
  priority: string;
  category: string;
  title: string;
  description: string;
  estimatedImpact: string;
  suggestedAction: string;
}

export interface ClassAttentionVM {
  classId: string;
  className: string;
  issue: string;
  healthScore: number;
  recommendation: string;
}

export interface InstructorPerformanceVM {
  instructorId: string;
  name: string;
  studentsRetentionRate: number;
  avgStudentEngagement: number;
  classCount: number;
  avgClassHealth: number;
}

// ════════════════════════════════════════════════════════════════════
// INPUT TYPES
// ════════════════════════════════════════════════════════════════════

export interface InstructorData {
  instructorId: string;
  name: string;
  classIds: string[];
  studentMembershipIds: string[];
}

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectAdminAnalytics(
  predictions: ChurnPrediction[],
  engagements: EngagementScore[],
  classInsights: ClassInsight[],
  instructorData: InstructorData[],
): AdminAIAnalyticsVM {
  return {
    academyHealth: buildAcademyHealth(predictions, engagements, classInsights),
    riskMap: buildRiskMap(predictions),
    predictions: buildPredictions(predictions),
    actionableInsights: buildActionableInsights(predictions, engagements, classInsights),
    classesNeedingAttention: buildClassesNeedingAttention(classInsights),
    instructorPerformance: buildInstructorPerformance(instructorData, engagements, classInsights),
    aiSystemMetrics: buildAISystemMetrics(predictions, engagements, classInsights),
  };
}

// ════════════════════════════════════════════════════════════════════
// ACADEMY HEALTH
// ════════════════════════════════════════════════════════════════════

function buildAcademyHealth(
  predictions: ChurnPrediction[],
  engagements: EngagementScore[],
  classInsights: ClassInsight[],
): AdminAIAnalyticsVM['academyHealth'] {
  // Overall score: weighted combination of engagement, retention, class health
  const avgEngagement = engagements.length > 0
    ? Math.round(engagements.reduce((sum, e) => sum + e.overall, 0) / engagements.length)
    : 0;

  const avgClassHealth = classInsights.length > 0
    ? Math.round(classInsights.reduce((sum, c) => sum + c.health.score, 0) / classInsights.length)
    : 0;

  const safeCount = predictions.filter(p => p.riskLevel === 'safe').length;
  const retentionRate = predictions.length > 0
    ? Math.round((safeCount / predictions.length) * 100)
    : 0;

  const overallScore = Math.round(
    avgEngagement * 0.35 +
    retentionRate * 0.35 +
    avgClassHealth * 0.30,
  );

  // Trend
  const risingEngagements = engagements.filter(e => e.trend === 'rising').length;
  const decliningEngagements = engagements.filter(e => e.trend === 'declining').length;
  let trend = 'Estavel';
  if (risingEngagements > decliningEngagements * 1.5) trend = 'Em alta';
  else if (decliningEngagements > risingEngagements * 1.5) trend = 'Em queda';

  return {
    overallScore,
    trend,
    retention: {
      value: retentionRate,
      label: retentionRate >= 80 ? 'Excelente' : retentionRate >= 60 ? 'Boa' : 'Precisa melhorar',
    },
    engagement: {
      value: avgEngagement,
      label: avgEngagement >= 70 ? 'Alto' : avgEngagement >= 50 ? 'Moderado' : 'Baixo',
    },
    revenue: {
      value: retentionRate, // Revenue proxy = retention
      label: retentionRate >= 80 ? 'Saudavel' : retentionRate >= 60 ? 'Estavel' : 'Em risco',
    },
    growth: {
      value: Math.max(0, risingEngagements - decliningEngagements),
      label: trend,
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// RISK MAP
// ════════════════════════════════════════════════════════════════════

function buildRiskMap(predictions: ChurnPrediction[]): AdminAIAnalyticsVM['riskMap'] {
  const total = predictions.length || 1;

  const buildGroup = (
    filtered: ChurnPrediction[],
  ): RiskGroupVM => ({
    count: filtered.length,
    percentage: Math.round((filtered.length / total) * 100),
    topStudents: filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(p => ({
        id: p.participantId,
        name: p.participantName,
        score: p.score,
      })),
  });

  const critical = predictions.filter(p => p.riskLevel === 'critical');
  const atRisk = predictions.filter(p => p.riskLevel === 'at_risk');
  const watch = predictions.filter(p => p.riskLevel === 'watch');
  const safe = predictions.filter(p => p.riskLevel === 'safe');

  // Champions: safe + high engagement (engagement data not in churn prediction,
  // so we approximate with low churn score < 20)
  const champion = safe.filter(p => p.score < 20);

  return {
    critical: buildGroup(critical),
    atRisk: buildGroup(atRisk),
    watch: buildGroup(watch),
    safe: buildGroup(safe.filter(p => p.score >= 20)),
    champion: buildGroup(champion),
  };
}

// ════════════════════════════════════════════════════════════════════
// PREDICTIONS
// ════════════════════════════════════════════════════════════════════

function buildPredictions(predictions: ChurnPrediction[]): AdminAIAnalyticsVM['predictions'] {
  const criticalAndAtRisk = predictions.filter(
    p => p.riskLevel === 'critical' || p.riskLevel === 'at_risk',
  );

  const expectedChurnNext30Days = criticalAndAtRisk.length;

  // Revenue impact estimate (assume average monthly revenue per student)
  const estimatedMonthlyRevenuePerStudent = 150; // BRL
  const expectedRevenueImpact = expectedChurnNext30Days * estimatedMonthlyRevenuePerStudent;

  // Most common risk factor
  const factorCounts: Record<string, number> = {};
  for (const p of predictions) {
    for (const f of p.factors) {
      factorCounts[f.type] = (factorCounts[f.type] ?? 0) + 1;
    }
  }
  const sortedFactors = Object.entries(factorCounts).sort((a, b) => b[1] - a[1]);
  const highestRiskFactor = sortedFactors[0]?.[0] ?? 'Nenhum';

  // Average churn score
  const avgChurnScore = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.score, 0) / predictions.length)
    : 0;

  return {
    expectedChurnNext30Days,
    expectedRevenueImpact,
    highestRiskFactor: mapFactorName(highestRiskFactor),
    avgChurnScore,
    trendVsLastMonth: 'Estavel', // Would need historical data
  };
}

function mapFactorName(factor: string): string {
  const map: Record<string, string> = {
    ATTENDANCE_DROP: 'Queda de frequencia',
    STREAK_BROKEN: 'Sequencia quebrada',
    DAYS_SINCE_LAST_CHECKIN: 'Inatividade prolongada',
    LONG_PLATEAU: 'Estagnacao tecnica',
    PAYMENT_ISSUE: 'Problemas financeiros',
  };
  return map[factor] ?? factor;
}

// ════════════════════════════════════════════════════════════════════
// ACTIONABLE INSIGHTS
// ════════════════════════════════════════════════════════════════════

function buildActionableInsights(
  predictions: ChurnPrediction[],
  engagements: EngagementScore[],
  classInsights: ClassInsight[],
): ActionableInsightVM[] {
  const insights: ActionableInsightVM[] = [];

  // Insight 1: High churn count
  const criticalCount = predictions.filter(p => p.riskLevel === 'critical').length;
  if (criticalCount > 0) {
    insights.push({
      priority: 'critical',
      category: 'Retencao',
      title: `${criticalCount} aluno(s) em risco critico de evasao`,
      description: `Acao imediata necessaria para reter ${criticalCount} aluno(s) com probabilidade alta de saida nos proximos 30 dias.`,
      estimatedImpact: `Prevenir perda de R$ ${criticalCount * 150}/mes`,
      suggestedAction: 'Agendar contato individual com cada aluno critico esta semana',
    });
  }

  // Insight 2: Declining engagement trend
  const decliningCount = engagements.filter(e => e.trend === 'declining').length;
  if (decliningCount > engagements.length * 0.3 && engagements.length > 0) {
    insights.push({
      priority: 'high',
      category: 'Engajamento',
      title: `${decliningCount} alunos com engajamento em queda`,
      description: `${Math.round((decliningCount / engagements.length) * 100)}% dos alunos estao com tendencia de queda no engajamento.`,
      estimatedImpact: 'Prevenir cascata de evasao',
      suggestedAction: 'Revisar programacao de aulas e criar campanhas de reengajamento',
    });
  }

  // Insight 3: Classes needing attention
  const unhealthyClasses = classInsights.filter(c => c.health.score < 50);
  if (unhealthyClasses.length > 0) {
    insights.push({
      priority: 'high',
      category: 'Turmas',
      title: `${unhealthyClasses.length} turma(s) com saude critica`,
      description: 'Turmas com score de saude abaixo de 50 precisam de intervencao.',
      estimatedImpact: 'Melhorar retencao e satisfacao dos alunos',
      suggestedAction: 'Conversar com instrutores responsaveis e ajustar abordagem',
    });
  }

  // Insight 4: New student retention
  const newStudentPredictions = predictions.filter(
    p => p.factors.some(f => (f.type as string) === 'NEW_STUDENT' || f.description?.includes('novo')),
  );
  if (newStudentPredictions.length > 0) {
    insights.push({
      priority: 'medium',
      category: 'Onboarding',
      title: 'Atencao ao onboarding de novos alunos',
      description: `${newStudentPredictions.length} aluno(s) novo(s) podem precisar de acompanhamento extra.`,
      estimatedImpact: 'Primeiros 60 dias definem 80% da retencao',
      suggestedAction: 'Implementar programa de boas-vindas e apadrinhamento',
    });
  }

  // Insight 5: Champion recognition
  const champions = engagements.filter(e => e.tier === 'champion');
  if (champions.length > 0) {
    insights.push({
      priority: 'low',
      category: 'Reconhecimento',
      title: `${champions.length} aluno(s) champion para reconhecer`,
      description: 'Alunos com engajamento excepcional merecem reconhecimento publico.',
      estimatedImpact: 'Fortalece cultura positiva e retencao dos melhores',
      suggestedAction: 'Criar momento de reconhecimento ou destaque no ranking',
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  insights.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

  return insights.slice(0, 8);
}

// ════════════════════════════════════════════════════════════════════
// CLASSES NEEDING ATTENTION
// ════════════════════════════════════════════════════════════════════

function buildClassesNeedingAttention(
  classInsights: ClassInsight[],
): ClassAttentionVM[] {
  return classInsights
    .filter(c => c.health.score < 60)
    .sort((a, b) => a.health.score - b.health.score)
    .slice(0, 10)
    .map(c => {
      // Determine main issue
      let issue: string;
      if (c.health.avgAttendanceRate < 50) {
        issue = 'Frequencia muito baixa';
      } else if (c.composition.driftingCount > c.composition.totalEnrolled * 0.4) {
        issue = 'Muitos alunos desengajados';
      } else if (c.composition.levelSpread > 4) {
        issue = 'Turma muito heterogenea';
      } else if (c.health.retentionRate < 50) {
        issue = 'Retencao abaixo do esperado';
      } else {
        issue = 'Saude geral precisa de atencao';
      }

      // Get first recommendation
      const recommendation = c.recommendations[0]?.description ?? 'Revisar composicao da turma';

      return {
        classId: c.classScheduleId,
        className: c.className,
        issue,
        healthScore: c.health.score,
        recommendation,
      };
    });
}

// ════════════════════════════════════════════════════════════════════
// INSTRUCTOR PERFORMANCE
// ════════════════════════════════════════════════════════════════════

function buildInstructorPerformance(
  instructorData: InstructorData[],
  engagements: EngagementScore[],
  classInsights: ClassInsight[],
): InstructorPerformanceVM[] {
  const engagementMap = new Map(engagements.map(e => [e.participantId, e]));
  const classInsightMap = new Map(classInsights.map(c => [c.classScheduleId, c]));

  return instructorData.map(instructor => {
    // Average engagement of instructor's students
    const studentEngagements = instructor.studentMembershipIds
      .map(id => engagementMap.get(id))
      .filter((e): e is EngagementScore => e !== undefined);

    const avgStudentEngagement = studentEngagements.length > 0
      ? Math.round(
          studentEngagements.reduce((sum, e) => sum + e.overall, 0) / studentEngagements.length,
        )
      : 0;

    // Average class health
    const instructorClassInsights = instructor.classIds
      .map(id => classInsightMap.get(id))
      .filter((c): c is ClassInsight => c !== undefined);

    const avgClassHealth = instructorClassInsights.length > 0
      ? Math.round(
          instructorClassInsights.reduce((sum, c) => sum + c.health.score, 0) /
            instructorClassInsights.length,
        )
      : 0;

    // Retention rate from class insights
    const retentionRates = instructorClassInsights
      .map(c => c.health.retentionRate)
      .filter(r => r > 0);
    const studentsRetentionRate = retentionRates.length > 0
      ? Math.round(retentionRates.reduce((a, b) => a + b, 0) / retentionRates.length)
      : 0;

    return {
      instructorId: instructor.instructorId,
      name: instructor.name,
      studentsRetentionRate,
      avgStudentEngagement,
      classCount: instructor.classIds.length,
      avgClassHealth,
    };
  }).sort((a, b) => b.avgStudentEngagement - a.avgStudentEngagement);
}

// ════════════════════════════════════════════════════════════════════
// AI SYSTEM METRICS
// ════════════════════════════════════════════════════════════════════

function buildAISystemMetrics(
  predictions: ChurnPrediction[],
  engagements: EngagementScore[],
  classInsights: ClassInsight[],
): AdminAIAnalyticsVM['aiSystemMetrics'] {
  const totalPredictions = predictions.length + engagements.length + classInsights.length;

  const alertsGenerated = predictions.filter(
    p => p.riskLevel === 'critical' || p.riskLevel === 'at_risk',
  ).length;

  // Average confidence across all predictions
  const allConfidences = [
    ...predictions.map(p => p.confidence),
    ...engagements.map(e => e.metadata.confidence),
    ...classInsights.map(c => c.metadata.confidence),
  ];
  const avgConfidence = allConfidences.length > 0
    ? Math.round((allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length) * 100) / 100
    : 0;

  const lastComputedAt = new Date().toISOString();

  return {
    predictionsGenerated: totalPredictions,
    alertsGenerated,
    avgConfidence,
    lastComputedAt,
  };
}
