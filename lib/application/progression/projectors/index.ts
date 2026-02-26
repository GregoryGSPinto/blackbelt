/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROJECTORS — Admin, Ranking, Eligibility, Notification, Card  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Cada projector lê do mesmo ParticipantDevelopmentSnapshot     ║
 * ║  e produz um ViewModel específico para seu contexto.           ║
 * ║                                                                 ║
 * ║  Zero recálculo. Zero divergência. Zero duplicação de regra.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ParticipantDevelopmentSnapshot } from '../state/snapshot';
import type { VisualIdentity } from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD PROJECTOR
// ════════════════════════════════════════════════════════════════════

/** Para listagens administrativas — dados tabulares */
export interface AdminParticipantRowVM {
  id: string;
  name: string;
  avatar?: string;
  milestoneName: string;
  milestoneVisual: VisualIdentity;
  sublevels: string; // "2/4"
  monthsInMilestone: number;
  attendancePercentage: number;
  promotionEligible: boolean;
  promotionProgress: number;
  alertCount: number;
}

export function projectAdminRow(
  snapshot: ParticipantDevelopmentSnapshot,
): AdminParticipantRowVM {
  return {
    id: snapshot.participantId,
    name: snapshot.participantName,
    avatar: snapshot.participantAvatar,
    milestoneName: snapshot.currentMilestone.name,
    milestoneVisual: snapshot.currentMilestone.visual,
    sublevels: `${snapshot.sublevels.current}/${snapshot.sublevels.max}`,
    monthsInMilestone: snapshot.time.monthsInCurrentMilestone,
    attendancePercentage: snapshot.activity.attendancePercentage as number,
    promotionEligible: snapshot.promotion.eligible,
    promotionProgress: snapshot.promotion.overallProgress,
    alertCount: computeAlertCount(snapshot),
  };
}

function computeAlertCount(s: ParticipantDevelopmentSnapshot): number {
  let count = 0;
  if (s.promotion.eligible) count++;
  if ((s.activity.attendancePercentage as number) < 60) count++;
  if (s.time.monthsInCurrentMilestone > 24 && !s.promotion.eligible) count++;
  if (s.sublevels.current >= s.sublevels.max && !s.promotion.eligible) count++;
  return count;
}

// ════════════════════════════════════════════════════════════════════
// RANKING PROJECTOR
// ════════════════════════════════════════════════════════════════════

/** Para leaderboards e comparação entre participantes */
export interface RankingParticipantVM {
  id: string;
  name: string;
  avatar?: string;
  milestoneName: string;
  milestoneVisual: VisualIdentity;
  milestoneOrder: number;
  sublevels: number;
  totalSessions: number;
  currentStreak: number;
  /** Sortable score: milestone_order * 1000 + sublevels * 100 + sessions */
  sortableScore: number;
}

export function projectRanking(
  snapshot: ParticipantDevelopmentSnapshot,
): RankingParticipantVM {
  return {
    id: snapshot.participantId,
    name: snapshot.participantName,
    avatar: snapshot.participantAvatar,
    milestoneName: snapshot.currentMilestone.name,
    milestoneVisual: snapshot.currentMilestone.visual,
    milestoneOrder: snapshot.currentMilestone.order,
    sublevels: snapshot.sublevels.current,
    totalSessions: snapshot.activity.totalSessions,
    currentStreak: snapshot.activity.currentStreak,
    sortableScore:
      snapshot.currentMilestone.order * 1000 +
      snapshot.sublevels.current * 100 +
      Math.min(99, snapshot.activity.totalSessions),
  };
}

// ════════════════════════════════════════════════════════════════════
// ELIGIBILITY PROJECTOR (eventos, exames)
// ════════════════════════════════════════════════════════════════════

/** Para validar se participante pode se inscrever em evento/exame */
export interface EligibilityVM {
  participantId: string;
  milestoneName: string;
  milestoneOrder: number;
  sublevels: number;
  attendancePercentage: number;
  monthsInMilestone: number;
  promotionEligible: boolean;

  /** Pode se inscrever em evento de nível X? */
  canEnterEventAtLevel: (requiredMilestoneOrder: number) => boolean;
  /** Pode fazer exame de promoção? */
  canTakePromotionExam: boolean;
}

export function projectEligibility(
  snapshot: ParticipantDevelopmentSnapshot,
): EligibilityVM {
  return {
    participantId: snapshot.participantId,
    milestoneName: snapshot.currentMilestone.name,
    milestoneOrder: snapshot.currentMilestone.order,
    sublevels: snapshot.sublevels.current,
    attendancePercentage: snapshot.activity.attendancePercentage as number,
    monthsInMilestone: snapshot.time.monthsInCurrentMilestone,
    promotionEligible: snapshot.promotion.eligible,
    canEnterEventAtLevel: (requiredOrder: number) =>
      snapshot.currentMilestone.order >= requiredOrder,
    canTakePromotionExam:
      snapshot.promotion.eligible && snapshot.promotion.requiresEvaluation,
  };
}

// ════════════════════════════════════════════════════════════════════
// NOTIFICATION PROJECTOR
// ════════════════════════════════════════════════════════════════════

/** Notificações derivadas automaticamente do estado de progressão */
export interface ProgressNotificationVM {
  type: string;
  title: string;
  body: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export function projectNotifications(
  snapshot: ParticipantDevelopmentSnapshot,
): ProgressNotificationVM[] {
  const notifications: ProgressNotificationVM[] = [];

  if (snapshot.promotion.eligible) {
    notifications.push({
      type: 'promotion_ready',
      title: 'Promoção disponível!',
      body: `Você atende todos os requisitos para ${snapshot.nextMilestone?.name ?? 'o próximo nível'}.`,
      icon: '🎉',
      priority: 'high',
      actionUrl: '/graduacao',
    });
  }

  if (snapshot.promotion.overallProgress >= 80 && !snapshot.promotion.eligible) {
    notifications.push({
      type: 'promotion_close',
      title: 'Quase lá!',
      body: `${snapshot.promotion.overallProgress}% dos requisitos alcançados para ${snapshot.nextMilestone?.name}.`,
      icon: '🔥',
      priority: 'medium',
      actionUrl: '/graduacao',
    });
  }

  for (const evaluation of snapshot.evaluations) {
    if (evaluation.status === 'SCHEDULED') {
      notifications.push({
        type: 'evaluation_scheduled',
        title: 'Avaliação agendada',
        body: `Avaliação para ${evaluation.targetMilestoneName} em ${evaluation.scheduledDate}.`,
        icon: '📋',
        priority: 'high',
      });
    }
    if (evaluation.status === 'APPROVED') {
      notifications.push({
        type: 'evaluation_passed',
        title: 'Parabéns!',
        body: `Avaliação para ${evaluation.targetMilestoneName} aprovada!`,
        icon: '🏆',
        priority: 'high',
      });
    }
  }

  if (snapshot.activity.currentStreak >= 7 && snapshot.activity.currentStreak % 7 === 0) {
    notifications.push({
      type: 'streak_milestone',
      title: `Sequência de ${snapshot.activity.currentStreak} dias!`,
      body: 'Continue com essa consistência incrível.',
      icon: '⚡',
      priority: 'low',
    });
  }

  return notifications;
}

// ════════════════════════════════════════════════════════════════════
// CARD / CERTIFICATE PROJECTOR
// ════════════════════════════════════════════════════════════════════

/** Dados para carteirinha digital e certificados */
export interface DigitalCardVM {
  participantId: string;
  participantName: string;
  avatar?: string;
  milestoneName: string;
  milestoneVisual: VisualIdentity;
  sublevels: number;
  maxSublevels: number;
  sublevelDisplay: 'stripe' | 'star' | 'dot' | 'number' | 'progress_bar';
  memberSince?: string;
  /** QR payload */
  qrData: string;
}

export function projectDigitalCard(
  snapshot: ParticipantDevelopmentSnapshot,
): DigitalCardVM {
  return {
    participantId: snapshot.participantId,
    participantName: snapshot.participantName,
    avatar: snapshot.participantAvatar,
    milestoneName: snapshot.currentMilestone.name,
    milestoneVisual: snapshot.currentMilestone.visual,
    sublevels: snapshot.sublevels.current,
    maxSublevels: snapshot.sublevels.max,
    sublevelDisplay: snapshot.sublevels.displayMode,
    memberSince: snapshot.time.enrollmentDate,
    qrData: JSON.stringify({
      pid: snapshot.participantId,
      ms: snapshot.currentMilestone.id,
      sl: snapshot.sublevels.current,
      t: snapshot.computedAt,
    }),
  };
}

// ════════════════════════════════════════════════════════════════════
// DASHBOARD CARD PROJECTOR (mini widget no início)
// ════════════════════════════════════════════════════════════════════

/** Card compacto para o dashboard do aluno */
export interface DashboardProgressCardVM {
  milestoneName: string;
  milestoneVisual: VisualIdentity;
  sublevels: number;
  maxSublevels: number;
  sublevelDisplay: 'stripe' | 'star' | 'dot' | 'number' | 'progress_bar';
  nextMilestoneName?: string;
  promotionProgress: number;
  streak: number;
}

export function projectDashboardCard(
  snapshot: ParticipantDevelopmentSnapshot,
): DashboardProgressCardVM {
  return {
    milestoneName: snapshot.currentMilestone.name,
    milestoneVisual: snapshot.currentMilestone.visual,
    sublevels: snapshot.sublevels.current,
    maxSublevels: snapshot.sublevels.max,
    sublevelDisplay: snapshot.sublevels.displayMode,
    nextMilestoneName: snapshot.nextMilestone?.name,
    promotionProgress: snapshot.promotion.overallProgress,
    streak: snapshot.activity.currentStreak,
  };
}
