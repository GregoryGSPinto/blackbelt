/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROJECTOR — Student Progress                                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Projeta o snapshot canônico para a visão do ALUNO.            ║
 * ║  Lógica: simplificar, motivar, mostrar caminho.               ║
 * ║                                                                 ║
 * ║  Telas que consomem:                                            ║
 * ║  • graduacao/page.tsx (tela principal de progressão)           ║
 * ║  • inicio/page.tsx (card de progresso no dashboard)            ║
 * ║  • perfil (seção de evolução)                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ParticipantDevelopmentSnapshot, ResolvedCriterion } from '../state/snapshot';
import type { VisualIdentity } from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface StudentProgressVM {
  current: {
    name: string;
    visual: VisualIdentity;
    sublevels: number;
    maxSublevels: number;
    sublevelDisplay: 'stripe' | 'star' | 'dot' | 'number' | 'progress_bar';
    timeDisplay: string;
  };

  next: {
    name: string;
    visual: VisualIdentity;
    overallProgress: number;
    requirements: StudentRequirementVM[];
  } | null;

  timeline: StudentTimelineEntryVM[];

  /** Mensagem motivacional baseada no estado */
  motivationalMessage: string;
}

export interface StudentRequirementVM {
  label: string;
  current: number;
  required: number;
  unit: string;
  met: boolean;
  progress: number;
}

export interface StudentTimelineEntryVM {
  name: string;
  visual: VisualIdentity;
  dateFormatted: string;
  awardedBy?: string;
  isCurrent: boolean;
}

// ════════════════════════════════════════════════════════════════════
// PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectStudentProgress(
  snapshot: ParticipantDevelopmentSnapshot,
): StudentProgressVM {
  return {
    current: {
      name: snapshot.currentMilestone.name,
      visual: snapshot.currentMilestone.visual,
      sublevels: snapshot.sublevels.current,
      maxSublevels: snapshot.sublevels.max,
      sublevelDisplay: snapshot.sublevels.displayMode,
      timeDisplay: snapshot.time.displayText,
    },

    next: snapshot.nextMilestone
      ? {
          name: snapshot.nextMilestone.name,
          visual: snapshot.nextMilestone.visual,
          overallProgress: snapshot.promotion.overallProgress,
          requirements: snapshot.promotion.criteria.map(c => ({
            label: c.label,
            current: c.current,
            required: c.required,
            unit: c.unit,
            met: c.met,
            progress: c.progress,
          })),
        }
      : null,

    timeline: snapshot.history.map(h => ({
      name: h.milestoneName,
      visual: h.milestoneVisual,
      dateFormatted: h.dateFormatted,
      awardedBy: h.awardedBy,
      isCurrent: h.isCurrent,
    })),

    motivationalMessage: buildMotivation(snapshot),
  };
}

// ════════════════════════════════════════════════════════════════════
// MOTIVATION ENGINE
// ════════════════════════════════════════════════════════════════════

function buildMotivation(snapshot: ParticipantDevelopmentSnapshot): string {
  const { promotion, activity, time } = snapshot;

  if (promotion.status === 'NO_NEXT_LEVEL') {
    return 'Parabéns! Você alcançou o nível máximo. Continue inspirando outros!';
  }

  if (promotion.eligible) {
    return 'Você já atende todos os requisitos para a próxima promoção!';
  }

  if (promotion.overallProgress >= 80) {
    return 'Quase lá! Você está muito perto do próximo nível.';
  }

  if (activity.currentStreak >= 7) {
    return `Sequência incrível de ${activity.currentStreak} dias! Continue assim.`;
  }

  if (time.monthsInCurrentMilestone >= 6) {
    const metCount = promotion.criteria.filter(c => c.met).length;
    const totalCount = promotion.criteria.length;
    if (totalCount > 0) {
      return `${metCount} de ${totalCount} requisitos alcançados. Cada sessão conta!`;
    }
  }

  return 'Continue praticando — cada sessão te aproxima do próximo nível!';
}
