/**
 * Application Layer — Public API
 *
 * Snapshot + Projectors architecture.
 * Build once, project many.
 */

// ── Progression ───────────────────────────────────────────────────
export { buildDevelopmentSnapshot } from './progression/state/build-snapshot';
export type { ParticipantDevelopmentSnapshot, ResolvedMilestone, ResolvedCriterion, PromotionEligibility } from './progression/state/snapshot';

export { projectStudentProgress } from './progression/projectors/student-progress.projector';
export type { StudentProgressVM } from './progression/projectors/student-progress.projector';

export { projectInstructorProgress } from './progression/projectors/instructor-progress.projector';
export type { InstructorProgressVM, InstructorAlert } from './progression/projectors/instructor-progress.projector';

export {
  projectAdminRow, projectRanking, projectEligibility,
  projectNotifications, projectDigitalCard, projectDashboardCard,
} from './progression/projectors/index';
export type {
  AdminParticipantRowVM, RankingParticipantVM, EligibilityVM,
  ProgressNotificationVM, DigitalCardVM, DashboardProgressCardVM,
} from './progression/projectors/index';
