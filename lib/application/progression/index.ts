/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROGRESSION USE CASES — Snapshot + Projectors                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Fluxo:                                                         ║
 * ║                                                                 ║
 * ║  Legacy Services                                                ║
 * ║       ↓                                                         ║
 * ║  ACL (mappers)                                                  ║
 * ║       ↓                                                         ║
 * ║  buildDevelopmentSnapshot()   ← UMA construção                 ║
 * ║       ↓                                                         ║
 * ║  projectXxx(snapshot)         ← N projeções                    ║
 * ║       ↓                                                         ║
 * ║  ViewModels para UI                                             ║
 * ║                                                                 ║
 * ║  Regra: o snapshot é construído UMA vez.                       ║
 * ║  Projectors são funções puras (snapshot → viewmodel).          ║
 * ║  Sem efeitos colaterais. Sem fetch. Sem estado.                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── State ─────────────────────────────────────────────────────────
export type { ParticipantDevelopmentSnapshot } from './state/snapshot';
export { buildDevelopmentSnapshot } from './state/build-snapshot';

// ── Projectors ────────────────────────────────────────────────────
export {
  projectStudentProgress,
  type StudentProgressVM,
  type StudentRequirementVM,
  type StudentTimelineEntryVM,
} from './projectors/student-progress.projector';

export {
  projectInstructorProgress,
  type InstructorProgressVM,
  type InstructorAlert,
} from './projectors/instructor-progress.projector';

export {
  projectAdminRow,
  projectRanking,
  projectEligibility,
  projectNotifications,
  projectDigitalCard,
  projectDashboardCard,
  type AdminParticipantRowVM,
  type RankingParticipantVM,
  type EligibilityVM,
  type ProgressNotificationVM,
  type DigitalCardVM,
  type DashboardProgressCardVM,
} from './projectors/index';

// ── Re-export snapshot subtypes for consumers ─────────────────────
export type {
  ResolvedMilestone,
  ResolvedCriterion,
  ResolvedHistoryEntry,
  ResolvedEvaluation,
  PromotionEligibility,
} from './state/snapshot';
