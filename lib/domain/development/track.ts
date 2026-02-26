/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DEVELOPMENT TRACK — O coração do Domain Engine                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Uma trilha de desenvolvimento é a estrutura universal que     ║
 * ║  modela QUALQUER tipo de progressão humana.                    ║
 * ║                                                                 ║
 * ║  ┌─────────────────────────────────────────────────────────┐   ║
 * ║  │  Pessoa → Participa → Desenvolve → Progride → Reconhece│   ║
 * ║  └─────────────────────────────────────────────────────────┘   ║
 * ║                                                                 ║
 * ║  Exemplos:                                                      ║
 * ║  • BJJ:     Track="Graduação"  Milestones=Faixas               ║
 * ║  • Dança:   Track="Repertório" Milestones=Peças dominadas      ║
 * ║  • Pilates: Track="Evolução"   Milestones=Estágios             ║
 * ║  • Música:  Track="Formação"   Milestones=Certificações        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  TrackId, MilestoneId, UnitId, SegmentId,
  VisualIdentity, LocalizedText, NormalizedScore,
  LifecycleStatus, Auditable, TenantScoped,
  ISODate, Percentage, DurationMinutes,
} from '../shared/kernel';

// ════════════════════════════════════════════════════════════════════
// PROGRESSION MODEL — Como a progressão funciona
// ════════════════════════════════════════════════════════════════════

/**
 * 5 modelos universais de progressão humana.
 *
 * Todo segmento do mundo cabe em um (ou combinação) destes modelos.
 *
 * ┌──────────────┬──────────────────────────────┬──────────────────┐
 * │ Modelo       │ Métrica principal             │ Exemplos         │
 * ├──────────────┼──────────────────────────────┼──────────────────┤
 * │ hierarchical │ Níveis sequenciais            │ BJJ, Karate      │
 * │ accumulative │ Horas/prática acumulada       │ Pilates, Yoga    │
 * │ competency   │ Habilidades dominadas         │ Escolas técnicas │
 * │ repertoire   │ Itens/obras aprendidas        │ Dança, Música    │
 * │ evaluation   │ Provas/avaliações aprovadas   │ Cursos, Certs    │
 * └──────────────┴──────────────────────────────┴──────────────────┘
 */
export type ProgressionModel =
  | 'hierarchical'
  | 'accumulative'
  | 'competency'
  | 'repertoire'
  | 'evaluation';

// ════════════════════════════════════════════════════════════════════
// DEVELOPMENT TRACK — A trilha de desenvolvimento
// ════════════════════════════════════════════════════════════════════

/**
 * DevelopmentTrack — A entidade central do BlackBelt.
 *
 * Uma trilha define:
 * • O modelo de progressão (como se avança)
 * • Os milestones (marcos de conquista)
 * • As competências esperadas em cada milestone
 * • As regras de promoção
 *
 * Uma unidade pode ter MÚLTIPLAS trilhas:
 * Ex: Academia de BJJ com trilha "Graduação" + trilha "Competição" + trilha "Instrutores"
 * Ex: Escola de dança com trilha "Ballet Clássico" + trilha "Contemporâneo"
 */
export interface DevelopmentTrack extends TenantScoped, Auditable {
  id: TrackId;
  segmentId: SegmentId;

  /** Nome da trilha ("Graduação", "Repertório", "Formação Técnica") */
  name: LocalizedText;

  /** Descrição curta */
  description?: LocalizedText;

  /** Modelo de progressão utilizado */
  progressionModel: ProgressionModel;

  /** Status da trilha */
  status: LifecycleStatus;

  /** Identidade visual da trilha */
  visual: VisualIdentity;

  /** Milestones ordenados (do primeiro ao último) */
  milestones: Milestone[];

  /** Competências avaliáveis nesta trilha */
  competencies: Competency[];

  /** Configuração de subníveis (ex: stripes no BJJ) */
  sublevelConfig: SublevelConfig;

  /** Regras de promoção entre milestones */
  promotionRules: PromotionRule[];

  /** Quais audience profiles podem usar esta trilha */
  applicableAudiences: string[];
}

// ════════════════════════════════════════════════════════════════════
// MILESTONE — Marco de desenvolvimento
// ════════════════════════════════════════════════════════════════════

/**
 * Milestone — Um marco na trilha de desenvolvimento.
 *
 * • No BJJ: Faixa Branca, Faixa Azul, Faixa Roxa, etc.
 * • Na Dança: Básico, Intermediário, Avançado, Profissional
 * • No Pilates: Estágio 1, Estágio 2, Estágio 3
 * • Na Música: Módulo Iniciante, Módulo Intermediário, Módulo Avançado
 */
export interface Milestone {
  id: MilestoneId;

  /** Nome do milestone ("Nível Básico", "Estágio 2", "Faixa Azul") */
  name: LocalizedText;

  /** Posição na sequência (0 = primeiro milestone) */
  order: number;

  /** Identidade visual (cor, ícone, gradiente) */
  visual: VisualIdentity;

  /** Descrição / significado deste marco */
  description?: LocalizedText;

  /** É o milestone final (não há próximo)? */
  isFinal: boolean;

  /** Competências esperadas neste milestone */
  expectedCompetencies: ExpectedCompetency[];
}

// ════════════════════════════════════════════════════════════════════
// SUBLEVEL — Subdivisões dentro de um milestone
// ════════════════════════════════════════════════════════════════════

/**
 * Configuração de subníveis.
 *
 * • No BJJ: 4 stripes (listras na faixa)
 * • Na Dança: Pode não ter subníveis
 * • Na Música: 3 módulos dentro de cada nível
 *
 * O ponto chave: o número de subníveis é CONFIGURAÇÃO, não código.
 */
export interface SublevelConfig {
  /** Subníveis habilitados? */
  enabled: boolean;

  /** Quantidade máxima de subníveis por milestone (ex: 4 stripes) */
  maxCount: number;

  /** Como representar visualmente */
  displayMode: 'stripe' | 'star' | 'dot' | 'number' | 'progress_bar';

  /** Cor dos indicadores de subnível */
  indicatorColor?: string;

  /** Nome do subnível no vocabulário do segmento */
  label: LocalizedText;
  labelPlural: LocalizedText;
}

// ════════════════════════════════════════════════════════════════════
// COMPETENCY — Habilidade avaliável
// ════════════════════════════════════════════════════════════════════

/**
 * Competência — Uma habilidade mensurável dentro da trilha.
 *
 * • No BJJ: "Guarda Fechada", "Passagem de Guarda", "Finalizações"
 * • Na Dança: "Técnica", "Musicalidade", "Expressão Corporal"
 * • No Pilates: "Alinhamento", "Core", "Flexibilidade", "Respiração"
 * • Na Música: "Leitura", "Técnica", "Repertório", "Improvisação"
 *
 * Competências NÃO são hardcoded — vêm da configuração da trilha.
 */
export interface Competency {
  id: string;

  /** Nome da competência */
  name: LocalizedText;

  /** Descrição do que é avaliado */
  description?: LocalizedText;

  /** Ícone */
  icon?: string;

  /** Categoria (agrupamento visual) */
  category?: string;
}

/**
 * Expectativa de competência para um milestone específico.
 *
 * Define: "Para ser Nível Intermediário, precisa ter score >= 70 em Técnica".
 */
export interface ExpectedCompetency {
  competencyId: string;

  /** Score mínimo exigido (0..100) */
  minimumScore: NormalizedScore;
}

// ════════════════════════════════════════════════════════════════════
// PROMOTION RULE — Regras de promoção entre milestones
// ════════════════════════════════════════════════════════════════════

/**
 * Regra de promoção — O que é necessário para avançar de milestone.
 *
 * Substitui o RequisitoGraduacao hardcoded.
 * Cada critério é opcional — o admin ativa os que fazem sentido.
 */
export interface PromotionRule {
  /** Milestone de origem */
  fromMilestoneId: MilestoneId;

  /** Milestone de destino */
  toMilestoneId: MilestoneId;

  /** Critérios para promoção (todos devem ser atendidos) */
  criteria: PromotionCriterion[];

  /** Requer avaliação/exame manual? */
  requiresEvaluation: boolean;

  /** Requer aprovação do instrutor? */
  requiresInstructorApproval: boolean;
}

/**
 * Critério individual de promoção.
 *
 * O tipo determina o que é avaliado.
 * O valor é genérico — interpretado conforme o tipo.
 */
export type PromotionCriterion =
  | { type: 'min_time_months'; value: number }
  | { type: 'min_attendance_pct'; value: Percentage }
  | { type: 'min_sessions'; value: number }
  | { type: 'min_hours'; value: number }
  | { type: 'min_competency_score'; competencyId: string; value: NormalizedScore }
  | { type: 'min_overall_score'; value: NormalizedScore }
  | { type: 'completed_items'; value: number }          // repertoire model
  | { type: 'passed_evaluation'; evaluationId: string }  // evaluation model
  | { type: 'min_sublevels'; value: number }
  | { type: 'custom'; key: string; value: unknown };     // extensível

// ════════════════════════════════════════════════════════════════════
// PROGRESS STATE — Estado do participante dentro da trilha
// ════════════════════════════════════════════════════════════════════

/**
 * ProgressState — O estado atual de um participante em uma trilha.
 *
 * Esta é a entidade que substitui a "graduação do aluno".
 *
 * Não é "João é Faixa Azul".
 * É "João está no milestone 'Básico' da trilha 'Graduação',
 *    com 2 subníveis, 75% de presença, e score 68 em Técnica."
 */
export interface ProgressState {
  /** Participante */
  participantId: string;

  /** Trilha */
  trackId: TrackId;

  /** Milestone atual */
  currentMilestoneId: MilestoneId;

  /** Subníveis alcançados no milestone atual (0..maxCount) */
  currentSublevels: number;

  /** Data em que entrou no milestone atual */
  milestoneStartDate: ISODate;

  /** Score por competência */
  competencyScores: CompetencyScore[];

  /** Score geral calculado (média ponderada dos competencyScores) */
  overallScore: NormalizedScore;

  /** Status de promoção */
  promotionStatus: 'NOT_READY' | 'ELIGIBLE' | 'IN_EVALUATION' | 'APPROVED';

  /** Histórico de milestones alcançados */
  history: MilestoneHistoryEntry[];

  /** Métricas acumuladas (independente do modelo) */
  accumulatedMetrics: AccumulatedMetrics;
}

export interface CompetencyScore {
  competencyId: string;
  score: NormalizedScore;
  lastUpdated: ISODate;
  updatedBy?: string;
}

export interface MilestoneHistoryEntry {
  milestoneId: MilestoneId;
  milestoneName: string;
  achievedDate: ISODate;
  awardedBy?: string;
}

/**
 * Métricas acumuladas — usadas por todos os modelos de progressão.
 *
 * • Hierarchical usa: sessões, presença, tempo no milestone
 * • Accumulative usa: horas totais
 * • Competency usa: habilidades dominadas
 * • Repertoire usa: itens completados
 * • Evaluation usa: avaliações aprovadas
 */
export interface AccumulatedMetrics {
  totalSessions: number;
  totalHours: number;
  attendancePercentage: Percentage;
  monthsInCurrentMilestone: number;
  itemsCompleted: number;
  evaluationsPassed: number;
  currentStreak: number;
  bestStreak: number;
}

// ════════════════════════════════════════════════════════════════════
// EVALUATION — Avaliação formal
// ════════════════════════════════════════════════════════════════════

/**
 * Avaliação — Exame formal para promoção ou certificação.
 *
 * Substitui ExameGraduacao. Serve para qualquer modelo.
 */
export interface Evaluation extends TenantScoped, Auditable {
  id: string;
  trackId: TrackId;
  participantId: string;
  evaluatorId: string;

  /** Milestone alvo (se for promoção) */
  targetMilestoneId?: MilestoneId;

  /** Tipo de avaliação */
  type: 'promotion' | 'certification' | 'periodic' | 'custom';

  /** Status */
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'APPROVED' | 'FAILED' | 'CANCELLED';

  /** Data agendada */
  scheduledDate: ISODate;

  /** Resultado (se concluída) */
  result?: {
    scores: CompetencyScore[];
    overallScore: NormalizedScore;
    passed: boolean;
    feedback?: string;
  };
}
