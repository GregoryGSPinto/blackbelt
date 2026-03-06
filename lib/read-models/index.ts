/**
 * Read Models — CQRS read model infrastructure.
 *
 * Exports all read models and the projector runner.
 */

export type { ReadModel } from './types';

export {
  registerReadModel,
  wireReadModels,
  rebuildReadModel,
  rebuildAllReadModels,
  getRegisteredReadModels,
} from './projector-runner';

export { academyStatsReadModel } from './read-models/academy-stats';
export { athleteProfileReadModel } from './read-models/athlete-profile';
export { feedTimelineReadModel } from './read-models/feed-timeline';
