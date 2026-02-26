/**
 * Event Type Registry — Maps event type strings to their payload types.
 * Reuses domain events from lib/domain/events/domain-events.ts.
 */

import type {
  DomainEvent,
  DomainEventType,
  PromotionGranted,
  SublevelAwarded,
  CompetencyScoreUpdated,
  PromotionEligibilityReached,
  EvaluationScheduled,
  EvaluationCompleted,
  AttendanceRecorded,
  SessionCompleted,
  AchievementUnlocked,
  StreakMilestoneReached,
  ParticipantEnrolled,
  TrackChanged,
} from '@/lib/domain/events/domain-events';

export type { DomainEvent, DomainEventType };

/** Maps event type string to its full event interface */
export interface EventTypeMap {
  PromotionGranted: PromotionGranted;
  SublevelAwarded: SublevelAwarded;
  CompetencyScoreUpdated: CompetencyScoreUpdated;
  PromotionEligibilityReached: PromotionEligibilityReached;
  EvaluationScheduled: EvaluationScheduled;
  EvaluationCompleted: EvaluationCompleted;
  AttendanceRecorded: AttendanceRecorded;
  SessionCompleted: SessionCompleted;
  AchievementUnlocked: AchievementUnlocked;
  StreakMilestoneReached: StreakMilestoneReached;
  ParticipantEnrolled: ParticipantEnrolled;
  TrackChanged: TrackChanged;
}

/** Extract payload type for a given event type */
export type EventPayload<T extends DomainEventType> =
  T extends keyof EventTypeMap ? EventTypeMap[T]['payload'] : never;

/** Stored event row (as returned from the database) */
export interface StoredEvent {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  event_type: string;
  version: number;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  causation_id: string | null;
  correlation_id: string | null;
  idempotency_key: string | null;
}
