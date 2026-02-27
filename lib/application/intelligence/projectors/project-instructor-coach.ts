/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INSTRUCTOR COACH PROJECTOR — ViewModel do Professor            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Transforma InstructorCoachBriefing em ViewModel amigavel       ║
 * ║  para a interface do professor. Quase 1:1 do engine output      ║
 * ║  com ajustes de formatacao e ordenacao.                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  InstructorCoachBriefing,
  ClassBriefing,
  SpotlightStudent,
  PedagogicalTip,
  InstructorPerformanceMetrics,
} from '@/lib/domain/intelligence/models/instructor-coach.types';
import type { Priority } from '@/lib/domain/intelligence/core/types';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface InstructorCoachVM {
  instructorName: string;
  date: string;
  greeting: string;

  daySummary: {
    totalClasses: number;
    totalStudents: number;
    classesNeedingAttention: number;
    topPriority: string;
    overallMood: 'great' | 'good' | 'attention' | 'critical';
  };

  classBriefings: ClassBriefingVM[];
  pedagogicalTips: PedagogicalTipVM[];
  performanceMetrics: PerformanceMetricsVM;
  confidence: number;
  computedAt: string;
}

export interface ClassBriefingVM {
  classId: string;
  className: string;
  time: string;
  studentCount: number;
  healthScore: number;
  healthLabel: string;
  healthColor: 'green' | 'yellow' | 'orange' | 'red';
  priorityStudents: SpotlightStudentVM[];
  suggestedFocus: string;
  warmupSuggestion: string;
}

export interface SpotlightStudentVM {
  participantId: string;
  name: string;
  reason: string;
  action: string;
  priority: Priority;
  priorityColor: 'red' | 'orange' | 'yellow' | 'blue';
}

export interface PedagogicalTipVM {
  category: string;
  categoryIcon: string;
  tip: string;
  relevance: 'high' | 'medium' | 'low';
  context: string;
}

export interface PerformanceMetricsVM {
  avgClassHealth: number;
  avgClassHealthLabel: string;
  studentsAtRisk: number;
  studentsImproving: number;
  retentionScore: number;
  progressionScore: number;
}

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectInstructorCoach(
  briefing: InstructorCoachBriefing,
): InstructorCoachVM {
  return {
    instructorName: briefing.instructorName,
    date: briefing.date,
    greeting: buildGreeting(briefing),
    daySummary: buildDaySummary(briefing),
    classBriefings: briefing.classBriefings.map(mapClassBriefing),
    pedagogicalTips: briefing.pedagogicalTips.map(mapPedagogicalTip),
    performanceMetrics: mapPerformanceMetrics(briefing.performanceMetrics),
    confidence: briefing.confidence,
    computedAt: briefing.computedAt,
  };
}

// ════════════════════════════════════════════════════════════════════
// GREETING
// ════════════════════════════════════════════════════════════════════

function buildGreeting(briefing: InstructorCoachBriefing): string {
  const firstName = briefing.instructorName.split(' ')[0] ?? 'Professor';
  const totalStudents = briefing.daySummary.totalStudents;
  const totalClasses = briefing.daySummary.totalClasses;

  if (totalClasses === 0) {
    return `Ola, ${firstName}! Sem aulas agendadas hoje. Aproveite para revisar metricas.`;
  }

  if (briefing.daySummary.classesNeedingAttention === 0) {
    return `Bom dia, ${firstName}! ${totalClasses} turma(s) hoje com ${totalStudents} aluno(s). Tudo sob controle!`;
  }

  return `Ola, ${firstName}! ${totalClasses} turma(s) hoje. ${briefing.daySummary.classesNeedingAttention} precisa(m) de atencao especial.`;
}

// ════════════════════════════════════════════════════════════════════
// DAY SUMMARY
// ════════════════════════════════════════════════════════════════════

function buildDaySummary(briefing: InstructorCoachBriefing): InstructorCoachVM['daySummary'] {
  const { daySummary, classBriefings } = briefing;

  // Compute overall mood
  let overallMood: InstructorCoachVM['daySummary']['overallMood'] = 'great';
  const avgHealth = classBriefings.length > 0
    ? classBriefings.reduce((sum, b) => sum + b.healthScore, 0) / classBriefings.length
    : 100;

  if (avgHealth < 40 || daySummary.classesNeedingAttention >= 2) {
    overallMood = 'critical';
  } else if (avgHealth < 60 || daySummary.classesNeedingAttention >= 1) {
    overallMood = 'attention';
  } else if (avgHealth < 80) {
    overallMood = 'good';
  }

  return {
    totalClasses: daySummary.totalClasses,
    totalStudents: daySummary.totalStudents,
    classesNeedingAttention: daySummary.classesNeedingAttention,
    topPriority: daySummary.topPriority,
    overallMood,
  };
}

// ════════════════════════════════════════════════════════════════════
// CLASS BRIEFING MAPPING
// ════════════════════════════════════════════════════════════════════

function mapClassBriefing(briefing: ClassBriefing): ClassBriefingVM {
  const { healthLabel, healthColor } = mapHealthScore(briefing.healthScore);

  return {
    classId: briefing.classId,
    className: briefing.className,
    time: briefing.time,
    studentCount: briefing.studentCount,
    healthScore: briefing.healthScore,
    healthLabel,
    healthColor,
    priorityStudents: briefing.priorityStudents.map(mapSpotlightStudent),
    suggestedFocus: briefing.suggestedFocus,
    warmupSuggestion: briefing.warmupSuggestion,
  };
}

function mapHealthScore(score: number): { healthLabel: string; healthColor: ClassBriefingVM['healthColor'] } {
  if (score >= 80) return { healthLabel: 'Saudavel', healthColor: 'green' };
  if (score >= 60) return { healthLabel: 'Boa', healthColor: 'yellow' };
  if (score >= 40) return { healthLabel: 'Atencao', healthColor: 'orange' };
  return { healthLabel: 'Critica', healthColor: 'red' };
}

function mapSpotlightStudent(student: SpotlightStudent): SpotlightStudentVM {
  const priorityColorMap: Record<Priority, SpotlightStudentVM['priorityColor']> = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
  };

  return {
    participantId: student.participantId,
    name: student.participantName,
    reason: student.reason,
    action: student.suggestedAction,
    priority: student.priority,
    priorityColor: priorityColorMap[student.priority] ?? 'blue',
  };
}

// ════════════════════════════════════════════════════════════════════
// PEDAGOGICAL TIP MAPPING
// ════════════════════════════════════════════════════════════════════

function mapPedagogicalTip(tip: PedagogicalTip): PedagogicalTipVM {
  const iconMap: Record<string, string> = {
    retention: 'shield',
    progression: 'trending-up',
    motivation: 'heart',
    technique: 'target',
  };

  const labelMap: Record<string, string> = {
    retention: 'Retencao',
    progression: 'Progressao',
    motivation: 'Motivacao',
    technique: 'Tecnica',
  };

  return {
    category: labelMap[tip.category] ?? tip.category,
    categoryIcon: iconMap[tip.category] ?? 'info',
    tip: tip.tip,
    relevance: tip.relevance,
    context: tip.context,
  };
}

// ════════════════════════════════════════════════════════════════════
// PERFORMANCE METRICS MAPPING
// ════════════════════════════════════════════════════════════════════

function mapPerformanceMetrics(
  metrics: InstructorPerformanceMetrics,
): PerformanceMetricsVM {
  let avgClassHealthLabel: string;
  if (metrics.avgClassHealth >= 80) avgClassHealthLabel = 'Excelente';
  else if (metrics.avgClassHealth >= 60) avgClassHealthLabel = 'Boa';
  else if (metrics.avgClassHealth >= 40) avgClassHealthLabel = 'Regular';
  else avgClassHealthLabel = 'Precisa de Atencao';

  return {
    avgClassHealth: metrics.avgClassHealth,
    avgClassHealthLabel,
    studentsAtRisk: metrics.studentsAtRisk,
    studentsImproving: metrics.studentsImproving,
    retentionScore: metrics.retentionScore,
    progressionScore: metrics.progressionScore,
  };
}
