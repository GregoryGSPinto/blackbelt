/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CLASS INSIGHT TYPES — Inteligência de Aulas                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Analisa turmas para gerar insights acionáveis para professor   ║
 * ║  e admin. Saúde da turma, composição e recomendações.           ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  ClassRecommendationType,
  IntelligenceMetadata,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// CLASS INSIGHT — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface ClassInsight {
  classScheduleId: string;
  className: string;
  dayOfWeek: number;
  timeSlot: string;
  instructorId: string;

  // ── Saúde da Turma ──────────────────────────────────────
  health: ClassHealth;

  // ── Composição Inteligente ──────────────────────────────
  composition: ClassComposition;

  // ── Recomendações para o Professor ──────────────────────
  recommendations: ClassRecommendation[];

  // ── Sugestão de Plano de Aula ───────────────────────────
  suggestedFocus: SuggestedFocus;

  // ── Metadados ───────────────────────────────────────────
  metadata: IntelligenceMetadata;
}

// ════════════════════════════════════════════════════════════════════
// SAÚDE DA TURMA
// ════════════════════════════════════════════════════════════════════

export interface ClassHealth {
  /** Score geral da turma 0-100 */
  score: Score0to100;

  /** Tendência da saúde */
  trend: 'improving' | 'stable' | 'declining';

  /** % média de presença */
  avgAttendanceRate: number;

  /** % que continuam após 3 meses */
  retentionRate: number;

  /** Média do EngagementScore dos alunos */
  avgEngagement: Score0to100;
}

// ════════════════════════════════════════════════════════════════════
// COMPOSIÇÃO DA TURMA
// ════════════════════════════════════════════════════════════════════

export interface ClassComposition {
  /** Total de alunos matriculados */
  totalEnrolled: number;

  /** Média do milestone order dos alunos */
  avgLevel: number;

  /** Desvio padrão (alta = turma muito heterogênea) */
  levelSpread: number;

  /** Quantos no tier 'champion' */
  championCount: number;

  /** Quantos no tier 'drifting' ou 'disconnected' */
  driftingCount: number;

  /** Alunos com < 60 dias */
  newMemberCount: number;
}

// ════════════════════════════════════════════════════════════════════
// RECOMENDAÇÃO DE TURMA
// ════════════════════════════════════════════════════════════════════

export interface ClassRecommendation {
  /** Tipo da recomendação */
  type: ClassRecommendationType;

  /** Prioridade */
  priority: 'high' | 'medium' | 'low';

  /** Descrição da recomendação */
  description: string;

  /** IDs dos alunos envolvidos */
  involvedParticipants?: string[];

  /** Impacto esperado. Ex: "Pode reduzir evasão em 20% nesta turma" */
  expectedImpact: string;
}

// ════════════════════════════════════════════════════════════════════
// SUGESTÃO DE FOCO DA AULA
// ════════════════════════════════════════════════════════════════════

export interface SuggestedFocus {
  /** Competência mais fraca da turma */
  primaryCompetency: string;

  /** Segunda mais fraca */
  secondaryCompetency: string;

  /** Competência que todos já dominam (gastar menos tempo) */
  avoidCompetency: string;

  /** 1-5, calibrado pela composição */
  difficultyLevel: number;

  /** Alunos que merecem atenção especial */
  specialAttention: SpecialAttention[];
}

// ════════════════════════════════════════════════════════════════════
// ATENÇÃO ESPECIAL (ALUNO NA TURMA)
// ════════════════════════════════════════════════════════════════════

export interface SpecialAttention {
  participantId: string;
  participantName: string;

  /** Ex: "Primeira aula após 21 dias fora" */
  reason: string;

  /** Ex: "Incluir em dupla com aluno experiente" */
  suggestion: string;
}
