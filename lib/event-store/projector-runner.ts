/**
 * Projector Runner — Process new domain events and update read models.
 *
 * Projectors subscribe to specific event types and update denormalized
 * read models (tables, views) when new events are processed.
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { StoredEvent } from './event-types';

/** A projector handles specific event types and updates read models */
export interface Projector {
  name: string;
  handles: string[];
  process: (event: StoredEvent) => Promise<void>;
}

/** Registry of all projectors */
const projectors: Projector[] = [];

/** Register a projector */
export function registerProjector(projector: Projector) {
  projectors.push(projector);
}

/**
 * Process all unprocessed events for a subscriber.
 * Uses event_subscriptions table to track last processed event.
 */
export async function runProjectors(subscriberName: string) {
  const admin = getSupabaseAdminClient();

  // Get or create subscription
  const { data: subscription } = await admin
    .from('event_subscriptions')
    .select('*')
    .eq('subscriber_name', subscriberName)
    .single();

  // Fetch new events since last processed
  let query = admin
    .from('domain_events')
    .select('*')
    .order('occurred_at', { ascending: true })
    .limit(100);

  if (subscription?.last_event_id) {
    const { data: lastEvent } = await admin
      .from('domain_events')
      .select('occurred_at')
      .eq('id', subscription.last_event_id)
      .single();

    if (lastEvent) {
      query = query.gt('occurred_at', lastEvent.occurred_at);
    }
  }

  const { data: events, error } = await query;
  if (error || !events || events.length === 0) return { processed: 0 };

  let processed = 0;
  const storedEvents = events as StoredEvent[];

  for (const event of storedEvents) {
    // Find projectors that handle this event type
    const matchingProjectors = projectors.filter(p =>
      p.handles.includes(event.event_type)
    );

    for (const projector of matchingProjectors) {
      try {
        await projector.process(event);
      } catch (err) {
        console.error(
          `[ProjectorRunner] Error in ${projector.name} processing ${event.event_type}:`,
          err,
        );
      }
    }

    processed++;
  }

  // Update subscription checkpoint
  const lastEvent = storedEvents[storedEvents.length - 1];
  if (lastEvent) {
    if (subscription) {
      await admin
        .from('event_subscriptions')
        .update({
          last_event_id: lastEvent.id,
          last_processed: new Date().toISOString(),
        })
        .eq('subscriber_name', subscriberName);
    } else {
      await admin.from('event_subscriptions').insert({
        subscriber_name: subscriberName,
        last_event_id: lastEvent.id,
        last_processed: new Date().toISOString(),
      });
    }
  }

  return { processed };
}

/** Get processing status for a subscriber */
export async function getProjectorStatus(subscriberName: string) {
  const admin = getSupabaseAdminClient();

  const { data } = await admin
    .from('event_subscriptions')
    .select('*')
    .eq('subscriber_name', subscriberName)
    .single();

  return data;
}
