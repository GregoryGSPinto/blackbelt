/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CHURN PROJECTORS — ViewModels para consumidores de IA          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Segue o padrão dos 8 projectors existentes.                   ║
 * ║  Pure functions. Zero side effects. Zero fetch.                 ║
 * ║                                                                 ║
 * ║  Cada projector transforma ChurnPrediction em ViewModel         ║
 * ║  específico para seu consumidor.                                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  ChurnPrediction,
  ChurnRiskLevel,
  ChurnFactor,
  Recommendation,
} from '@/lib/domain/intelligence';

// ════════════════════════════════════════════════════════════════════
// ADMIN OVERVIEW — Dashboard de churn da academia
// ════════════════════════════════════════════════════════════════════

export interface AdminChurnOverviewVM {
  /** Contagens por nível de risco */
  summary: {
    critical: number;
    atRisk: number;
    watch: number;
    safe: number;
    total: number;
  };
  /** Alunos em risco, ordenados por score desc */
  criticalStudents: AdminChurnStudentVM[];
  atRiskStudents: AdminChurnStudentVM[];
  watchStudents: AdminChurnStudentVM[];
  /** Top recomendações agregadas */
  topRecommendations: AggregatedRecommendation[];
  /** Score médio da academia */
  averageScore: number;
  /** Timestamp da última computação */
  computedAt: string;
}

export interface AdminChurnStudentVM {
  participantId: string;
  name: string;
  avatar?: string;
  score: number;
  riskLevel: ChurnRiskLevel;
  topFactor: string;
  topFactorDescription: string;
  confidence: number;
  recommendationCount: number;
}

export interface AggregatedRecommendation {
  action: string;
  affectedCount: number;
  priority: Recommendation['priority'];
  targetRole: Recommendation['targetRole'];
  automatable: boolean;
}

export function projectAdminChurnOverview(
  predictions: ChurnPrediction[],
): AdminChurnOverviewVM {
  const critical = predictions.filter(p => p.riskLevel === 'critical');
  const atRisk = predictions.filter(p => p.riskLevel === 'at_risk');
  const watch = predictions.filter(p => p.riskLevel === 'watch');
  const safe = predictions.filter(p => p.riskLevel === 'safe');

  const mapStudent = (p: ChurnPrediction): AdminChurnStudentVM => ({
    participantId: p.participantId,
    name: p.participantName,
    avatar: p.participantAvatar,
    score: p.score,
    riskLevel: p.riskLevel,
    topFactor: p.factors[0]?.type ?? '',
    topFactorDescription: p.factors[0]?.description ?? '',
    confidence: p.confidence,
    recommendationCount: p.recommendations.length,
  });

  // Sort by score descending within each group
  const sortByScore = (a: ChurnPrediction, b: ChurnPrediction) => b.score - a.score;

  // Aggregate recommendations
  const recMap = new Map<string, AggregatedRecommendation>();
  for (const p of predictions) {
    for (const rec of p.recommendations) {
      const existing = recMap.get(rec.action);
      if (existing) {
        existing.affectedCount++;
      } else {
        recMap.set(rec.action, {
          action: rec.action,
          affectedCount: 1,
          priority: rec.priority,
          targetRole: rec.targetRole,
          automatable: rec.automatable,
        });
      }
    }
  }
  const topRecommendations = Array.from(recMap.values())
    .sort((a, b) => b.affectedCount - a.affectedCount)
    .slice(0, 10);

  const totalScore = predictions.reduce((sum, p) => sum + p.score, 0);

  return {
    summary: {
      critical: critical.length,
      atRisk: atRisk.length,
      watch: watch.length,
      safe: safe.length,
      total: predictions.length,
    },
    criticalStudents: critical.sort(sortByScore).map(mapStudent),
    atRiskStudents: atRisk.sort(sortByScore).map(mapStudent),
    watchStudents: watch.sort(sortByScore).map(mapStudent),
    topRecommendations,
    averageScore: predictions.length > 0 ? Math.round(totalScore / predictions.length) : 0,
    computedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// INSTRUCTOR ALERTS — Alertas de churn para o professor
// ════════════════════════════════════════════════════════════════════

export interface InstructorChurnAlertVM {
  participantId: string;
  name: string;
  avatar?: string;
  score: number;
  riskLevel: ChurnRiskLevel;
  factors: {
    type: string;
    description: string;
    severity: 'info' | 'warning' | 'danger';
  }[];
  recommendations: {
    action: string;
    priority: string;
  }[];
}

export function projectInstructorChurnAlerts(
  predictions: ChurnPrediction[],
): InstructorChurnAlertVM[] {
  return predictions
    .filter(p => p.riskLevel === 'at_risk' || p.riskLevel === 'critical')
    .sort((a, b) => b.score - a.score)
    .map(p => ({
      participantId: p.participantId,
      name: p.participantName,
      avatar: p.participantAvatar,
      score: p.score,
      riskLevel: p.riskLevel,
      factors: p.factors
        .filter(f => f.riskLevel !== 'none')
        .slice(0, 3)
        .map(f => ({
          type: f.type,
          description: f.description,
          severity: mapFactorSeverity(f),
        })),
      recommendations: p.recommendations
        .filter(r => r.targetRole === 'instructor')
        .slice(0, 2)
        .map(r => ({ action: r.action, priority: r.priority })),
    }));
}

function mapFactorSeverity(factor: ChurnFactor): 'info' | 'warning' | 'danger' {
  if (factor.riskLevel === 'critical' || factor.riskLevel === 'high') return 'danger';
  if (factor.riskLevel === 'medium') return 'warning';
  return 'info';
}

// ════════════════════════════════════════════════════════════════════
// RETENTION ENCOURAGEMENT — Mensagem positiva para o aluno
// ════════════════════════════════════════════════════════════════════

export interface RetentionEncouragementVM {
  /** Mensagem motivacional principal */
  message: string;
  /** Ação sugerida (nunca negativa) */
  suggestedAction: string;
  /** Tipo de incentivo */
  incentiveType: 'streak_recovery' | 'milestone_push' | 'social_motivation' | 'general';
  /** Mostrar ao aluno? (false se score < 25) */
  shouldShow: boolean;
}

export function projectRetentionEncouragement(
  prediction: ChurnPrediction,
): RetentionEncouragementVM {
  // NUNCA mostra "risco de evasão" pro aluno
  // Mostra mensagens motivacionais baseadas nos fatores

  if (prediction.riskLevel === 'safe') {
    return {
      message: 'Continue com esse ritmo! Sua dedicação está fazendo a diferença.',
      suggestedAction: 'Confira seu progresso na aba de evolução',
      incentiveType: 'general',
      shouldShow: false, // Não precisa de intervenção
    };
  }

  // Find the most impactful factor
  const topFactor = prediction.factors[0];
  if (!topFactor) {
    return {
      message: 'Cada treino conta! Venha para a próxima aula.',
      suggestedAction: 'Veja a grade de aulas disponíveis',
      incentiveType: 'general',
      shouldShow: true,
    };
  }

  switch (topFactor.type) {
    case 'STREAK_BROKEN':
    case 'DAYS_SINCE_LAST_CHECKIN':
      return {
        message: 'Sentimos sua falta! Volte amanhã e recupere sua sequência de treinos.',
        suggestedAction: 'Veja qual é a próxima aula disponível para você',
        incentiveType: 'streak_recovery',
        shouldShow: true,
      };

    case 'LONG_PLATEAU':
      return {
        message: 'Você está cada vez mais perto do próximo nível! Foque nos requisitos pendentes.',
        suggestedAction: 'Confira o que falta para sua próxima graduação',
        incentiveType: 'milestone_push',
        shouldShow: true,
      };

    case 'ATTENDANCE_DROP':
      return {
        message: 'Seus colegas estão treinando firme! Que tal juntar-se a eles esta semana?',
        suggestedAction: 'Veja quem está treinando na sua turma',
        incentiveType: 'social_motivation',
        shouldShow: true,
      };

    default:
      return {
        message: 'Cada sessão te aproxima do seu objetivo. Não desista agora!',
        suggestedAction: 'Confira suas conquistas mais recentes',
        incentiveType: 'general',
        shouldShow: true,
      };
  }
}
