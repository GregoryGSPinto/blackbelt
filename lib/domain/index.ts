/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BLACKBELT DOMAIN ENGINE — Public API                            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Este é o ponto de entrada único do Domain Engine.             ║
 * ║                                                                 ║
 * ║  O Domain Engine é a camada que define:                        ║
 * ║  • O que o sistema É (entidades, regras, invariantes)          ║
 * ║  • Independente de como é armazenado (API/DB)                  ║
 * ║  • Independente de como é mostrado (UI)                        ║
 * ║  • Independente de como é entregue (REST/GraphQL/gRPC)         ║
 * ║                                                                 ║
 * ║  Bounded Contexts:                                              ║
 * ║  ┌────────────────────────────────────────────────────────┐    ║
 * ║  │  Shared Kernel     → Tipos base, value objects          │    ║
 * ║  │  Segment           → Definição e presets de segmento    │    ║
 * ║  │  Development       → Trilhas, milestones, progressão   │    ║
 * ║  │  Participant       → Pessoas, papéis, perfil            │    ║
 * ║  │  Unit              → Unidade de negócio (tenant)        │    ║
 * ║  │  Scheduling        → Sessões, grupos, presença          │    ║
 * ║  │  Recognition       → Conquistas, pontos, ranking        │    ║
 * ║  └────────────────────────────────────────────────────────┘    ║
 * ║                                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── Shared Kernel ─────────────────────────────────────────────────
export type {
  EntityId, UnitId, ParticipantId, TrackId, MilestoneId,
  SessionId, AchievementId, InstructorId, SegmentId,
  ISODate, ISODateTime, DurationMinutes,
  NormalizedScore, Percentage, HexColor,
  VisualIdentity, LifecycleStatus, OperationalStatus,
  TenantScoped, Auditable, LocalizedText,
} from './shared/kernel';
export { asId } from './shared/kernel';

// ── Segment ───────────────────────────────────────────────────────
export type {
  SegmentType, SegmentDefinition, SegmentModuleConfig,
  ModuleAvailability, SegmentVocabulary, ProfileFieldConfig,
  AudienceProfile, EventTypeConfig,
} from './segment/segment';
export {
  PRESET_MARTIAL_ARTS, PRESET_DANCE, PRESET_PILATES,
  PRESET_FITNESS, PRESET_MUSIC,
  SEGMENT_PRESETS, getSegmentPreset,
} from './segment/presets';

// ── Development ───────────────────────────────────────────────────
export type {
  ProgressionModel, DevelopmentTrack, Milestone,
  SublevelConfig, Competency, ExpectedCompetency,
  PromotionRule, PromotionCriterion,
  ProgressState, CompetencyScore, MilestoneHistoryEntry,
  AccumulatedMetrics, Evaluation,
} from './development/track';

// ── Participant ───────────────────────────────────────────────────
export type {
  Participant, ParticipantProfile, RoleType, ParticipantRole,
  RoleMetadata, LearnerMetadata, InstructorMetadata, GuardianMetadata,
  FamilyLink, ParticipantPreferences, PublicProfile,
} from './participant/participant';

export type { PersonId, PersonIdentity } from './participant/person';
export { anonymizePerson } from './participant/person';

// ── Unit ──────────────────────────────────────────────────────────
export type {
  Unit, UnitPlan, UnitStatus, UnitBranding, UnitAddress,
  OperatingHours, UnitSettings, CheckinMethodConfig, Space, UnitStats,
} from './unit/unit';

// ── Scheduling ────────────────────────────────────────────────────
export type {
  Group, RecurringSchedule,
  Session, SessionType, SessionPlan, SessionPhase, SessionActivity,
  AttendanceRecord, CheckinMethod, PrivateSessionConfig,
} from './scheduling/scheduling';

// ── Time ──────────────────────────────────────────────────────────
export { getClock, setClock, resetClock, utcNow, utcNowMs, FixedClock } from './shared/time';
export type { TimeProvider } from './shared/time';

// ── Events ────────────────────────────────────────────────────────
export type {
  DomainEvent, DomainEventBase, DomainEventType,
  PromotionGranted, SublevelAwarded, CompetencyScoreUpdated,
  PromotionEligibilityReached, EvaluationScheduled, EvaluationCompleted,
  AttendanceRecorded, SessionCompleted,
  AchievementUnlocked, StreakMilestoneReached,
  ParticipantEnrolled, TrackChanged,
} from './events/domain-events';
export { createEvent, CURRENT_EVENT_VERSIONS,
  makeCausationId, makeCorrelationId, makeIdempotencyKey,
  startCausationChain, continueCausationChain,
} from './events/domain-events';
export type { CausationContext } from './events/domain-events';

// ── Recognition ───────────────────────────────────────────────────
export type {
  AchievementDefinition, AchievementTrigger, AchievementAwarded,
  GamificationConfig, PointRule, RankingPeriod,
  RankingEntry, ParticipantPointsSummary,
} from './recognition/recognition';
