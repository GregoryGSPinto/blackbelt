/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PARTICIPANT DEVELOPMENT SNAPSHOT                               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  O objeto mais importante da Application Layer.                ║
 * ║                                                                 ║
 * ║  Não é entidade (não persiste).                                 ║
 * ║  Não é ViewModel (não é UI-specific).                          ║
 * ║  É um READ MODEL INTERNO ESTÁVEL.                              ║
 * ║                                                                 ║
 * ║  Toda projeção lê daqui:                                       ║
 * ║  • Tela do aluno                                                ║
 * ║  • Tela do instrutor                                            ║
 * ║  • Dashboard admin                                              ║
 * ║  • Ranking                                                      ║
 * ║  • Elegibilidade de evento                                      ║
 * ║  • Notificações automáticas                                     ║
 * ║  • Certificados / carteirinha                                   ║
 * ║  • Relatórios                                                   ║
 * ║  • IA pedagógica                                                ║
 * ║                                                                 ║
 * ║  UMA construção. ZERO divergência. ZERO recálculo.             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { TrackId, MilestoneId,
  VisualIdentity, NormalizedScore, Percentage,
  ISODate,
} from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// SNAPSHOT — Estado computado consolidado
// ════════════════════════════════════════════════════════════════════

export interface ParticipantDevelopmentSnapshot {
  /**
   * Schema version do snapshot.
   *
   * REGRA: só adicionar campos, nunca remover.
   * Consumers devem tratar versões >= a que conhecem.
   *
   * v1: schema inicial (19/02/2026)
   */
  schemaVersion: 1;

  /** Identidade */
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  trackId: TrackId;

  /** Milestone atual — tudo resolvido, pronto para uso */
  currentMilestone: ResolvedMilestone;

  /** Próximo milestone (null = último nível alcançado) */
  nextMilestone: ResolvedMilestone | null;

  /** Subníveis */
  sublevels: {
    current: number;
    max: number;
    displayMode: 'stripe' | 'star' | 'dot' | 'number' | 'progress_bar';
  };

  /** Métricas temporais */
  time: {
    monthsInCurrentMilestone: number;
    /** "2 anos e 3 meses" — pré-formatado */
    displayText: string;
    milestoneStartDate: ISODate;
    enrollmentDate?: ISODate;
    totalMonthsActive: number;
  };

  /** Métricas de atividade */
  activity: {
    totalSessions: number;
    totalHours: number;
    attendancePercentage: Percentage;
    currentStreak: number;
    bestStreak: number;
  };

  /** Competências com scores — pré-resolvidas com nome/visual */
  competencies: ResolvedCompetencyScore[];

  /** Score geral (média ponderada das competências) */
  overallScore: NormalizedScore;

  /** Elegibilidade para promoção — pré-computada */
  promotion: PromotionEligibility;

  /** Timeline de milestones alcançados */
  history: ResolvedHistoryEntry[];

  /** Mapa completo de milestones da trilha (para contexto visual) */
  allMilestones: ResolvedMilestone[];

  /** Avaliações vinculadas */
  evaluations: ResolvedEvaluation[];

  /** Timestamp de quando o snapshot foi construído */
  computedAt: string;
}

// ════════════════════════════════════════════════════════════════════
// RESOLVED TYPES — Tudo já com nome, cor, label
// ════════════════════════════════════════════════════════════════════

export interface ResolvedMilestone {
  id: MilestoneId;
  name: string;
  visual: VisualIdentity;
  order: number;
  isFinal: boolean;
  isAchieved: boolean;
  isCurrent: boolean;
}

export interface ResolvedCompetencyScore {
  id: string;
  name: string;
  category?: string;
  icon?: string;
  score: NormalizedScore;
  lastUpdated?: ISODate;
}

export interface ResolvedHistoryEntry {
  milestoneId: MilestoneId;
  milestoneName: string;
  milestoneVisual: VisualIdentity;
  date: ISODate;
  /** "15 de março de 2022" */
  dateFormatted: string;
  awardedBy?: string;
  isCurrent: boolean;
}

export interface ResolvedEvaluation {
  id: string;
  targetMilestoneName: string;
  targetMilestoneVisual: VisualIdentity;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'APPROVED' | 'FAILED' | 'CANCELLED';
  statusLabel: string;
  scheduledDate: string;
  evaluator: string;
  passed?: boolean;
  feedback?: string;
}

// ════════════════════════════════════════════════════════════════════
// PROMOTION ELIGIBILITY — O cálculo mais crítico do sistema
// ════════════════════════════════════════════════════════════════════

export interface PromotionEligibility {
  /** Elegível para promoção? (todos os critérios atendidos) */
  eligible: boolean;

  /** Status semântico */
  status: 'NOT_READY' | 'ELIGIBLE' | 'IN_EVALUATION' | 'NO_NEXT_LEVEL';

  /** Progresso geral 0..100 */
  overallProgress: number;

  /** Cada critério individual com estado */
  criteria: ResolvedCriterion[];

  /** Requer avaliação formal? */
  requiresEvaluation: boolean;

  /** Requer aprovação do instrutor? */
  requiresInstructorApproval: boolean;
}

export interface ResolvedCriterion {
  /** Label para UI ("Tempo", "Presença", "Sessões") */
  label: string;
  /** Valor atual */
  current: number;
  /** Valor exigido */
  required: number;
  /** Unidade ("meses", "%", "sessões", "h") */
  unit: string;
  /** Critério atendido? */
  met: boolean;
  /** Progresso individual 0..100 */
  progress: number;
  /** Tipo do critério (para lógica condicional) */
  type: string;
}
