/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BUILD SNAPSHOT — Construtor do estado canônico                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Único ponto onde dados legados viram snapshot.                ║
 * ║  Chamado UMA vez por requisição.                               ║
 * ║  Todos os projectors lêem o resultado.                         ║
 * ║                                                                 ║
 * ║  Legacy Services → ACL → Snapshot                              ║
 * ║                             ↓                                   ║
 * ║                       Projector A → ViewModelA                 ║
 * ║                       Projector B → ViewModelB                 ║
 * ║                       Projector C → ViewModelC                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import * as gradService from '@/lib/api/graduacao.service';
import {
  mapToProgressState,
  mapToPromotionRules,
  mapToEvaluation,
  getDefaultMilestones,
  resolveMilestoneVisual,
} from '@/lib/acl';

import { utcNow } from '@/lib/domain/shared/time';
import type { PromotionRule, PromotionCriterion } from '@/lib/domain';
import type { ISODate } from '@/lib/domain';

import type {
  ParticipantDevelopmentSnapshot,
  ResolvedMilestone,
  ResolvedHistoryEntry,
  ResolvedEvaluation,
  PromotionEligibility,
  ResolvedCriterion,
} from './snapshot';

// ════════════════════════════════════════════════════════════════════
// BUILD
// ════════════════════════════════════════════════════════════════════

/**
 * buildDevelopmentSnapshot — Constrói o snapshot canônico.
 *
 * Este é O ponto de construção. Uma vez construído, projectors
 * apenas transformam — sem recalcular.
 */
export async function buildDevelopmentSnapshot(
  participantId: string,
  participantName?: string,
  participantAvatar?: string,
): Promise<ParticipantDevelopmentSnapshot> {
  // ── 1. Fetch legacy data (parallel) ─────────────────────────
  const [historico, requisitos, meusSubniveis, exames] = await Promise.all([
    gradService.getMinhaGraduacao(),
    gradService.getRequisitos(),
    gradService.getMeusSubniveis(),
    gradService.getExames().catch(() => []), // non-critical
  ]);

  // ── 2. Map through ACL ──────────────────────────────────────
  const progressState = mapToProgressState(
    participantId,
    historico,
    meusSubniveis,
  );
  const promotionRules = mapToPromotionRules(requisitos);
  const milestones = getDefaultMilestones();

  // ── 3. Resolve all milestones ───────────────────────────────
  const achievedIds = new Set(progressState.history.map(h => h.milestoneId));

  const allMilestones: ResolvedMilestone[] = milestones.map(m => ({
    id: m.id,
    name: m.name.default,
    visual: m.visual,
    order: m.order,
    isFinal: m.isFinal,
    isAchieved: achievedIds.has(m.id),
    isCurrent: m.id === progressState.currentMilestoneId,
  }));

  const currentMilestone = allMilestones.find(m => m.isCurrent) ?? allMilestones[0];
  const currentIdx = allMilestones.indexOf(currentMilestone);
  const nextMilestone = currentIdx < allMilestones.length - 1
    ? allMilestones[currentIdx + 1]
    : null;

  // ── 4. Compute time ─────────────────────────────────────────
  const months = progressState.accumulatedMetrics.monthsInCurrentMilestone;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let timeDisplay: string;
  if (years > 0 && remainingMonths > 0) {
    timeDisplay = `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  } else if (years > 0) {
    timeDisplay = `${years} ano${years > 1 ? 's' : ''}`;
  } else {
    timeDisplay = `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  // ── 5. Build promotion eligibility ──────────────────────────
  const promotion = buildPromotionEligibility(
    progressState,
    promotionRules,
    currentMilestone,
    nextMilestone,
  );

  // ── 6. Build history timeline ───────────────────────────────
  const history: ResolvedHistoryEntry[] = progressState.history.map((h, i) => ({
    milestoneId: h.milestoneId,
    milestoneName: h.milestoneName,
    milestoneVisual: resolveMilestoneVisual(h.milestoneName),
    date: h.achievedDate,
    dateFormatted: formatDate(h.achievedDate),
    awardedBy: h.awardedBy,
    isCurrent: i === progressState.history.length - 1,
  }));

  // ── 7. Build evaluations ────────────────────────────────────
  const evaluations: ResolvedEvaluation[] = exames.map(exam => {
    const domainEval = mapToEvaluation(exam);
    const ms = milestones.find(m => m.id === domainEval.targetMilestoneId);
    return {
      id: domainEval.id,
      targetMilestoneName: ms?.name.default ?? '—',
      targetMilestoneVisual: ms?.visual ?? { color: '#E5E7EB' as any },
      status: domainEval.status,
      statusLabel: STATUS_LABELS[domainEval.status] ?? domainEval.status,
      scheduledDate: formatDate(domainEval.scheduledDate),
      evaluator: domainEval.evaluatorId,
      passed: domainEval.result?.passed,
      feedback: domainEval.result?.feedback,
    };
  });

  // ── 8. Assemble snapshot ────────────────────────────────────
  return {
    schemaVersion: 1 as const,
    participantId,
    participantName: participantName ?? '',
    participantAvatar,
    trackId: progressState.trackId,

    currentMilestone,
    nextMilestone,

    sublevels: {
      current: progressState.currentSublevels,
      max: 4, // TODO: from track.sublevelConfig
      displayMode: 'stripe', // TODO: from track.sublevelConfig
    },

    time: {
      monthsInCurrentMilestone: months,
      displayText: timeDisplay,
      milestoneStartDate: progressState.milestoneStartDate,
      totalMonthsActive: 0, // TODO: from enrollment
    },

    activity: {
      totalSessions: progressState.accumulatedMetrics.totalSessions,
      totalHours: progressState.accumulatedMetrics.totalHours,
      attendancePercentage: progressState.accumulatedMetrics.attendancePercentage,
      currentStreak: progressState.accumulatedMetrics.currentStreak,
      bestStreak: progressState.accumulatedMetrics.bestStreak,
    },

    competencies: progressState.competencyScores.map(cs => ({
      id: cs.competencyId,
      name: cs.competencyId, // TODO: resolve name from track competencies
      score: cs.score,
      lastUpdated: cs.lastUpdated as ISODate,
    })),

    overallScore: progressState.overallScore,
    promotion,
    history,
    allMilestones,
    evaluations,
    computedAt: utcNow(),
  };
}

// ════════════════════════════════════════════════════════════════════
// PROMOTION ELIGIBILITY BUILDER
// ════════════════════════════════════════════════════════════════════

function buildPromotionEligibility(
  state: ReturnType<typeof mapToProgressState>,
  rules: PromotionRule[],
  current: ResolvedMilestone,
  next: ResolvedMilestone | null,
): PromotionEligibility {
  if (!next) {
    return {
      eligible: false,
      status: 'NO_NEXT_LEVEL',
      overallProgress: 100,
      criteria: [],
      requiresEvaluation: false,
      requiresInstructorApproval: false,
    };
  }

  const rule = rules.find(
    r => r.fromMilestoneId === current.id && r.toMilestoneId === next.id
  );

  if (!rule) {
    return {
      eligible: false,
      status: 'NOT_READY',
      overallProgress: 0,
      criteria: [],
      requiresEvaluation: false,
      requiresInstructorApproval: false,
    };
  }

  const metrics = state.accumulatedMetrics;
  const criteria: ResolvedCriterion[] = rule.criteria.map(c => resolveCriterion(c, metrics));

  const allMet = criteria.every(c => c.met);
  const overallProgress = criteria.length > 0
    ? Math.round(criteria.reduce((sum, c) => sum + c.progress, 0) / criteria.length)
    : 0;

  return {
    eligible: allMet,
    status: allMet ? 'ELIGIBLE' : 'NOT_READY',
    overallProgress,
    criteria,
    requiresEvaluation: rule.requiresEvaluation,
    requiresInstructorApproval: rule.requiresInstructorApproval,
  };
}

function resolveCriterion(
  criterion: PromotionCriterion,
  metrics: ReturnType<typeof mapToProgressState>['accumulatedMetrics'],
): ResolvedCriterion {
  switch (criterion.type) {
    case 'min_time_months': {
      const current = metrics.monthsInCurrentMilestone;
      const required = criterion.value;
      return { type: criterion.type, label: 'Tempo', current, required, unit: 'meses', met: current >= required, progress: clampProgress(current, required) };
    }
    case 'min_attendance_pct': {
      const current = metrics.attendancePercentage as number;
      const required = criterion.value as number;
      return { type: criterion.type, label: 'Presença', current, required, unit: '%', met: current >= required, progress: clampProgress(current, required) };
    }
    case 'min_sessions': {
      const current = metrics.totalSessions;
      const required = criterion.value;
      return { type: criterion.type, label: 'Sessões', current, required, unit: 'sessões', met: current >= required, progress: clampProgress(current, required) };
    }
    case 'min_hours': {
      const current = metrics.totalHours;
      const required = criterion.value;
      return { type: criterion.type, label: 'Horas', current, required, unit: 'h', met: current >= required, progress: clampProgress(current, required) };
    }
    case 'completed_items': {
      const current = metrics.itemsCompleted;
      const required = criterion.value;
      return { type: criterion.type, label: 'Itens', current, required, unit: 'itens', met: current >= required, progress: clampProgress(current, required) };
    }
    default: {
      return { type: criterion.type, label: criterion.type, current: 0, required: 0, unit: '', met: false, progress: 0 };
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function clampProgress(current: number, required: number): number {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((current / required) * 100));
}

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

const STATUS_LABELS: Record<string, string> = {
  'SCHEDULED': 'Agendada',
  'IN_PROGRESS': 'Em Andamento',
  'APPROVED': 'Aprovada',
  'FAILED': 'Reprovada',
  'CANCELLED': 'Cancelada',
};
