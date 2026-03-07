// @ts-nocheck
/**
 * Athlete Profile Read Model — Materialized athlete profile.
 *
 * Materializes into rm_athlete_profile table:
 * - membership_id, academy_id
 * - display_data (name, avatar, belt)
 * - stats (attendance, streak, competencies)
 * - ml_scores (churn risk, engagement)
 *
 * Listens to: AttendanceRecorded, PromotionGranted, SublevelAwarded,
 *             CompetencyScoreUpdated, AchievementUnlocked, StreakMilestoneReached,
 *             ParticipantEnrolled
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ReadModel } from '../types';
import type { StoredEvent } from '@/lib/event-store/event-types';

export const athleteProfileReadModel: ReadModel = {
  name: 'athlete-profile',

  handles: [
    'AttendanceRecorded',
    'PromotionGranted',
    'SublevelAwarded',
    'CompetencyScoreUpdated',
    'AchievementUnlocked',
    'StreakMilestoneReached',
    'ParticipantEnrolled',
  ],

  async process(event: StoredEvent): Promise<void> {
    const admin = getSupabaseAdminClient();
    const payload = event.payload as Record<string, unknown>;
    const participantId = payload?.participantId;

    if (!participantId) return;

    // Upsert with partial update based on event type
    const now = new Date().toISOString();

    switch (event.event_type) {
      case 'ParticipantEnrolled': {
        await admin
          .from('rm_athlete_profile')
          .upsert(
            {
              membership_id: participantId,
              academy_id: payload.academyId ?? event.aggregate_id,
              display_data: {
                trackId: payload.trackId,
                milestoneId: payload.initialMilestoneId,
                enrolledAt: event.occurred_at,
              },
              stats: { totalSessions: 0, currentStreak: 0, achievements: 0 },
              last_computed_at: now,
            },
            { onConflict: 'membership_id' },
          );
        break;
      }

      case 'PromotionGranted': {
        const { data: existing } = await admin
          .from('rm_athlete_profile')
          .select('display_data')
          .eq('membership_id', participantId)
          .single();

        if (existing) {
          const displayData = {
            ...(existing.display_data as object),
            milestoneId: payload.toMilestoneId,
            milestoneName: payload.toMilestoneName,
            lastPromotionAt: event.occurred_at,
          };

          await admin
            .from('rm_athlete_profile')
            .update({ display_data: displayData, last_computed_at: now })
            .eq('membership_id', participantId);
        }
        break;
      }

      case 'AttendanceRecorded':
      case 'SublevelAwarded':
      case 'CompetencyScoreUpdated':
      case 'AchievementUnlocked':
      case 'StreakMilestoneReached': {
        await admin
          .from('rm_athlete_profile')
          .update({ last_computed_at: now })
          .eq('membership_id', participantId);
        break;
      }
    }
  },

  async rebuild(events: StoredEvent[]): Promise<void> {
    const admin = getSupabaseAdminClient();

    // Build profiles from events
    const profiles = new Map<string, {
      academyId: string;
      displayData: Record<string, unknown>;
      stats: Record<string, unknown>;
    }>();

    for (const event of events) {
      const payload = event.payload as Record<string, unknown>;
      const pid = payload?.participantId;
      if (!pid) continue;

      if (!profiles.has(pid)) {
        profiles.set(pid, {
          academyId: payload.academyId ?? event.aggregate_id,
          displayData: {},
          stats: { totalSessions: 0, currentStreak: 0, achievements: 0 },
        });
      }

      const profile = profiles.get(pid)!;

      switch (event.event_type) {
        case 'ParticipantEnrolled':
          profile.displayData.trackId = payload.trackId;
          profile.displayData.milestoneId = payload.initialMilestoneId;
          profile.displayData.enrolledAt = event.occurred_at;
          break;
        case 'PromotionGranted':
          profile.displayData.milestoneId = payload.toMilestoneId;
          profile.displayData.milestoneName = payload.toMilestoneName;
          profile.displayData.lastPromotionAt = event.occurred_at;
          break;
        case 'AttendanceRecorded':
          (profile.stats as { totalSessions?: number }).totalSessions =
            ((profile.stats as { totalSessions?: number }).totalSessions ?? 0) + 1;
          break;
        case 'AchievementUnlocked':
          (profile.stats as { achievements?: number }).achievements =
            ((profile.stats as { achievements?: number }).achievements ?? 0) + 1;
          break;
      }
    }

    // Upsert all profiles
    for (const [pid, profile] of profiles) {
      await admin
        .from('rm_athlete_profile')
        .upsert(
          {
            membership_id: pid,
            academy_id: profile.academyId,
            display_data: profile.displayData,
            stats: profile.stats,
            last_computed_at: new Date().toISOString(),
          },
          { onConflict: 'membership_id' },
        );
    }
  },
};
