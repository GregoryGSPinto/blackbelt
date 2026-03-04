/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INSTRUCTOR COACH — Briefing Diário Inteligente                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Gera briefing do dia para o professor com:                     ║
 * ║    - Resumo do dia (turmas, alunos, prioridades)                ║
 * ║    - Briefing por turma (spotlight students, foco, warmup)      ║
 * ║    - Dicas pedagógicas contextuais                              ║
 * ║    - Métricas de performance do instrutor                       ║
 * ║                                                                 ║
 * ║  Input:  CoachInput (turmas + alunos + insights)                ║
 * ║  Output: InstructorCoachBriefing (briefings + tips + métricas)  ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  CoachInput,
  CoachClassData,
  CoachStudentSnapshot,
  ClassBriefing,
  SpotlightStudent,
  PedagogicalTip,
  InstructorPerformanceMetrics,
  InstructorCoachBriefing,
} from '../models/instructor-coach.types';
import type { Priority, SpotlightContextType } from '../core/types';
import {
  clampScore,
  clampConfidence,
  safeDivide,
  topN,
  standardDeviation,
} from '../core/scoring-utils';
import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// SPOTLIGHT PRIORITY ORDER (lower = more urgent)
// ════════════════════════════════════════════════════════════════════

const SPOTLIGHT_PRIORITY: Record<SpotlightContextType, number> = {
  returning_after_absence: 1,
  declining_engagement: 2,
  new_student: 3,
  struggling_with: 4,
  near_promotion: 5,
  achieved_milestone: 6,
  champion_potential: 7,
};

// ════════════════════════════════════════════════════════════════════
// MAIN BRIEFING FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Gera o briefing diário completo para um instrutor.
 *
 * @param input - Dados do instrutor, turmas e alunos do dia
 * @returns InstructorCoachBriefing com resumo, briefings e dicas
 */
export function generateDailyBriefing(input: CoachInput): InstructorCoachBriefing {
  const { classes } = input;

  // ── Generate per-class briefings ────────────────────────────
  const classBriefings = classes.map(c => buildClassBriefing(c));

  // ── Generate day summary ────────────────────────────────────
  const daySummary = buildDaySummary(input, classBriefings);

  // ── Generate pedagogical tips ───────────────────────────────
  const pedagogicalTips = generatePedagogicalTips(input, classBriefings);

  // ── Compute performance metrics ─────────────────────────────
  const performanceMetrics = computePerformanceMetrics(input, classBriefings);

  // ── Confidence ──────────────────────────────────────────────
  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
  const classesWithInsight = classes.filter(c => c.insight != null).length;
  const confidence = calculateConfidence(
    classesWithInsight + totalStudents,
    classes.length + totalStudents,
    null,
  );

  return {
    instructorId: input.instructorId,
    instructorName: input.instructorName,
    date: input.date,
    daySummary,
    classBriefings,
    pedagogicalTips,
    performanceMetrics,
    confidence,
    computedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// CLASS BRIEFING BUILDER
// ════════════════════════════════════════════════════════════════════

function buildClassBriefing(classData: CoachClassData): ClassBriefing {
  const { students, insight } = classData;

  // ── Identify priority students ──────────────────────────────
  const priorityStudents = identifySpotlightStudents(students);

  // ── Suggest focus based on class insight ─────────────────────
  const suggestedFocus = buildSuggestedFocus(classData);

  // ── Suggest warmup ──────────────────────────────────────────
  const warmupSuggestion = generateWarmupSuggestion(classData);

  return {
    classId: classData.classId,
    className: classData.className,
    time: classData.scheduledTime,
    studentCount: students.length,
    healthScore: insight?.health?.score ?? 50,
    priorityStudents,
    suggestedFocus,
    warmupSuggestion,
  };
}

// ════════════════════════════════════════════════════════════════════
// SPOTLIGHT STUDENT IDENTIFICATION
// ════════════════════════════════════════════════════════════════════

function identifySpotlightStudents(students: CoachStudentSnapshot[]): SpotlightStudent[] {
  const spotlights: SpotlightStudent[] = [];

  for (const student of students) {
    // Returning after absence (> 14 days)
    if (student.daysSinceLastCheckin > 14) {
      spotlights.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Retornando após ${student.daysSinceLastCheckin} dias de ausência`,
        suggestedAction: 'Acolher com entusiasmo. Perguntar como está. Adaptar intensidade.',
        priority: 'critical',
      });
      continue; // One spotlight reason per student
    }

    // Declining engagement (tier drifting/disconnected + high churn)
    if (
      (student.engagementTier === 'drifting' || student.engagementTier === 'disconnected') &&
      student.churnRisk > 50
    ) {
      spotlights.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Engajamento em queda (${student.engagementScore}/100) — risco de evasão ${student.churnRisk}%`,
        suggestedAction: 'Dar atenção individual. Celebrar qualquer progresso. Criar mini-meta para a aula.',
        priority: 'high',
      });
      continue;
    }

    // New student (< 30 days)
    if (student.daysSinceEnrollment < 30) {
      spotlights.push({
        participantId: student.participantId,
        participantName: student.participantName,
        reason: `Aluno novo (${student.daysSinceEnrollment} dias)`,
        suggestedAction: 'Apresentar a colegas. Verificar adaptação. Explicar dinâmica da aula.',
        priority: 'high',
      });
      continue;
    }

    // Use context from engine data if available
    if (student.recentContext) {
      const contextSpotlight = buildContextSpotlight(student);
      if (contextSpotlight) {
        spotlights.push(contextSpotlight);
      }
    }
  }

  // Sort by priority and limit to top 5
  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  spotlights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return spotlights.slice(0, 5);
}

function buildContextSpotlight(student: CoachStudentSnapshot): SpotlightStudent | null {
  switch (student.recentContext) {
    case 'near_promotion':
      return {
        participantId: student.participantId,
        participantName: student.participantName,
        reason: 'Próximo de promoção de faixa',
        suggestedAction: 'Focar em requisitos pendentes. Motivar com proximidade do objetivo.',
        priority: 'medium',
      };
    case 'achieved_milestone':
      return {
        participantId: student.participantId,
        participantName: student.participantName,
        reason: 'Conquista recente de milestone',
        suggestedAction: 'Parabenizar publicamente. Definir próximo objetivo.',
        priority: 'low',
      };
    case 'struggling_with':
      return {
        participantId: student.participantId,
        participantName: student.participantName,
        reason: 'Com dificuldade em competências específicas',
        suggestedAction: 'Oferecer atenção extra em técnica. Simplificar exercícios se necessário.',
        priority: 'medium',
      };
    case 'champion_potential':
      return {
        participantId: student.participantId,
        participantName: student.participantName,
        reason: 'Potencial para se tornar champion',
        suggestedAction: 'Desafiar com exercícios avançados. Convidar para ajudar colegas.',
        priority: 'low',
      };
    default:
      return null;
  }
}

// ════════════════════════════════════════════════════════════════════
// SUGGESTED FOCUS
// ════════════════════════════════════════════════════════════════════

function buildSuggestedFocus(classData: CoachClassData): string {
  const { insight, students } = classData;

  if (insight?.suggestedFocus) {
    return `Foco principal: ${insight.suggestedFocus.primaryCompetency}. ` +
      `Secundário: ${insight.suggestedFocus.secondaryCompetency}. ` +
      `Nível ${insight.suggestedFocus.difficultyLevel}/5.`;
  }

  // Fallback: determine from students
  const avgEngagement = students.length > 0
    ? students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length
    : 50;

  if (avgEngagement < 40) {
    return 'Foco em motivação e diversão. Exercícios dinâmicos em grupo.';
  }
  if (avgEngagement < 60) {
    return 'Equilibrar técnica com atividades motivacionais.';
  }
  if (avgEngagement < 80) {
    return 'Técnica avançada com desafios progressivos.';
  }
  return 'Turma de alto engajamento. Desafiar com situações complexas e competitivas.';
}

// ════════════════════════════════════════════════════════════════════
// WARMUP SUGGESTION
// ════════════════════════════════════════════════════════════════════

function generateWarmupSuggestion(classData: CoachClassData): string {
  const { students } = classData;

  const hasNewStudents = students.some(s => s.daysSinceEnrollment < 30);
  const hasReturning = students.some(s => s.daysSinceLastCheckin > 14);
  const avgEngagement = students.length > 0
    ? students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length
    : 50;

  if (hasNewStudents && hasReturning) {
    return 'Aquecimento inclusivo com apresentações. Exercícios em duplas misturando veteranos e novatos.';
  }
  if (hasNewStudents) {
    return 'Aquecimento com exercícios básicos explicados. Incluir apresentação rápida dos presentes.';
  }
  if (hasReturning) {
    return 'Aquecimento gradual com atenção à intensidade. Verificar limitações dos que retornam.';
  }
  if (avgEngagement >= 80) {
    return 'Aquecimento dinâmico com exercícios competitivos e específicos.';
  }
  if (avgEngagement < 50) {
    return 'Aquecimento motivacional com jogos em grupo. Energia alta desde o início.';
  }
  return 'Aquecimento padrão progressivo com mobilidade e exercícios específicos.';
}

// ════════════════════════════════════════════════════════════════════
// DAY SUMMARY
// ════════════════════════════════════════════════════════════════════

function buildDaySummary(
  input: CoachInput,
  classBriefings: ClassBriefing[],
): InstructorCoachBriefing['daySummary'] {
  const totalClasses = classBriefings.length;
  const totalStudents = classBriefings.reduce((sum, b) => sum + b.studentCount, 0);
  const classesNeedingAttention = classBriefings.filter(b => b.healthScore < 60).length;

  // Find top priority across all classes
  let topPriority = 'Dia tranquilo — todas as turmas saudáveis';

  if (classesNeedingAttention > 0) {
    const worstClass = classBriefings
      .filter(b => b.healthScore < 60)
      .sort((a, b) => a.healthScore - b.healthScore)[0];

    if (worstClass) {
      topPriority = `Atenção em ${worstClass.className} (saúde: ${worstClass.healthScore}/100)`;
    }
  }

  // Check for urgent spotlights
  const allSpotlights = classBriefings.flatMap(b => b.priorityStudents);
  const criticalSpotlights = allSpotlights.filter(s => s.priority === 'critical');
  if (criticalSpotlights.length > 0) {
    topPriority = `${criticalSpotlights.length} aluno(s) precisam de atenção urgente: ${criticalSpotlights[0].participantName}`;
  }

  return {
    totalClasses,
    totalStudents,
    classesNeedingAttention,
    topPriority,
  };
}

// ════════════════════════════════════════════════════════════════════
// PEDAGOGICAL TIPS
// ════════════════════════════════════════════════════════════════════

function generatePedagogicalTips(
  input: CoachInput,
  classBriefings: ClassBriefing[],
): PedagogicalTip[] {
  const tips: PedagogicalTip[] = [];
  const allStudents = input.classes.flatMap(c => c.students);

  // ── Retention tips ──────────────────────────────────────────
  const atRiskCount = allStudents.filter(s => s.churnRisk > 60).length;
  if (atRiskCount > 0) {
    tips.push({
      category: 'retention',
      tip: 'Alunos em risco respondem melhor a atenção pessoal. ' +
        'Use o nome, pergunte sobre a semana, celebre presença.',
      relevance: atRiskCount >= 3 ? 'high' : 'medium',
      context: `${atRiskCount} aluno(s) com risco de evasão hoje`,
    });
  }

  // ── Progression tips ────────────────────────────────────────
  const driftingStudents = allStudents.filter(
    s => s.engagementTier === 'drifting' || s.engagementTier === 'disconnected',
  );
  if (driftingStudents.length > 0) {
    tips.push({
      category: 'progression',
      tip: 'Para alunos estagnados, tente criar micro-objetivos alcançáveis na aula. ' +
        'Uma conquista pequena por aula mantém a motivação.',
      relevance: driftingStudents.length >= 3 ? 'high' : 'medium',
      context: `${driftingStudents.length} aluno(s) com engajamento baixo`,
    });
  }

  // ── Motivation tips ─────────────────────────────────────────
  const newStudents = allStudents.filter(s => s.daysSinceEnrollment < 30);
  if (newStudents.length > 0) {
    tips.push({
      category: 'motivation',
      tip: 'Primeiros 30 dias são críticos para retenção. ' +
        'Garanta que cada aluno novo saia da aula sentindo que aprendeu algo concreto.',
      relevance: 'high',
      context: `${newStudents.length} aluno(s) novo(s) na fase crítica de retenção`,
    });
  }

  // ── Technique tips ──────────────────────────────────────────
  const classesWithHighSpread = classBriefings.filter(b => {
    const classData = input.classes.find(c => c.classId === b.classId);
    if (!classData) return false;
    const levels = classData.students.map(s => s.currentSublevel);
    if (levels.length < 2) return false;
    const stdDev = standardDeviation(levels);
    return stdDev > 2;
  });

  if (classesWithHighSpread.length > 0) {
    tips.push({
      category: 'technique',
      tip: 'Turma heterogênea: use exercícios com variação de dificuldade. ' +
        'Mesmo drill, 3 níveis de complexidade.',
      relevance: 'medium',
      context: `${classesWithHighSpread.length} turma(s) com grande variação de nível`,
    });
  }

  // ── Performance comparison tip ──────────────────────────────
  if (input.instructorMetrics && input.academyAverageEngagement > 0) {
    const avgClassHealth = classBriefings.reduce((sum, b) => sum + b.healthScore, 0) / classBriefings.length;
    if (avgClassHealth > input.academyAverageEngagement + 10) {
      tips.push({
        category: 'motivation',
        tip: 'Suas turmas estão acima da média da academia! Continue assim. ' +
          'Compartilhe suas práticas com colegas instrutores.',
        relevance: 'low',
        context: `Saúde média das suas turmas: ${Math.round(avgClassHealth)} vs academia: ${input.academyAverageEngagement}`,
      });
    }
  }

  // Sort by relevance
  const relevanceOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => relevanceOrder[a.relevance] - relevanceOrder[b.relevance]);

  return tips;
}

// ════════════════════════════════════════════════════════════════════
// PERFORMANCE METRICS
// ════════════════════════════════════════════════════════════════════

function computePerformanceMetrics(
  input: CoachInput,
  classBriefings: ClassBriefing[],
): InstructorPerformanceMetrics {
  const allStudents = input.classes.flatMap(c => c.students);

  // Average class health
  const avgClassHealth = classBriefings.length > 0
    ? clampScore(classBriefings.reduce((sum, b) => sum + b.healthScore, 0) / classBriefings.length)
    : 0;

  // Students at risk (churn > 60)
  const studentsAtRisk = allStudents.filter(s => s.churnRisk > 60).length;

  // Students improving (engagement > 70 and streak > 7)
  const studentsImproving = allStudents.filter(
    s => s.engagementScore > 70 && s.streakCurrent > 7,
  ).length;

  // Retention and progression from instructor metrics
  const retentionScore = input.instructorMetrics?.avgStudentRetention ?? 0;
  const progressionScore = input.instructorMetrics?.avgStudentProgression ?? 0;

  return {
    avgClassHealth,
    studentsAtRisk,
    studentsImproving,
    retentionScore: clampScore(retentionScore),
    progressionScore: clampScore(progressionScore),
  };
}
