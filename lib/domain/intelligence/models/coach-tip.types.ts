/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  COACH TIP TYPES — Assistente Inteligente do Professor          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Briefings contextuais antes de cada aula: spotlights, dicas,   ║
 * ║  follow-ups e métricas do professor.                            ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  EngagementTier,
  SpotlightContextType,
  IntelligenceMetadata,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// INSTRUCTOR COACH BRIEFING — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface InstructorCoachBriefing {
  instructorId: string;
  instructorName: string;
  briefingDate: string;          // ISO date

  // ── Resumo do Dia ───────────────────────────────────────
  daySummary: {
    totalClassesToday: number;
    totalStudentsExpected: number;
    criticalAlerts: number;      // Quantos alunos precisam de atenção urgente
    celebrations: number;        // Quantos merecem reconhecimento
  };

  // ── Briefing por Turma ──────────────────────────────────
  classBriefings: ClassBriefing[];

  // ── Dicas Pedagógicas ───────────────────────────────────
  pedagogicalTips: PedagogicalTip[];

  // ── Métricas do Professor ───────────────────────────────
  performanceMetrics: {
    studentRetentionRate: number;      // % dos seus alunos que continuam
    avgStudentEngagement: number;      // Média de engagement dos seus alunos
    avgStudentProgression: number;     // Velocidade média de progressão
    promotionsThisMonth: number;       // Promoções concedidas no mês
    topPerformingClass: string;        // Turma com melhor health score
    attentionNeededClass: string;      // Turma que precisa de foco
  };

  // ── Metadados ───────────────────────────────────────────
  metadata: IntelligenceMetadata;
}

// ════════════════════════════════════════════════════════════════════
// BRIEFING POR TURMA
// ════════════════════════════════════════════════════════════════════

export interface ClassBriefing {
  classId: string;
  className: string;
  time: string;

  // ── Antes da Aula (preparação) ──────────────────────────
  preparation: {
    suggestedFocusCompetency: string;
    suggestedDifficulty: number;
    estimatedAttendance: number;       // Baseado no padrão histórico

    // Alunos que merecem atenção especial
    spotlight: SpotlightStudent[];
  };

  // ── Durante a Aula (sugestões) ──────────────────────────
  duringSuggestions: string[];    // Ex: "Colocar [Aluno A] com [Aluno B] na dupla"

  // ── Após a Aula (follow-up) ─────────────────────────────
  afterActions: AfterAction[];
}

// ════════════════════════════════════════════════════════════════════
// SPOTLIGHT STUDENT
// ════════════════════════════════════════════════════════════════════

export interface SpotlightStudent {
  participantId: string;
  name: string;
  avatar?: string;

  /** O que o professor precisa saber */
  context: SpotlightContext;

  /** O que fazer */
  suggestedApproach: string;

  /** Dados de suporte */
  engagementTier: EngagementTier;
  daysLastSeen: number;
  currentMilestone: string;
}

// ════════════════════════════════════════════════════════════════════
// SPOTLIGHT CONTEXT — Discriminated Union
// ════════════════════════════════════════════════════════════════════

export type SpotlightContext =
  | { type: 'returning_after_absence'; daysAway: number; previousStreak: number }
  | { type: 'near_promotion'; progress: number; missingCriteria: string[] }
  | { type: 'declining_engagement'; trendDelta: number; possibleCause: string }
  | { type: 'new_student'; daysSinceJoin: number; needsBuddy: boolean }
  | { type: 'achieved_milestone'; milestone: string; celebrateHow: string }
  | { type: 'struggling_with'; competency: string; score: number; suggestedDrill: string }
  | { type: 'champion_potential'; reason: string; monitorRole: string };

// ════════════════════════════════════════════════════════════════════
// DICA PEDAGÓGICA
// ════════════════════════════════════════════════════════════════════

export interface PedagogicalTip {
  /** Categoria da dica */
  category: 'retention' | 'technique' | 'motivation' | 'class_management';

  /** Texto da dica */
  tip: string;

  /** Dados que basearam a dica. Ex: "3 alunos com queda de 20% em frequência" */
  basedOn: string;

  /** Prioridade */
  priority: 'high' | 'medium' | 'low';
}

// ════════════════════════════════════════════════════════════════════
// AÇÃO PÓS-AULA
// ════════════════════════════════════════════════════════════════════

export interface AfterAction {
  /** Ação a tomar. Ex: "Avaliar competência 'raspagem' do João" */
  action: string;

  /** ID do aluno envolvido (se aplicável) */
  participantId?: string;

  /** Prazo. Ex: "Antes da próxima aula" */
  deadline: string;

  /** Impacto esperado. Ex: "Pode destravar promoção para faixa azul" */
  impact: string;
}
