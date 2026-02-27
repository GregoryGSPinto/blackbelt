/**
 * Intelligence Projectors — Public API
 *
 * Each projector is a PURE FUNCTION that transforms engine outputs
 * into profile-specific ViewModels. Zero side effects. Zero fetch.
 */

// ── Churn Projectors ────────────────────────────────────────────────
export {
  projectAdminChurnOverview,
  projectInstructorChurnAlerts,
  projectRetentionEncouragement,
} from './churn-projectors';

export type {
  AdminChurnOverviewVM,
  AdminChurnStudentVM,
  AggregatedRecommendation,
  InstructorChurnAlertVM,
  RetentionEncouragementVM,
} from './churn-projectors';

// ── Student Insights (Adult) ────────────────────────────────────────
export { projectStudentInsights } from './project-student-insights';
export type { StudentInsightsVM } from './project-student-insights';

// ── Teen Insights (Gamified) ────────────────────────────────────────
export { projectTeenInsights } from './project-teen-insights';
export type { TeenInsightsVM } from './project-teen-insights';

// ── Kids Insights (Adventure) ───────────────────────────────────────
export { projectKidsInsights } from './project-kids-insights';
export type { KidsInsightsVM } from './project-kids-insights';

// ── Parent Insights ─────────────────────────────────────────────────
export { projectParentInsights } from './project-parent-insights';
export type { ParentInsightsVM } from './project-parent-insights';

// ── Instructor Coach ────────────────────────────────────────────────
export { projectInstructorCoach } from './project-instructor-coach';
export type {
  InstructorCoachVM,
  ClassBriefingVM,
  SpotlightStudentVM,
  PedagogicalTipVM,
  PerformanceMetricsVM,
} from './project-instructor-coach';

// ── Admin AI Analytics ──────────────────────────────────────────────
export { projectAdminAnalytics } from './project-admin-analytics';
export type {
  AdminAIAnalyticsVM,
  RiskGroupVM,
  ActionableInsightVM,
  ClassAttentionVM,
  InstructorPerformanceVM,
  InstructorData,
} from './project-admin-analytics';

// ── Super Admin Health ──────────────────────────────────────────────
export { projectSuperAdminHealth } from './project-super-admin-health';
export type {
  SuperAdminHealthVM,
  AcademyHealthData,
} from './project-super-admin-health';
