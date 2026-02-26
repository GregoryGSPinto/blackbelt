/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROJECTOR — Instructor Progress                               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Projeta o snapshot para a visão do INSTRUTOR.                 ║
 * ║  Lógica: detalhar, avaliar, decidir promoção.                 ║
 * ║                                                                 ║
 * ║  Telas que consomem:                                            ║
 * ║  • professor-aluno/[id]/page.tsx (ficha do aluno)              ║
 * ║  • professor-graduacoes (lista de promoções pendentes)         ║
 * ║  • professor-chamada (contexto de presença)                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ParticipantDevelopmentSnapshot, ResolvedCriterion, ResolvedEvaluation } from '../state/snapshot';
import type { VisualIdentity } from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface InstructorProgressVM {
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };

  current: {
    name: string;
    visual: VisualIdentity;
    sublevels: number;
    maxSublevels: number;
    timeDisplay: string;
    monthsInMilestone: number;
  };

  next: {
    name: string;
    visual: VisualIdentity;
  } | null;

  /** Métricas detalhadas (instrutor precisa ver números) */
  metrics: {
    totalSessions: number;
    totalHours: number;
    attendancePercentage: number;
    currentStreak: number;
    bestStreak: number;
    overallScore: number;
  };

  /** Elegibilidade detalhada com cada critério */
  promotion: {
    eligible: boolean;
    status: string;
    overallProgress: number;
    criteria: ResolvedCriterion[];
    requiresEvaluation: boolean;
    canPromoteNow: boolean;
  };

  /** Competências com scores (para avaliação pedagógica) */
  competencies: {
    id: string;
    name: string;
    score: number;
    category?: string;
  }[];

  /** Avaliações passadas e futuras */
  evaluations: ResolvedEvaluation[];

  /** Alertas pedagógicos */
  alerts: InstructorAlert[];
}

export interface InstructorAlert {
  type: 'attendance_drop' | 'long_plateau' | 'ready_for_promotion' | 'sublevel_due' | 'streak_broken';
  severity: 'info' | 'warning' | 'success';
  message: string;
}

// ════════════════════════════════════════════════════════════════════
// PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectInstructorProgress(
  snapshot: ParticipantDevelopmentSnapshot,
): InstructorProgressVM {
  return {
    participant: {
      id: snapshot.participantId,
      name: snapshot.participantName,
      avatar: snapshot.participantAvatar,
    },

    current: {
      name: snapshot.currentMilestone.name,
      visual: snapshot.currentMilestone.visual,
      sublevels: snapshot.sublevels.current,
      maxSublevels: snapshot.sublevels.max,
      timeDisplay: snapshot.time.displayText,
      monthsInMilestone: snapshot.time.monthsInCurrentMilestone,
    },

    next: snapshot.nextMilestone
      ? { name: snapshot.nextMilestone.name, visual: snapshot.nextMilestone.visual }
      : null,

    metrics: {
      totalSessions: snapshot.activity.totalSessions,
      totalHours: snapshot.activity.totalHours,
      attendancePercentage: snapshot.activity.attendancePercentage as number,
      currentStreak: snapshot.activity.currentStreak,
      bestStreak: snapshot.activity.bestStreak,
      overallScore: snapshot.overallScore as number,
    },

    promotion: {
      eligible: snapshot.promotion.eligible,
      status: snapshot.promotion.status,
      overallProgress: snapshot.promotion.overallProgress,
      criteria: snapshot.promotion.criteria,
      requiresEvaluation: snapshot.promotion.requiresEvaluation,
      canPromoteNow: snapshot.promotion.eligible && !snapshot.promotion.requiresEvaluation,
    },

    competencies: snapshot.competencies.map(c => ({
      id: c.id,
      name: c.name,
      score: c.score as number,
      category: c.category,
    })),

    evaluations: snapshot.evaluations,

    alerts: buildAlerts(snapshot),
  };
}

// ════════════════════════════════════════════════════════════════════
// ALERT ENGINE
// ════════════════════════════════════════════════════════════════════

function buildAlerts(snapshot: ParticipantDevelopmentSnapshot): InstructorAlert[] {
  const alerts: InstructorAlert[] = [];
  const { activity, promotion, sublevels, time } = snapshot;

  if (promotion.eligible) {
    alerts.push({
      type: 'ready_for_promotion',
      severity: 'success',
      message: `Atende todos os requisitos para ${snapshot.nextMilestone?.name ?? 'próximo nível'}.`,
    });
  }

  if ((activity.attendancePercentage as number) < 60 && time.monthsInCurrentMilestone > 2) {
    alerts.push({
      type: 'attendance_drop',
      severity: 'warning',
      message: `Presença em ${activity.attendancePercentage}% — abaixo do recomendado.`,
    });
  }

  if (time.monthsInCurrentMilestone > 24 && !promotion.eligible) {
    alerts.push({
      type: 'long_plateau',
      severity: 'warning',
      message: `Há ${time.displayText} no mesmo nível. Considere avaliar barreiras.`,
    });
  }

  if (sublevels.current >= sublevels.max && !promotion.eligible) {
    alerts.push({
      type: 'sublevel_due',
      severity: 'info',
      message: `Já possui ${sublevels.current}/${sublevels.max} subníveis — próximo passo é promoção.`,
    });
  }

  return alerts;
}
