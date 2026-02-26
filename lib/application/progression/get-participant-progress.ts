/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  APPLICATION — PROGRESSION USE CASES                           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Orquestra: Legacy Services → ACL → Domain → ViewModels        ║
 * ║                                                                 ║
 * ║  A UI nunca vê entidades de domínio puras.                     ║
 * ║  Ela recebe ViewModels prontos para renderizar.                ║
 * ║                                                                 ║
 * ║  O Application Layer é o único que:                            ║
 * ║  • Chama serviços legados                                      ║
 * ║  • Passa pelo ACL                                               ║
 * ║  • Aplica lógica de negócio do domínio                         ║
 * ║  • Retorna ViewModels tipados                                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import * as gradService from '@/lib/api/graduacao.service';
import {
  mapToProgressState,
  mapToPromotionRules,
  mapToEvaluation,
  getDefaultMilestones,
  resolveMilestoneVisual,
  resolveMilestoneId,
} from '@/lib/acl';
import type {
  ProgressState,
  PromotionRule,
  PromotionCriterion,
  Milestone,
  VisualIdentity,
  Evaluation,
} from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// VIEW MODELS — O que a UI recebe
// ════════════════════════════════════════════════════════════════════

/**
 * ViewModel completo de progressão de um participante.
 *
 * Tudo que a UI precisa para renderizar a tela de graduação,
 * sem precisar saber nada sobre o domínio interno.
 */
export interface ProgressViewModel {
  /** Estado atual de progressão */
  current: {
    milestoneName: string;
    milestoneVisual: VisualIdentity;
    sublevels: number;
    maxSublevels: number;
    monthsInMilestone: number;
    /** "2 anos e 3 meses" */
    timeDisplay: string;
  };

  /** Próximo milestone (null se no final) */
  next: {
    milestoneName: string;
    milestoneVisual: VisualIdentity;
    requirements: PromotionRequirementVM[];
    /** 0..100 — progresso geral para o próximo nível */
    overallProgress: number;
  } | null;

  /** Timeline de milestones alcançados */
  timeline: TimelineEntryVM[];

  /** Todos os milestones da trilha (para contexto visual) */
  allMilestones: MilestoneVM[];

  /** Avaliações agendadas/recentes */
  evaluations: EvaluationVM[];

  /** Estado cru do domínio (para debug / instrutor) */
  _domainState: ProgressState;
}

export interface PromotionRequirementVM {
  label: string;
  current: number;
  required: number;
  unit: string;
  met: boolean;
  progress: number; // 0..100
}

export interface TimelineEntryVM {
  milestoneName: string;
  milestoneVisual: VisualIdentity;
  date: string;
  dateFormatted: string;
  awardedBy?: string;
  isCurrent: boolean;
}

export interface MilestoneVM {
  id: string;
  name: string;
  visual: VisualIdentity;
  order: number;
  isAchieved: boolean;
  isCurrent: boolean;
  isFinal: boolean;
}

export interface EvaluationVM {
  id: string;
  participantName: string;
  targetMilestoneName: string;
  targetMilestoneVisual: VisualIdentity;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'APPROVED' | 'FAILED' | 'CANCELLED';
  statusLabel: string;
  scheduledDate: string;
  evaluator: string;
  feedback?: string;
}

// ════════════════════════════════════════════════════════════════════
// USE CASE: Get Participant Progress
// ════════════════════════════════════════════════════════════════════

/**
 * getParticipantProgress — O primeiro caso de uso real.
 *
 * Fluxo:
 * 1. Busca dados legados (3 chamadas paralelas)
 * 2. Mapeia para domínio via ACL
 * 3. Calcula ViewModels prontos para UI
 * 4. Retorna sem expor entidades internas
 */
export async function getParticipantProgress(
  participantId: string,
): Promise<ProgressViewModel> {
  // 1. Buscar dados do legado
  const [historico, requisitos, meusSubniveis] = await Promise.all([
    gradService.getMinhaGraduacao(),
    gradService.getRequisitos(),
    gradService.getMeusSubniveis(),
  ]);

  // 2. Mapear para domínio via ACL
  const progressState = mapToProgressState(
    participantId,
    historico,
    meusSubniveis,
  );
  const promotionRules = mapToPromotionRules(requisitos);
  const milestones = getDefaultMilestones();

  // 3. Calcular ViewModels
  return buildProgressViewModel(progressState, promotionRules, milestones);
}

/**
 * getEvaluations — Busca avaliações (exames).
 */
export async function getEvaluations(): Promise<EvaluationVM[]> {
  const exames = await gradService.getExames();
  return exames.map(exam => {
    const domainEval = mapToEvaluation(exam);
    const milestone = getDefaultMilestones().find(m => m.id === domainEval.targetMilestoneId);
    return mapEvaluationToVM(domainEval, exam.alunoNome, milestone);
  });
}

// ════════════════════════════════════════════════════════════════════
// BUILDERS — Pure functions that transform domain → viewmodel
// ════════════════════════════════════════════════════════════════════

function buildProgressViewModel(
  state: ProgressState,
  rules: PromotionRule[],
  milestones: Milestone[],
): ProgressViewModel {
  const currentMilestone = milestones.find(m => m.id === state.currentMilestoneId) ?? milestones[0];
  const currentIdx = milestones.indexOf(currentMilestone);
  const nextMilestone = currentIdx < milestones.length - 1 ? milestones[currentIdx + 1] : null;

  // Find promotion rule for current → next
  const rule = nextMilestone
    ? rules.find(r =>
        r.fromMilestoneId === state.currentMilestoneId &&
        r.toMilestoneId === nextMilestone.id
      )
    : null;

  // Build requirements VM
  const requirements = rule ? buildRequirementsVM(rule, state) : [];
  const overallProgress = requirements.length > 0
    ? Math.round(requirements.reduce((sum, r) => sum + r.progress, 0) / requirements.length)
    : 0;

  // Build timeline
  const timeline: TimelineEntryVM[] = state.history.map((h, i) => ({
    milestoneName: h.milestoneName,
    milestoneVisual: resolveMilestoneVisual(h.milestoneName),
    date: h.achievedDate,
    dateFormatted: formatDate(h.achievedDate),
    awardedBy: h.awardedBy,
    isCurrent: i === state.history.length - 1,
  }));

  // Build all milestones
  const achievedMilestoneIds = new Set(state.history.map(h => h.milestoneId));
  const allMilestones: MilestoneVM[] = milestones.map(m => ({
    id: m.id,
    name: m.name.default,
    visual: m.visual,
    order: m.order,
    isAchieved: achievedMilestoneIds.has(m.id),
    isCurrent: m.id === state.currentMilestoneId,
    isFinal: m.isFinal,
  }));

  // Time display
  const months = state.accumulatedMetrics.monthsInCurrentMilestone;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const timeDisplay = years > 0
    ? `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
    : `${months} ${months === 1 ? 'mês' : 'meses'}`;

  return {
    current: {
      milestoneName: currentMilestone.name.default,
      milestoneVisual: currentMilestone.visual,
      sublevels: state.currentSublevels,
      maxSublevels: 4, // TODO: from SublevelConfig
      monthsInMilestone: months,
      timeDisplay,
    },
    next: nextMilestone
      ? {
          milestoneName: nextMilestone.name.default,
          milestoneVisual: nextMilestone.visual,
          requirements,
          overallProgress,
        }
      : null,
    timeline,
    allMilestones,
    evaluations: [],
    _domainState: state,
  };
}

function buildRequirementsVM(
  rule: PromotionRule,
  state: ProgressState,
): PromotionRequirementVM[] {
  const metrics = state.accumulatedMetrics;

  return rule.criteria.map((criterion): PromotionRequirementVM => {
    switch (criterion.type) {
      case 'min_time_months': {
        const current = metrics.monthsInCurrentMilestone;
        const required = criterion.value;
        return {
          label: 'Tempo',
          current,
          required,
          unit: 'meses',
          met: current >= required,
          progress: Math.min(100, Math.round((current / required) * 100)),
        };
      }
      case 'min_attendance_pct': {
        const current = metrics.attendancePercentage;
        const required = criterion.value;
        return {
          label: 'Presença',
          current,
          required,
          unit: '%',
          met: current >= required,
          progress: Math.min(100, Math.round((current / required) * 100)),
        };
      }
      case 'min_sessions': {
        const current = metrics.totalSessions;
        const required = criterion.value;
        return {
          label: 'Sessões',
          current,
          required,
          unit: 'sessões',
          met: current >= required,
          progress: Math.min(100, Math.round((current / required) * 100)),
        };
      }
      case 'min_hours': {
        const current = metrics.totalHours;
        const required = criterion.value;
        return {
          label: 'Horas',
          current,
          required,
          unit: 'h',
          met: current >= required,
          progress: Math.min(100, Math.round((current / required) * 100)),
        };
      }
      default: {
        return {
          label: criterion.type,
          current: 0,
          required: 0,
          unit: '',
          met: false,
          progress: 0,
        };
      }
    }
  });
}

function mapEvaluationToVM(
  evaluation: Evaluation,
  participantName: string,
  milestone?: Milestone,
): EvaluationVM {
  const statusLabels: Record<string, string> = {
    'SCHEDULED': 'Agendada',
    'IN_PROGRESS': 'Em Andamento',
    'APPROVED': 'Aprovada',
    'FAILED': 'Reprovada',
    'CANCELLED': 'Cancelada',
  };

  return {
    id: evaluation.id,
    participantName,
    targetMilestoneName: milestone?.name.default ?? '—',
    targetMilestoneVisual: milestone?.visual ?? { color: '#E5E7EB' as any },
    status: evaluation.status,
    statusLabel: statusLabels[evaluation.status] ?? evaluation.status,
    scheduledDate: formatDate(evaluation.scheduledDate),
    evaluator: evaluation.evaluatorId,
    feedback: evaluation.result?.feedback,
  };
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
