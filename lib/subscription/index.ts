// ============================================================
// Subscription Pricing System - Index
// ============================================================

// Types
export * from './types';

// Services
export {
  PlanManagementService,
  QuotaTrackingService,
  OverageBillingService,
  AddonManagementService,
  StoreRevenueService,
  PrepaidCreditsService,
  BillingForecastService,
  // Singleton instances
  planManagement,
  quotaTracking,
  overageBilling,
  addonManagement,
  storeRevenue,
  prepaidCredits,
  billingForecast
} from './services';

// Events
export {
  subscriptionEvents,
  type SubscriptionEvent,
  type SubscriptionEventType,
  type StudentLimitApproachingEvent,
  type StudentLimitExceededEvent,
  type PlanUpgradedEvent,
  type PlanDowngradedEvent,
  type QuotaThresholdReachedEvent,
  type OverageIncurredEvent,
  type AddonActivatedEvent,
  type AddonDeactivatedEvent,
  type StoreSaleCompletedEvent
} from './events';
