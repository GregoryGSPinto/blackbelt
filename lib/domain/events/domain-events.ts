/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DOMAIN EVENTS — O que aconteceu no sistema                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Eventos de domínio são FATOS IMUTÁVEIS.                       ║
 * ║  Não são comandos. Não são requests.                           ║
 * ║  São registros de algo que JÁ aconteceu.                       ║
 * ║                                                                 ║
 * ║  "AttendanceRecorded" — alguém fez check-in                    ║
 * ║  "PromotionGranted"   — alguém foi promovido                   ║
 * ║  "EvaluationCompleted" — uma avaliação terminou                ║
 * ║                                                                 ║
 * ║  Eventos não sabem quem está ouvindo.                          ║
 * ║  Quem ouve decide o que fazer (invalidar cache, notificar,     ║
 * ║  atualizar ranking, gerar certificado, etc.)                   ║
 * ║                                                                 ║
 * ║  REGRA: Este arquivo é PURE DOMAIN.                            ║
 * ║  Zero imports de infra, UI, API.                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  ParticipantId, TrackId, MilestoneId, SessionId,
  AchievementId, ISODateTime,
} from '../shared/kernel';
import { utcNow, utcNowMs } from '../shared/time';

// ════════════════════════════════════════════════════════════════════
// BASE EVENT
// ════════════════════════════════════════════════════════════════════

/**
 * Todo evento de domínio tem:
 * • tipo discriminante (para pattern matching)
 * • timestamp (quando aconteceu)
 * • aggregateId (qual entidade foi afetada)
 * • metadata (contexto adicional)
 */
export interface DomainEventBase {
  /** Tipo discriminante — usado para dispatch */
  readonly type: string;

  /**
   * Versão do contrato do evento.
   *
   * REGRA: nunca alterar comportamento de versões antigas.
   * Só adicionar nova versão com payload estendido.
   */
  readonly version: number;

  /** Quando o evento ocorreu */
  readonly occurredAt: ISODateTime;

  /** ID da entidade raiz afetada */
  readonly aggregateId: string;

  // ── CAUSALIDADE ────────────────────────────────────────────

  /**
   * ID do comando que causou diretamente este evento.
   *
   * "Por que este evento existe?"
   * → porque o comando `causationId` foi executado.
   *
   * Formato: `cmd_{timestamp36}_{random}`
   */
  readonly causationId: string;

  /**
   * ID da cadeia causal maior (correlation chain).
   *
   * Quando um evento causa outro evento (ex: attendance → eligibility → notification),
   * todos compartilham o mesmo correlationId.
   *
   * O primeiro comando da cadeia gera o correlationId.
   * Eventos derivados herdam o correlationId do evento que os causou.
   *
   * "Qual história este evento faz parte?"
   * → da cadeia `correlationId`.
   */
  readonly correlationId: string;

  // ── IDEMPOTÊNCIA ──────────────────────────────────────────

  /**
   * Chave de idempotência (opcional).
   *
   * Se presente, o event store rejeita duplicatas com mesma chave.
   * Impede duplicação semântica (retry, offline resend, double-click).
   *
   * Formato: `{tipo}-{contexto}-{timestamp}-{userId}`
   * Ex: `PROMO-pid123-ms_basico-2026-02-19T21:03:11Z-usr456`
   */
  readonly idempotencyKey?: string;

  /** Contexto adicional */
  readonly metadata?: {
    causedBy?: string;      // userId de quem causou
    source?: string;        // 'app' | 'admin' | 'system' | 'api'
  };

  /**
   * Descrição legível do evento para auditoria e suporte.
   *
   * "Professor Ricardo promoveu Carlos de Faixa Branca para Faixa Azul"
   * "Aluno João fez check-in via QR na sessão de terça"
   *
   * Opcional — preenchida pelo command, não pelo domínio.
   * Nunca usada em lógica. Apenas para humanos lerem o event log.
   */
  readonly humanDescription?: string;
}

// ════════════════════════════════════════════════════════════════════
// PROGRESSION EVENTS
// ════════════════════════════════════════════════════════════════════

/** Participante avançou de milestone (promoção concedida) */
export interface PromotionGranted extends DomainEventBase {
  readonly type: 'PromotionGranted';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    trackId: TrackId;
    fromMilestoneId: MilestoneId;
    toMilestoneId: MilestoneId;
    fromMilestoneName: string;
    toMilestoneName: string;
    grantedBy: string;
  };
}

/** Subnível concedido dentro do milestone atual */
export interface SublevelAwarded extends DomainEventBase {
  readonly type: 'SublevelAwarded';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    trackId: TrackId;
    milestoneId: MilestoneId;
    newSublevelCount: number;
    maxSublevels: number;
    awardedBy: string;
  };
}

/** Score de competência atualizado */
export interface CompetencyScoreUpdated extends DomainEventBase {
  readonly type: 'CompetencyScoreUpdated';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    trackId: TrackId;
    competencyId: string;
    previousScore: number;
    newScore: number;
    evaluatedBy: string;
  };
}

/** Participante ficou elegível para promoção */
export interface PromotionEligibilityReached extends DomainEventBase {
  readonly type: 'PromotionEligibilityReached';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    trackId: TrackId;
    currentMilestoneId: MilestoneId;
    targetMilestoneId: MilestoneId;
  };
}

// ════════════════════════════════════════════════════════════════════
// EVALUATION EVENTS
// ════════════════════════════════════════════════════════════════════

/** Avaliação agendada */
export interface EvaluationScheduled extends DomainEventBase {
  readonly type: 'EvaluationScheduled';
  readonly version: 1;
  readonly payload: {
    evaluationId: string;
    participantId: string;
    trackId: TrackId;
    targetMilestoneId: MilestoneId;
    scheduledDate: string;
    evaluatorId: string;
  };
}

/** Avaliação concluída (aprovada ou reprovada) */
export interface EvaluationCompleted extends DomainEventBase {
  readonly type: 'EvaluationCompleted';
  readonly version: 1;
  readonly payload: {
    evaluationId: string;
    participantId: string;
    trackId: TrackId;
    passed: boolean;
    overallScore: number;
    feedback?: string;
  };
}

// ════════════════════════════════════════════════════════════════════
// SCHEDULING EVENTS
// ════════════════════════════════════════════════════════════════════

/** Presença registrada (check-in) */
export interface AttendanceRecorded extends DomainEventBase {
  readonly type: 'AttendanceRecorded';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    sessionId: string;
    method: 'QR' | 'MANUAL' | 'BIOMETRIC' | 'APP' | 'GUARDIAN_REMOTE';
    groupId?: string;
    trackId?: TrackId;
  };
}

/** Sessão concluída pelo instrutor */
export interface SessionCompleted extends DomainEventBase {
  readonly type: 'SessionCompleted';
  readonly version: 1;
  readonly payload: {
    sessionId: string;
    instructorId: string;
    groupId?: string;
    trackId?: TrackId;
    attendeeCount: number;
    durationMinutes: number;
  };
}

// ════════════════════════════════════════════════════════════════════
// RECOGNITION EVENTS
// ════════════════════════════════════════════════════════════════════

/** Conquista desbloqueada */
export interface AchievementUnlocked extends DomainEventBase {
  readonly type: 'AchievementUnlocked';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    achievementId: string;
    achievementName: string;
    pointsAwarded: number;
    trigger: string;
  };
}

/** Streak atingida (marco de sequência) */
export interface StreakMilestoneReached extends DomainEventBase {
  readonly type: 'StreakMilestoneReached';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    streakDays: number;
    isPersonalBest: boolean;
  };
}

// ════════════════════════════════════════════════════════════════════
// PARTICIPANT EVENTS
// ════════════════════════════════════════════════════════════════════

/** Participante matriculado em trilha */
export interface ParticipantEnrolled extends DomainEventBase {
  readonly type: 'ParticipantEnrolled';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    trackId: TrackId;
    audienceProfileId: string;
    initialMilestoneId: MilestoneId;
  };
}

/** Participante trocou de trilha ou track alterada */
export interface TrackChanged extends DomainEventBase {
  readonly type: 'TrackChanged';
  readonly version: 1;
  readonly payload: {
    participantId: string;
    previousTrackId?: TrackId;
    newTrackId: TrackId;
    reason: 'enrollment' | 'transfer' | 'track_restructured';
  };
}

// ════════════════════════════════════════════════════════════════════
// UNION TYPE — Para pattern matching / dispatch
// ════════════════════════════════════════════════════════════════════

export type DomainEvent =
  // Progression
  | PromotionGranted
  | SublevelAwarded
  | CompetencyScoreUpdated
  | PromotionEligibilityReached
  // Evaluation
  | EvaluationScheduled
  | EvaluationCompleted
  // Scheduling
  | AttendanceRecorded
  | SessionCompleted
  // Recognition
  | AchievementUnlocked
  | StreakMilestoneReached
  // Participant
  | ParticipantEnrolled
  | TrackChanged;

/** Todos os tipos de evento como string literal union */
export type DomainEventType = DomainEvent['type'];

// ════════════════════════════════════════════════════════════════════
// FACTORY
// ════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════
// ID GENERATION — Funciona web + mobile + offline
// ════════════════════════════════════════════════════════════════════

/**
 * Gera ID baseado em timestamp (sortável) + random (único).
 * Não depende de infra externa. Funciona offline.
 *
 * Formato: `{prefix}_{timestamp_base36}_{random_8chars}`
 * Exemplo: `cmd_m1a2b3c4_k9x7w5p2`
 */
function makeId(prefix: string): string {
  const ts = utcNowMs().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}_${rnd}`;
}

/** Gera causationId (identifica o comando) */
export function makeCausationId(): string { return makeId('cmd'); }

/** Gera correlationId (identifica a cadeia causal) */
export function makeCorrelationId(): string { return makeId('cor'); }

/**
 * Gera idempotencyKey DETERMINÍSTICA para um comando.
 *
 * REGRA CRÍTICA: Mesma ação → mesma chave → SEMPRE.
 * NÃO inclui timestamp. Se incluísse, retry geraria chave diferente
 * e a duplicata passaria.
 *
 * Formato: `{eventType}:{aggregateId}:{context}`
 *
 * Exemplos:
 *   AttendanceRecorded:pid_123:session_456
 *   PromotionGranted:pid_123:ms_basico→ms_intermediario
 *   SublevelAwarded:pid_123:ms_basico-sl3
 */
export function makeIdempotencyKey(
  eventType: string,
  aggregateId: string,
  context: string,
): string {
  return `${eventType}:${aggregateId}:${context}`;
}

// ════════════════════════════════════════════════════════════════════
// CAUSATION CONTEXT — Para propagar causalidade entre eventos
// ════════════════════════════════════════════════════════════════════

/**
 * Contexto causal para criar eventos.
 *
 * Quando um command inicia uma cadeia:
 * ```
 * const ctx = startCausationChain();
 * createEvent('PromotionGranted', pid, payload, { ...ctx });
 * createEvent('AchievementUnlocked', pid, payload2, { ...ctx });
 * // Ambos compartilham mesmo correlationId
 * ```
 *
 * Quando um handler reage a um evento e cria outro:
 * ```
 * const ctx = continueCausationChain(originalEvent);
 * createEvent('NotificationSent', pid, payload, { ...ctx });
 * // Herda correlationId do evento original
 * ```
 */
export interface CausationContext {
  causationId: string;
  correlationId: string;
}

/**
 * Profundidade máxima de cadeia causal.
 * Impede loops: A→B→C→A→B→... (se handler reage a próprio output).
 * Se atingir o limite, a cadeia é interrompida silenciosamente.
 */
const MAX_CAUSATION_DEPTH = 10;

/** Inicia uma nova cadeia causal (primeiro comando) */
export function startCausationChain(): CausationContext {
  const id = makeCausationId();
  return { causationId: id, correlationId: makeCorrelationId() };
}

/**
 * Continua cadeia causal a partir de evento existente.
 *
 * GUARD: se a cadeia já atingiu profundidade máxima,
 * inicia cadeia nova (corta o loop).
 */
export function continueCausationChain(
  fromEvent: DomainEventBase,
  currentDepth = 0,
): CausationContext {
  if (currentDepth >= MAX_CAUSATION_DEPTH) {
    console.warn(
      `[CausalChain] Max depth (${MAX_CAUSATION_DEPTH}) reached for correlation ${fromEvent.correlationId}. Starting new chain.`
    );
    return startCausationChain();
  }

  return {
    causationId: makeCausationId(),
    correlationId: fromEvent.correlationId, // herda
  };
}

// ════════════════════════════════════════════════════════════════════
// FACTORY
// ════════════════════════════════════════════════════════════════════

/** Cria evento com timestamp, versão, e causalidade automáticos */
export function createEvent<T extends DomainEvent>(
  type: T['type'],
  aggregateId: string,
  payload: T['payload'],
  options?: {
    causationId?: string;
    correlationId?: string;
    idempotencyKey?: string;
    humanDescription?: string;
    metadata?: DomainEventBase['metadata'];
  },
): T {
  return {
    type,
    version: CURRENT_EVENT_VERSIONS[type as DomainEventType] ?? 1,
    occurredAt: utcNow(),
    aggregateId,
    causationId: options?.causationId ?? makeCausationId(),
    correlationId: options?.correlationId ?? makeCorrelationId(),
    idempotencyKey: options?.idempotencyKey,
    humanDescription: options?.humanDescription,
    metadata: options?.metadata,
    payload,
  } as T;
}

// ════════════════════════════════════════════════════════════════════
// EVENT REGISTRY — Versões atuais congeladas
// ════════════════════════════════════════════════════════════════════

/**
 * Registro de versões atuais de cada evento.
 *
 * REGRAS DE VERSIONAMENTO:
 *
 * 1. NUNCA alterar payload de uma versão existente.
 *    Se precisa de campo novo → incrementar versão.
 *
 * 2. Campos novos são SEMPRE opcionais na versão N+1.
 *    Handlers que conhecem v1 continuam funcionando com v2.
 *
 * 3. Handlers devem tratar versão desconhecida como a última que conhecem.
 *    `if (event.version >= 2) { // use new field }`
 *
 * 4. Snapshots históricos reconstruídos a partir de eventos v1
 *    são corretos — porque v1 é um subconjunto válido de v2.
 *
 * Exemplo de evolução futura:
 *
 *   // v1 (hoje):
 *   PromotionGranted.payload = { participantId, from, to, grantedBy }
 *
 *   // v2 (futuro — quando avaliação prática for obrigatória):
 *   PromotionGranted.payload = { ...v1, evaluationId?, criteriaSnapshot? }
 *   CURRENT_EVENT_VERSIONS['PromotionGranted'] = 2
 *
 *   // Handler:
 *   if (event.version >= 2 && event.payload.evaluationId) {
 *     // novo comportamento
 *   }
 */
export const CURRENT_EVENT_VERSIONS: Record<DomainEventType, number> = {
  PromotionGranted:            1,
  SublevelAwarded:             1,
  CompetencyScoreUpdated:      1,
  PromotionEligibilityReached: 1,
  EvaluationScheduled:         1,
  EvaluationCompleted:         1,
  AttendanceRecorded:          1,
  SessionCompleted:            1,
  AchievementUnlocked:         1,
  StreakMilestoneReached:      1,
  ParticipantEnrolled:         1,
  TrackChanged:                1,
};
