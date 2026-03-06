/**
 * Billing metering — tracks platform usage per academy per period.
 *
 * Wired to the event bus to automatically increment counters
 * when domain events occur (check-ins, member activations, etc).
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { eventBus } from '@/lib/application/events/event-bus';
import type { AttendanceRecorded, ParticipantEnrolled } from '@/lib/domain/events/domain-events';

export type BillingMetric =
  | 'active_members'
  | 'checkins'
  | 'storage_mb'
  | 'api_calls'
  | 'push_sent'
  | 'video_minutes';

function getCurrentPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Increment a usage metric for an academy in the current billing period.
 * Uses admin client (bypasses RLS) with type cast since billing_usage
 * is not yet in the generated Supabase types.
 */
export async function incrementUsage(
  academyId: string,
  metric: BillingMetric,
  qty = 1,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as any;
  const { start, end } = getCurrentPeriod();

  const { error } = await supabase
    .from('billing_usage')
    .upsert(
      {
        academy_id: academyId,
        period_start: start,
        period_end: end,
        metric,
        quantity: qty,
      },
      { onConflict: 'academy_id,period_start,metric' },
    );

  if (error) {
    console.error('[BillingMeter] Failed to increment usage:', error);
  }
}

/**
 * Get usage summary for an academy in a given period.
 */
export async function getUsageSummary(
  academyId: string,
  periodStart?: string,
): Promise<Record<BillingMetric, number>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as any;
  const start = periodStart ?? getCurrentPeriod().start;

  const { data } = await supabase
    .from('billing_usage')
    .select('metric, quantity')
    .eq('academy_id', academyId)
    .eq('period_start', start);

  const summary: Record<BillingMetric, number> = {
    active_members: 0,
    checkins: 0,
    storage_mb: 0,
    api_calls: 0,
    push_sent: 0,
    video_minutes: 0,
  };

  if (data) {
    for (const row of data) {
      summary[row.metric as BillingMetric] = Number(row.quantity);
    }
  }

  return summary;
}

/**
 * Wire billing metering to the event bus.
 * Call once during app initialization.
 */
export function wireBillingMetering(): void {
  // AttendanceRecorded → increment checkins
  eventBus.on<AttendanceRecorded>('AttendanceRecorded', async (event) => {
    // We need the academy_id from the session/membership context
    // For now, use aggregateId which should map to a membership/academy context
    try {
      await incrementUsage(event.aggregateId, 'checkins');
    } catch (err) {
      console.error('[BillingMeter] Failed to meter checkin:', err);
    }
  });

  // ParticipantEnrolled → increment active_members
  eventBus.on<ParticipantEnrolled>('ParticipantEnrolled', async (event) => {
    try {
      await incrementUsage(event.aggregateId, 'active_members');
    } catch (err) {
      console.error('[BillingMeter] Failed to meter enrollment:', err);
    }
  });
}
