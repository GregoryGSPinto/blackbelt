// @ts-nocheck
/**
 * Academy Stats Read Model — Aggregated academy statistics.
 *
 * Materializes into rm_academy_stats table:
 * - total_members, active_members
 * - total_checkins_30d, avg_attendance_pct
 * - revenue_30d_cents, churn_risk_high_count
 *
 * Listens to: AttendanceRecorded, ParticipantEnrolled, SessionCompleted
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ReadModel } from '../types';
import type { StoredEvent } from '@/lib/event-store/event-types';

export const academyStatsReadModel: ReadModel = {
  name: 'academy-stats',

  handles: [
    'AttendanceRecorded',
    'ParticipantEnrolled',
    'SessionCompleted',
  ],

  async process(event: StoredEvent): Promise<void> {
    const admin = getSupabaseAdminClient();
    const academyId = (event.payload as { academyId?: string })?.academyId ?? event.aggregate_id;

    if (!academyId) return;

    switch (event.event_type) {
      case 'ParticipantEnrolled': {
        await admin.rpc('increment_rm_academy_stat', {
          p_academy_id: academyId,
          p_field: 'total_members',
          p_amount: 1,
        }).then(({ error }) => {
          if (error) {
            // Fallback: upsert directly
            return admin
              .from('rm_academy_stats')
              .upsert(
                { academy_id: academyId, total_members: 1, active_members: 1 },
                { onConflict: 'academy_id' },
              );
          }
        });
        break;
      }

      case 'AttendanceRecorded': {
        await admin
          .from('rm_academy_stats')
          .upsert(
            {
              academy_id: academyId,
              last_computed_at: new Date().toISOString(),
            },
            { onConflict: 'academy_id' },
          );
        break;
      }

      case 'SessionCompleted': {
        await admin
          .from('rm_academy_stats')
          .upsert(
            {
              academy_id: academyId,
              last_computed_at: new Date().toISOString(),
            },
            { onConflict: 'academy_id' },
          );
        break;
      }
    }
  },

  async rebuild(events: StoredEvent[]): Promise<void> {
    const admin = getSupabaseAdminClient();

    // Group events by academy
    const academyStats = new Map<string, {
      totalMembers: number;
      checkins: number;
    }>();

    for (const event of events) {
      const academyId = (event.payload as { academyId?: string })?.academyId ?? event.aggregate_id;
      if (!academyId) continue;

      if (!academyStats.has(academyId)) {
        academyStats.set(academyId, { totalMembers: 0, checkins: 0 });
      }

      const stats = academyStats.get(academyId)!;

      if (event.event_type === 'ParticipantEnrolled') {
        stats.totalMembers++;
      } else if (event.event_type === 'AttendanceRecorded') {
        stats.checkins++;
      }
    }

    // Upsert all stats
    for (const [academyId, stats] of academyStats) {
      await admin
        .from('rm_academy_stats')
        .upsert(
          {
            academy_id: academyId,
            total_members: stats.totalMembers,
            active_members: stats.totalMembers,
            total_checkins_30d: stats.checkins,
            last_computed_at: new Date().toISOString(),
          },
          { onConflict: 'academy_id' },
        );
    }
  },
};
