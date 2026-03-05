/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CLASS OPTIMIZER — Análise Inteligente de Turmas                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Analisa composição, saúde e gera recomendações para turmas.    ║
 * ║                                                                 ║
 * ║  Input:  ClassAnalysisInput (alunos + engagement + DNA)         ║
 * ║  Output: ClassInsight (saúde + composição + recomendações)      ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  ClassInsight,
  ClassHealth,
  ClassComposition,
  ClassRecommendation,
  SuggestedFocus,
  SpecialAttention,
} from '../models/class-insight.types';
import type {
  Score0to100,
  EngagementTier,
} from '../core/types';
import type { StudentDNA } from '../models/student-dna.types';
import {
  clampScore,
  standardDeviation,
} from '../core/scoring-utils';
import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// INPUT TYPE
// ════════════════════════════════════════════════════════════════════

export interface ClassStudentData {
  participantId: string;
  participantName: string;
  engagementScore: Score0to100;
  engagementTier: EngagementTier;
  churnRisk: Score0to100;
  currentMilestone: string;
  currentMilestoneOrder: number;
  currentSublevel: number;
  daysSinceEnrollment: number;
  daysSinceLastCheckin: number;
  streakCurrent: number;
  dna?: StudentDNA;
  competencyScores?: { id: string; name: string; score: number }[];
}

export interface ClassAnalysisInput {
  classScheduleId: string;
  className: string;
  instructorId: string;
  scheduledTime: string;
  dayOfWeek: number;
  maxCapacity: number;
  students: ClassStudentData[];
  avgAttendanceRate?: number;  // historical
  retentionRate?: number;      // historical
}

// ════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Analisa uma turma e produz insights acionáveis.
 *
 * @param input - Dados da turma com alunos, engajamento e DNA
 * @returns ClassInsight com saúde, composição e recomendações
 */
export function analyzeClass(input: ClassAnalysisInput): ClassInsight {
  const { students } = input;

  // ── Compute health ──────────────────────────────────────────
  const health = computeClassHealth(input);

  // ── Compute composition ─────────────────────────────────────
  const composition = computeComposition(students, input.maxCapacity);

  // ── Generate recommendations ────────────────────────────────
  const recommendations = generateRecommendations(input, health, composition);

  // ── Suggest focus ───────────────────────────────────────────
  const suggestedFocus = computeSuggestedFocus(students);

  // ── Confidence ──────────────────────────────────────────────
  const studentsWithDNA = students.filter(s => s.dna != null).length;
  const confidence = calculateConfidence(
    studentsWithDNA + students.length, // data points: each student + DNA
    students.length * 2,               // ideal: all students have DNA
    null,                              // not enrollment-dependent
  );

  return {
    classScheduleId: input.classScheduleId,
    className: input.className,
    dayOfWeek: input.dayOfWeek,
    timeSlot: input.scheduledTime,
    instructorId: input.instructorId,
    health,
    composition,
    recommendations,
    suggestedFocus,
    metadata: {
      computedAt: new Date().toISOString(),
      confidence,
      dataPoints: students.length,
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// CLASS HEALTH
// ════════════════════════════════════════════════════════════════════

function computeClassHealth(input: ClassAnalysisInput): ClassHealth {
  const { students } = input;

  if (students.length === 0) {
    return {
      score: 0,
      trend: 'stable',
      avgAttendanceRate: 0,
      retentionRate: 0,
      avgEngagement: 0,
    };
  }

  // Average engagement
  const avgEngagement = clampScore(
    students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length,
  );

  // % at risk (churn > 60)
  const atRiskRatio = students.filter(s => s.churnRisk > 60).length / students.length;

  // % drifting or disconnected
  const driftingRatio = students.filter(
    s => s.engagementTier === 'drifting' || s.engagementTier === 'disconnected',
  ).length / students.length;

  // Health formula: engagement * 0.4 + (1-atRisk) * 0.3 + (1-drifting) * 0.3
  const healthScore = clampScore(
    avgEngagement * 0.4 +
    (1 - atRiskRatio) * 100 * 0.3 +
    (1 - driftingRatio) * 100 * 0.3,
  );

  // Trend: use attendance and retention if available
  let trend: ClassHealth['trend'] = 'stable';
  if (input.avgAttendanceRate !== undefined) {
    if (input.avgAttendanceRate >= 80) trend = 'improving';
    else if (input.avgAttendanceRate < 60) trend = 'declining';
  }

  return {
    score: healthScore,
    trend,
    avgAttendanceRate: input.avgAttendanceRate ?? 0,
    retentionRate: input.retentionRate ?? 0,
    avgEngagement,
  };
}

// ════════════════════════════════════════════════════════════════════
// COMPOSITION ANALYSIS
// ════════════════════════════════════════════════════════════════════

function computeComposition(
  students: ClassStudentData[],
  maxCapacity: number,
): ClassComposition {
  const totalEnrolled = students.length;

  // Average milestone order
  const milestoneOrders = students.map(s => s.currentMilestoneOrder);
  const avgLevel = milestoneOrders.length > 0
    ? Math.round((milestoneOrders.reduce((a, b) => a + b, 0) / milestoneOrders.length) * 10) / 10
    : 0;

  // Level spread (std dev)
  const levelSpread = Math.round(standardDeviation(milestoneOrders) * 10) / 10;

  // Tier counts
  const championCount = students.filter(s => s.engagementTier === 'champion').length;
  const driftingCount = students.filter(
    s => s.engagementTier === 'drifting' || s.engagementTier === 'disconnected',
  ).length;

  // New members (< 60 days)
  const newMemberCount = students.filter(s => s.daysSinceEnrollment < 60).length;

  return {
    totalEnrolled,
    avgLevel,
    levelSpread,
    championCount,
    driftingCount,
    newMemberCount,
  };
}

// ════════════════════════════════════════════════════════════════════
// RECOMMENDATIONS
// ════════════════════════════════════════════════════════════════════

function generateRecommendations(
  input: ClassAnalysisInput,
  health: ClassHealth,
  composition: ClassComposition,
): ClassRecommendation[] {
  const recommendations: ClassRecommendation[] = [];
  const { students } = input;

  // ── High churn risk students ────────────────────────────────
  const atRiskStudents = students.filter(s => s.churnRisk > 60);
  if (atRiskStudents.length > 0) {
    recommendations.push({
      type: 'focus_retention',
      priority: atRiskStudents.length >= 3 ? 'high' : 'medium',
      description: `${atRiskStudents.length} aluno(s) com risco alto de evasão nesta turma`,
      involvedParticipants: atRiskStudents.map(s => s.participantId),
      expectedImpact: `Atenção individualizada pode reduzir evasão em até ${Math.min(atRiskStudents.length * 10, 30)}%`,
    });
  }

  // ── Level spread too high ───────────────────────────────────
  if (composition.levelSpread > 3) {
    recommendations.push({
      type: 'split_class',
      priority: composition.levelSpread > 5 ? 'high' : 'medium',
      description: `Turma muito heterogênea (spread: ${composition.levelSpread}). Considere dividir por nível`,
      expectedImpact: 'Aulas mais focadas para cada grupo de nível',
    });
  }

  // ── New students need welcome ───────────────────────────────
  if (composition.newMemberCount > 0) {
    const newStudents = students.filter(s => s.daysSinceEnrollment < 60);
    recommendations.push({
      type: 'celebrate_progress',
      priority: 'medium',
      description: `${composition.newMemberCount} aluno(s) novo(s) — garantir acolhimento`,
      involvedParticipants: newStudents.map(s => s.participantId),
      expectedImpact: 'Acolhimento nos primeiros 60 dias aumenta retenção em 40%',
    });
  }

  // ── Champion mentoring opportunity ──────────────────────────
  if (composition.championCount > 0 && composition.driftingCount > 0) {
    const champions = students.filter(s => s.engagementTier === 'champion');
    const drifting = students.filter(
      s => s.engagementTier === 'drifting' || s.engagementTier === 'disconnected',
    );
    recommendations.push({
      type: 'pair_mentoring',
      priority: 'medium',
      description: `Oportunidade de mentoria: ${champions.length} champion(s) podem apoiar ${drifting.length} aluno(s) em declínio`,
      involvedParticipants: [...champions.map(s => s.participantId), ...drifting.map(s => s.participantId)],
      expectedImpact: 'Mentoria entre pares aumenta engajamento de ambos os grupos',
    });
  }

  // ── Returning students ──────────────────────────────────────
  const returningStudents = students.filter(s => s.daysSinceLastCheckin > 14 && s.daysSinceLastCheckin <= 60);
  if (returningStudents.length > 0) {
    recommendations.push({
      type: 'welcome_back',
      priority: 'high',
      description: `${returningStudents.length} aluno(s) retornando após ausência longa`,
      involvedParticipants: returningStudents.map(s => s.participantId),
      expectedImpact: 'Reconhecer retorno aumenta chance de continuidade em 60%',
    });
  }

  // ── Near promotion students ─────────────────────────────────
  // If we have DNA data, check for near-promotion students
  const nearPromotion = students.filter(s =>
    s.dna?.predictions?.nextMilestoneWeeks != null &&
    s.dna.predictions.nextMilestoneWeeks <= 4,
  );
  if (nearPromotion.length > 0) {
    recommendations.push({
      type: 'pre_promotion_focus',
      priority: 'medium',
      description: `${nearPromotion.length} aluno(s) próximo(s) de promoção — foco em requisitos`,
      involvedParticipants: nearPromotion.map(s => s.participantId),
      expectedImpact: 'Foco em requisitos pendentes acelera promoção e motivação',
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

// ════════════════════════════════════════════════════════════════════
// SUGGESTED FOCUS
// ════════════════════════════════════════════════════════════════════

function computeSuggestedFocus(students: ClassStudentData[]): SuggestedFocus {
  // Aggregate competency scores across students
  const competencyTotals: Record<string, { name: string; total: number; count: number }> = {};

  for (const student of students) {
    const scores = student.competencyScores ?? student.dna?.difficultyProfile?.weakCompetencies?.map(
      id => ({ id, name: id, score: 30 }),
    ) ?? [];

    if (student.competencyScores) {
      for (const comp of student.competencyScores) {
        if (!competencyTotals[comp.id]) {
          competencyTotals[comp.id] = { name: comp.name, total: 0, count: 0 };
        }
        competencyTotals[comp.id].total += comp.score;
        competencyTotals[comp.id].count++;
      }
    }
  }

  // Calculate averages and sort
  const competencyAverages = Object.entries(competencyTotals)
    .map(([id, { name, total, count }]) => ({
      id,
      name,
      avg: total / count,
    }))
    .sort((a, b) => a.avg - b.avg);

  // Primary: weakest competency, Secondary: second weakest, Avoid: strongest
  const primaryCompetency = competencyAverages[0]?.name ?? 'Fundamentos';
  const secondaryCompetency = competencyAverages[1]?.name ?? 'Técnica';
  const avoidCompetency = competencyAverages[competencyAverages.length - 1]?.name ?? '';

  // Difficulty level: based on average milestone order
  const avgMilestoneOrder = students.length > 0
    ? students.reduce((sum, s) => sum + s.currentMilestoneOrder, 0) / students.length
    : 2;
  const difficultyLevel = Math.max(1, Math.min(5, Math.round(avgMilestoneOrder)));

  // Special attention students
  const specialAttention = identifySpecialAttention(students);

  return {
    primaryCompetency,
    secondaryCompetency,
    avoidCompetency,
    difficultyLevel,
    specialAttention,
  };
}

// ════════════════════════════════════════════════════════════════════
// SPECIAL ATTENTION IDENTIFICATION
// ════════════════════════════════════════════════════════════════════

function identifySpecialAttention(students: ClassStudentData[]): SpecialAttention[] {
  const attention: SpecialAttention[] = [];

  for (const student of students) {
    // Returning after absence
    if (student.daysSinceLastCheckin > 14) {
      attention.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Retornando após ${student.daysSinceLastCheckin} dias de ausência`,
        suggestion: 'Acolher, perguntar como está, incluir em dupla com aluno experiente',
      });
    }

    // New student
    if (student.daysSinceEnrollment < 30) {
      attention.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Aluno novo (${student.daysSinceEnrollment} dias de matrícula)`,
        suggestion: 'Dar atenção extra, explicar dinâmica, apresentar a colegas',
      });
    }

    // High churn risk
    if (student.churnRisk > 70) {
      attention.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Risco alto de evasão (${student.churnRisk}%)`,
        suggestion: 'Engajar pessoalmente, perguntar sobre objetivos, celebrar pequenas conquistas',
      });
    }

    // Near promotion
    if (student.dna?.predictions?.nextMilestoneWeeks != null && student.dna.predictions.nextMilestoneWeeks <= 4) {
      attention.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Próximo de promoção (~${student.dna.predictions.nextMilestoneWeeks} semanas)`,
        suggestion: 'Focar em requisitos pendentes, incentivar dedicação extra',
      });
    }
  }

  // Sort by priority (returning > churn risk > new > promotion)
  const priorityMap: Record<string, number> = {
    'Retornando': 0,
    'Risco': 1,
    'Aluno novo': 2,
    'Próximo': 3,
  };

  attention.sort((a, b) => {
    const aKey = Object.keys(priorityMap).find(k => a.reason.startsWith(k)) ?? '';
    const bKey = Object.keys(priorityMap).find(k => b.reason.startsWith(k)) ?? '';
    return (priorityMap[aKey] ?? 99) - (priorityMap[bKey] ?? 99);
  });

  return attention;
}
