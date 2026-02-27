/**
 * Intelligence Application Layer — Public API
 *
 * Re-exports all projectors, ViewModels, and application services
 * for the Intelligence bounded context.
 */

// ── Projectors ─────────────────────────────────────────────────────
export {
  // Churn
  projectAdminChurnOverview,
  projectInstructorChurnAlerts,
  projectRetentionEncouragement,
  // Student (Adult)
  projectStudentInsights,
  // Teen (Gamified)
  projectTeenInsights,
  // Kids (Adventure)
  projectKidsInsights,
  // Parent
  projectParentInsights,
  // Instructor Coach
  projectInstructorCoach,
  // Admin AI Analytics
  projectAdminAnalytics,
  // Super Admin Health
  projectSuperAdminHealth,
} from './projectors';

// ── ViewModel Types ─────────────────────────────────────────────────
export type {
  // Churn VMs
  AdminChurnOverviewVM,
  AdminChurnStudentVM,
  AggregatedRecommendation,
  InstructorChurnAlertVM,
  RetentionEncouragementVM,
  // Student VM
  StudentInsightsVM,
  // Teen VM
  TeenInsightsVM,
  // Kids VM
  KidsInsightsVM,
  // Parent VM
  ParentInsightsVM,
  // Instructor Coach VM
  InstructorCoachVM,
  ClassBriefingVM,
  SpotlightStudentVM,
  PedagogicalTipVM,
  PerformanceMetricsVM,
  // Admin Analytics VM
  AdminAIAnalyticsVM,
  RiskGroupVM,
  ActionableInsightVM,
  ClassAttentionVM,
  InstructorPerformanceVM,
  InstructorData,
  // Super Admin VM
  SuperAdminHealthVM,
  AcademyHealthData,
} from './projectors';

// ── Subscribers ────────────────────────────────────────────────────
export {
  wireChurnSubscribers,
  onChurnInvalidate,
  invalidateChurnPrediction,
  resetChurnSubscribers,
  CHURN_RELEVANT_EVENTS,
} from './subscribers/churn-subscriber';
