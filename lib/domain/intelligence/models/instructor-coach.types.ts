/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INSTRUCTOR COACH TYPES — Briefing Diário do Professor          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Input e Output do engine de coaching pedagógico.               ║
 * ║  Gera briefings por aula, dicas pedagógicas e métricas.         ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  Confidence,
  Priority,
  EngagementTier,
  SpotlightContextType,
} from '../core/types';

import type { ClassInsight } from './class-insight.types';

// ════════════════════════════════════════════════════════════════════
// COACH INPUT — Dados de entrada para o briefing diário
// ════════════════════════════════════════════════════════════════════

export interface CoachStudentSnapshot {
  participantId: string;
  participantName: string;
  engagementTier: EngagementTier;
  engagementScore: Score0to100;
  churnRisk: Score0to100;
  currentMilestone: string;
  currentSublevel: number;
  daysSinceLastCheckin: number;
  daysSinceEnrollment: number;
  streakCurrent: number;
  recentContext?: SpotlightContextType;
}

export interface CoachClassData {
  classId: string;
  className: string;
  scheduledTime: string;
  insight: ClassInsight;
  students: CoachStudentSnapshot[];
}

export interface CoachInput {
  instructorId: string;
  instructorName: string;
  date: string;
  classes: CoachClassData[];
  academyAverageEngagement: Score0to100;
  instructorMetrics?: {
    avgStudentRetention: number;
    avgStudentProgression: number;
    classesPerWeek: number;
    totalActiveStudents: number;
  };
}

// ════════════════════════════════════════════════════════════════════
// CLASS BRIEFING — Resumo por aula
// ════════════════════════════════════════════════════════════════════

export interface ClassBriefing {
  classId: string;
  className: string;
  time: string;
  studentCount: number;
  healthScore: Score0to100;
  priorityStudents: SpotlightStudent[];
  suggestedFocus: string;
  warmupSuggestion: string;
}

export interface SpotlightStudent {
  participantId: string;
  participantName: string;
  reason: string;
  suggestedAction: string;
  priority: Priority;
}

// ════════════════════════════════════════════════════════════════════
// PEDAGOGICAL TIPS
// ════════════════════════════════════════════════════════════════════

export interface PedagogicalTip {
  category: 'retention' | 'progression' | 'motivation' | 'technique';
  tip: string;
  relevance: 'high' | 'medium' | 'low';
  context: string;
}

// ════════════════════════════════════════════════════════════════════
// PERFORMANCE METRICS
// ════════════════════════════════════════════════════════════════════

export interface InstructorPerformanceMetrics {
  avgClassHealth: Score0to100;
  studentsAtRisk: number;
  studentsImproving: number;
  retentionScore: Score0to100;
  progressionScore: Score0to100;
}

// ════════════════════════════════════════════════════════════════════
// INSTRUCTOR COACH BRIEFING — Output principal
// ════════════════════════════════════════════════════════════════════

export interface InstructorCoachBriefing {
  instructorId: string;
  instructorName: string;
  date: string;
  daySummary: {
    totalClasses: number;
    totalStudents: number;
    classesNeedingAttention: number;
    topPriority: string;
  };
  classBriefings: ClassBriefing[];
  pedagogicalTips: PedagogicalTip[];
  performanceMetrics: InstructorPerformanceMetrics;
  confidence: Confidence;
  computedAt: string;
}
