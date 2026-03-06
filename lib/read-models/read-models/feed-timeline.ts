/**
 * Feed Timeline Read Model — Pre-computed social feed timeline.
 *
 * Stub for future social network features.
 * Will materialize into rm_feed_timeline when social module is implemented.
 */

import type { ReadModel } from '../types';
import type { StoredEvent } from '@/lib/event-store/event-types';

export const feedTimelineReadModel: ReadModel = {
  name: 'feed-timeline',

  // Will be expanded when social events are defined
  handles: [
    'PromotionGranted',
    'AchievementUnlocked',
    'StreakMilestoneReached',
  ],

  async process(_event: StoredEvent): Promise<void> {
    // Stub: no-op until social feed is implemented (Phase 2)
  },

  async rebuild(_events: StoredEvent[]): Promise<void> {
    // Stub: no-op until social feed is implemented (Phase 2)
  },
};
