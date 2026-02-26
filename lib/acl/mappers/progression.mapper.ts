/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ACL — PROGRESSION MAPPERS                                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Traduz entidades legadas (contracts.ts) ↔ Domain Engine.      ║
 * ║                                                                 ║
 * ║  REGRA: Nenhum lado conhece o outro.                           ║
 * ║  Só o ACL conhece ambos.                                       ║
 * ║                                                                 ║
 * ║  Legacy:   GraduacaoHistorico, RequisitoGraduacao,             ║
 * ║            SubnivelAluno, ExameGraduacao                        ║
 * ║  Domain:   ProgressState, PromotionRule, Milestone, Evaluation ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  GraduacaoHistorico,
  RequisitoGraduacao,
  SubnivelAluno,
  ExameGraduacao,
} from '@/lib/api/contracts';

import type {
  ProgressState,
  MilestoneHistoryEntry,
  PromotionRule,
  PromotionCriterion,
  Evaluation,
  Milestone,
  DevelopmentTrack,
  CompetencyScore,
  AccumulatedMetrics,
} from '@/lib/domain';

import type {
  VisualIdentity,
  HexColor,
  MilestoneId,
  TrackId,
  NormalizedScore,
  Percentage,
  ISODate,
} from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// CONSTANTS — Default martial arts track (used when no config exists)
// ════════════════════════════════════════════════════════════════════

const DEFAULT_TRACK_ID = 'track_graduacao' as TrackId;

/**
 * Default milestone map — single source of truth.
 * This replaces the 9 duplicated NIVEL_COLORS across the codebase.
 */
const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'ms_iniciante' as MilestoneId,       name: { default: 'Nível Iniciante' },       order: 0, visual: { color: '#E5E7EB' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_cinza' as MilestoneId,           name: { default: 'Nível Cinza' },           order: 1, visual: { color: '#9CA3AF' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_amarelo' as MilestoneId,         name: { default: 'Nível Amarelo' },         order: 2, visual: { color: '#EAB308' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_laranja' as MilestoneId,         name: { default: 'Nível Laranja' },         order: 3, visual: { color: '#F97316' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_verde' as MilestoneId,           name: { default: 'Nível Verde' },           order: 4, visual: { color: '#22C55E' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_basico' as MilestoneId,          name: { default: 'Nível Básico' },          order: 5, visual: { color: '#3B82F6' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_intermediario' as MilestoneId,   name: { default: 'Nível Intermediário' },   order: 6, visual: { color: '#8B5CF6' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_avancado' as MilestoneId,        name: { default: 'Nível Avançado' },        order: 7, visual: { color: '#92400E' as HexColor }, isFinal: false, expectedCompetencies: [] },
  { id: 'ms_maximo' as MilestoneId,          name: { default: 'Nível Máximo' },          order: 8, visual: { color: '#1F2937' as HexColor }, isFinal: true,  expectedCompetencies: [] },
];

/** Name → MilestoneId lookup */
const MILESTONE_BY_NAME = new Map<string, Milestone>(
  DEFAULT_MILESTONES.map(m => [m.name.default, m])
);

// ════════════════════════════════════════════════════════════════════
// LEGACY → DOMAIN
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve milestone ID from legacy level name.
 * Falls back to first milestone if name is unknown.
 */
export function resolveMilestoneId(legacyName: string): MilestoneId {
  return MILESTONE_BY_NAME.get(legacyName)?.id ?? DEFAULT_MILESTONES[0].id;
}

/**
 * Resolve milestone visual from legacy level name.
 * This replaces ALL duplicated NIVEL_COLORS maps across the codebase.
 */
export function resolveMilestoneVisual(legacyName: string): VisualIdentity {
  return MILESTONE_BY_NAME.get(legacyName)?.visual ?? DEFAULT_MILESTONES[0].visual;
}

/** Get all milestones (ordered) — replaces BELT_ORDER */
export function getDefaultMilestones(): Milestone[] {
  return DEFAULT_MILESTONES;
}

/**
 * Map legacy GraduacaoHistorico[] + SubnivelAluno → domain ProgressState
 */
export function mapToProgressState(
  participantId: string,
  historico: GraduacaoHistorico[],
  subniveis: { subniveisAtuais: number; dataUltimoSubnivel?: string },
  attendancePct?: number,
): ProgressState {
  const currentLevelName = historico.length > 0
    ? historico[historico.length - 1].nivel
    : 'Nível Iniciante';

  const currentMilestone = MILESTONE_BY_NAME.get(currentLevelName) ?? DEFAULT_MILESTONES[0];

  const lastGrad = historico.length > 0 ? historico[historico.length - 1] : null;
  const milestoneStartDate = lastGrad?.data ?? new Date().toISOString().split('T')[0];
  const monthsInMilestone = lastGrad
    ? Math.floor((Date.now() - new Date(lastGrad.data).getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 0;

  const history: MilestoneHistoryEntry[] = historico.map(h => ({
    milestoneId: resolveMilestoneId(h.nivel),
    milestoneName: h.nivel,
    achievedDate: h.data as ISODate,
    awardedBy: h.professorNome,
  }));

  return {
    participantId,
    trackId: DEFAULT_TRACK_ID,
    currentMilestoneId: currentMilestone.id,
    currentSublevels: subniveis.subniveisAtuais,
    milestoneStartDate: milestoneStartDate as ISODate,
    competencyScores: [],
    overallScore: 0 as NormalizedScore,
    promotionStatus: 'NOT_READY',
    history,
    accumulatedMetrics: {
      totalSessions: 0,
      totalHours: 0,
      attendancePercentage: (attendancePct ?? 0) as Percentage,
      monthsInCurrentMilestone: monthsInMilestone,
      itemsCompleted: 0,
      evaluationsPassed: historico.length,
      currentStreak: 0,
      bestStreak: 0,
    },
  };
}

/**
 * Map legacy RequisitoGraduacao[] → domain PromotionRule[]
 */
export function mapToPromotionRules(requisitos: RequisitoGraduacao[]): PromotionRule[] {
  return requisitos.map(req => {
    const criteria: PromotionCriterion[] = [];

    if (req.tempoMinimoMeses > 0) {
      criteria.push({ type: 'min_time_months', value: req.tempoMinimoMeses });
    }
    if (req.presencaMinimaPct > 0) {
      criteria.push({ type: 'min_attendance_pct', value: req.presencaMinimaPct as Percentage });
    }
    if (req.sessõesMinimas > 0) {
      criteria.push({ type: 'min_sessions', value: req.sessõesMinimas });
    }

    return {
      fromMilestoneId: resolveMilestoneId(req.nivelDe),
      toMilestoneId: resolveMilestoneId(req.nivelPara),
      criteria,
      requiresEvaluation: true,
      requiresInstructorApproval: true,
    };
  });
}

/**
 * Map legacy ExameGraduacao → domain Evaluation
 */
export function mapToEvaluation(exam: ExameGraduacao): Evaluation {
  const statusMap: Record<string, Evaluation['status']> = {
    'AGENDADO': 'SCHEDULED',
    'APROVADO': 'APPROVED',
    'REPROVADO': 'FAILED',
    'CANCELADO': 'CANCELLED',
  };

  return {
    id: exam.id,
    trackId: DEFAULT_TRACK_ID,
    participantId: exam.alunoId,
    evaluatorId: exam.professorAvaliador,
    targetMilestoneId: resolveMilestoneId(exam.nivelAlvo),
    type: 'promotion',
    status: statusMap[exam.status] ?? 'SCHEDULED',
    scheduledDate: exam.dataExame as ISODate,
    unitId: '' as any,
    createdAt: '' as any,
    updatedAt: '' as any,
    result: exam.status === 'APROVADO' || exam.status === 'REPROVADO'
      ? {
          scores: [],
          overallScore: 0 as NormalizedScore,
          passed: exam.status === 'APROVADO',
          feedback: exam.observacao,
        }
      : undefined,
  };
}

// ════════════════════════════════════════════════════════════════════
// DOMAIN → LEGACY (backward compat — for existing components)
// ════════════════════════════════════════════════════════════════════

/**
 * Map domain ProgressState → legacy format for gradual migration.
 * Existing components can consume this while migrating.
 */
export function mapToLegacyHistorico(state: ProgressState): GraduacaoHistorico[] {
  return state.history.map(h => ({
    nivel: h.milestoneName,
    data: h.achievedDate,
    professorNome: h.awardedBy,
  }));
}

export function mapToLegacySubniveis(state: ProgressState): { subniveisAtuais: number; dataUltimoSubnivel?: string } {
  return {
    subniveisAtuais: state.currentSublevels,
    dataUltimoSubnivel: undefined,
  };
}
