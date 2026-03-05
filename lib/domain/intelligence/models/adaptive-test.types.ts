/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ADAPTIVE TEST TYPES — Avaliações Personalizadas                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Tipos para provas adaptativas geradas por Item Response Theory ║
 * ║  (IRT) simplificado. Calibrado pelo StudentDNA.                 ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  QuestionType,
  Percentage,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DO TESTE ADAPTATIVO
// ════════════════════════════════════════════════════════════════════

export interface AdaptiveTestConfig {
  participantId: string;
  trackId: string;

  /** Para qual milestone é a avaliação */
  targetMilestoneId: string;

  /** Tipo do teste */
  testType: 'promotion' | 'periodic' | 'diagnostic';

  /** Limite de questões (default: 15) */
  maxQuestions: number;
}

// ════════════════════════════════════════════════════════════════════
// TESTE ADAPTATIVO — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface AdaptiveTest {
  id: string;
  participantId: string;
  config: AdaptiveTestConfig;

  /** Seções do teste, agrupadas por competência */
  sections: TestSection[];

  // ── Distribuição de dificuldade ─────────────────────────
  difficultyDistribution: {
    /** % de questões fáceis (calibrado pelo DNA) */
    easy: Percentage;
    /** % de questões médias */
    medium: Percentage;
    /** % de questões difíceis */
    hard: Percentage;
    /** % "stretch" (acima do nível — testar potencial) */
    stretch: Percentage;
  };

  // ── Foco adaptativo ─────────────────────────────────────
  competencyFocus: CompetencyFocusItem[];

  /** Duração estimada em minutos */
  estimatedDuration: number;

  /** Score mínimo para aprovação (adaptado) */
  passingScore: number;

  /** Quando foi gerado (ISO timestamp) */
  generatedAt: string;
}

// ════════════════════════════════════════════════════════════════════
// SEÇÃO DO TESTE
// ════════════════════════════════════════════════════════════════════

export interface TestSection {
  competencyId: string;
  competencyName: string;

  /** Questões da seção */
  questions: TestQuestion[];

  /** Peso desta seção no score final */
  weight: number;
}

// ════════════════════════════════════════════════════════════════════
// QUESTÃO DO TESTE
// ════════════════════════════════════════════════════════════════════

export interface TestQuestion {
  id: string;
  competencyId: string;

  /** 1=básico, 5=avançado */
  difficulty: 1 | 2 | 3 | 4 | 5;

  /** Tipo da questão */
  type: QuestionType;

  /** Conteúdo da questão */
  content: QuestionContent;

  /** Pontos da questão */
  points: number;

  /** Tempo limite em segundos (opcional) */
  timeLimit?: number;

  /** Metadados adaptativos */
  adaptiveMetadata: {
    /** Ex: "Competência fraca: raspagem (score 35)" */
    selectedBecause: string;
    /** % esperado de acerto baseado no DNA */
    expectedCorrectRate: number;
  };
}

// ════════════════════════════════════════════════════════════════════
// CONTEÚDO DA QUESTÃO
// ════════════════════════════════════════════════════════════════════

export interface QuestionContent {
  title: string;
  description: string;

  /** O que o professor deve avaliar */
  criteria: string[];

  /** URL de vídeo de referência */
  referenceVideo?: string;

  /** Dicas para o professor avaliar */
  tips?: string[];
}

// ════════════════════════════════════════════════════════════════════
// FOCO POR COMPETÊNCIA
// ════════════════════════════════════════════════════════════════════

export interface CompetencyFocusItem {
  competencyId: string;

  /** Quanto % da prova foca nesta competência */
  weight: number;

  /** Razão do foco */
  reason: 'weak_area' | 'maintenance' | 'strength_validation' | 'new_skill';
}
