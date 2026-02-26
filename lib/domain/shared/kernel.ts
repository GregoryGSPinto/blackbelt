/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BLACKBELT DOMAIN — Shared Kernel                                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Value objects and primitives shared across all bounded         ║
 * ║  contexts. Nothing here depends on UI, API, or infrastructure. ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════
// IDENTIFIERS
// ════════════════════════════════════════════════════════════════════

/** Branded type — prevents mixing IDs from different entities */
export type EntityId<T extends string = string> = string & { readonly __brand: T };

export type UnitId        = EntityId<'Unit'>;
export type ParticipantId = EntityId<'Participant'>;
export type TrackId       = EntityId<'Track'>;
export type MilestoneId   = EntityId<'Milestone'>;
export type SessionId     = EntityId<'Session'>;
export type AchievementId = EntityId<'Achievement'>;
export type InstructorId  = EntityId<'Instructor'>;
export type SegmentId     = EntityId<'Segment'>;

// ════════════════════════════════════════════════════════════════════
// TEMPORAL
// ════════════════════════════════════════════════════════════════════

/** ISO 8601 date string */
export type ISODate = string & { readonly __brand: 'ISODate' };

/** ISO 8601 datetime string */
export type ISODateTime = string & { readonly __brand: 'ISODateTime' };

/** Duration in minutes */
export type DurationMinutes = number & { readonly __brand: 'DurationMinutes' };

// ════════════════════════════════════════════════════════════════════
// SCORING
// ════════════════════════════════════════════════════════════════════

/**
 * Score normalizado 0..100.
 * Backend valida; frontend apenas exibe.
 */
export type NormalizedScore = number & { readonly __brand: 'Score0to100' };

/** Porcentagem 0..100 */
export type Percentage = number & { readonly __brand: 'Percentage' };

// ════════════════════════════════════════════════════════════════════
// VISUAL
// ════════════════════════════════════════════════════════════════════

/** Cor hexadecimal (#RRGGBB) */
export type HexColor = string & { readonly __brand: 'HexColor' };

/** Ícone — pode ser emoji, Lucide icon name, ou URL de imagem */
export interface VisualIdentity {
  /** Cor primária do elemento */
  color: HexColor;
  /** Cor secundária (contraste/texto) */
  contrastColor?: HexColor;
  /** Gradiente (from → to) */
  gradient?: { from: HexColor; to: HexColor };
  /** Emoji, nome de ícone Lucide, ou URL de asset */
  icon?: string;
}

// ════════════════════════════════════════════════════════════════════
// STATUS & LIFECYCLE
// ════════════════════════════════════════════════════════════════════

/** Status de entidades com ciclo de vida */
export type LifecycleStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT';

/** Status operacional de participante */
export type OperationalStatus =
  | 'ACTIVE'       // Frequentando normalmente
  | 'AT_RISK'      // Ausência recente / inadimplente
  | 'BLOCKED'      // Bloqueado por admin
  | 'FROZEN'       // Congelamento voluntário
  | 'INACTIVE';    // Desligado

// ════════════════════════════════════════════════════════════════════
// MULTI-TENANT
// ════════════════════════════════════════════════════════════════════

/** Toda entidade pertence a uma unidade */
export interface TenantScoped {
  unitId: UnitId;
}

/** Toda entidade tem metadata de auditoria */
export interface Auditable {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  createdBy?: string;
}

// ════════════════════════════════════════════════════════════════════
// LOCALIZAÇÃO (i18n-ready)
// ════════════════════════════════════════════════════════════════════

/** Texto que pode ter traduções */
export interface LocalizedText {
  /** Valor padrão (idioma da unidade) */
  default: string;
  /** Traduções opcionais */
  translations?: Record<string, string>;
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

/** Construtor de ID tipado (sem validação em runtime — branded types são compile-time) */
export const asId = <T extends string>(value: string): EntityId<T> => value as EntityId<T>;
