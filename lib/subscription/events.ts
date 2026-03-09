// ============================================================
// Subscription Pricing System - Domain Events
// ============================================================

import type { MetricType, AddonType, PlanName } from './types';
import { logger } from '@/lib/logger';

// Event Types
export type SubscriptionEventType =
  | 'StudentLimitApproaching'
  | 'StudentLimitExceeded'
  | 'PlanUpgraded'
  | 'PlanDowngraded'
  | 'QuotaThresholdReached'
  | 'OverageIncurred'
  | 'AddonActivated'
  | 'AddonDeactivated'
  | 'StoreSaleCompleted';

// Event Payloads
export interface StudentLimitApproachingEvent {
  type: 'StudentLimitApproaching';
  academyId: string;
  currentStudents: number;
  limit: number;
  percentage: number;
  threshold: 80 | 95;
}

export interface StudentLimitExceededEvent {
  type: 'StudentLimitExceeded';
  academyId: string;
  currentStudents: number;
  limit: number;
  autoUpgradeTriggered: boolean;
}

export interface PlanUpgradedEvent {
  type: 'PlanUpgraded';
  academyId: string;
  previousPlan: PlanName;
  newPlan: PlanName;
  reason: 'manual' | 'auto_limit';
  effectiveAt: string;
}

export interface PlanDowngradedEvent {
  type: 'PlanDowngraded';
  academyId: string;
  previousPlan: PlanName;
  newPlan: PlanName;
  effectiveAt: string;
}

export interface QuotaThresholdReachedEvent {
  type: 'QuotaThresholdReached';
  academyId: string;
  metricType: MetricType;
  threshold: 80 | 95 | 100;
  currentUsage: number;
  limit: number;
}

export interface OverageIncurredEvent {
  type: 'OverageIncurred';
  academyId: string;
  metricType: MetricType;
  amount: number;
  charge: number;
}

export interface AddonActivatedEvent {
  type: 'AddonActivated';
  academyId: string;
  addonType: AddonType;
  price: number;
}

export interface AddonDeactivatedEvent {
  type: 'AddonDeactivated';
  academyId: string;
  addonType: AddonType;
}

export interface StoreSaleCompletedEvent {
  type: 'StoreSaleCompleted';
  academyId: string;
  orderId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
}

export type SubscriptionEvent =
  | StudentLimitApproachingEvent
  | StudentLimitExceededEvent
  | PlanUpgradedEvent
  | PlanDowngradedEvent
  | QuotaThresholdReachedEvent
  | OverageIncurredEvent
  | AddonActivatedEvent
  | AddonDeactivatedEvent
  | StoreSaleCompletedEvent;

// Event Handler Type
type EventHandler<T extends SubscriptionEvent> = (event: T) => void | Promise<void>;

// Event Bus
class SubscriptionEventBus {
  private handlers: Map<SubscriptionEventType, Set<EventHandler<SubscriptionEvent>>> = new Map();

  on<T extends SubscriptionEvent>(
    type: T['type'],
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as EventHandler<SubscriptionEvent>);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as EventHandler<SubscriptionEvent>);
    };
  }

  emit<T extends SubscriptionEvent>(event: T): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[SubscriptionEventBus] Error handling ${event.type}:`, error);
        }
      });
    }
  }

  // Emit async (for handlers that need to complete)
  async emitAsync<T extends SubscriptionEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(async handler => {
          try {
            await handler(event);
          } catch (error) {
            console.error(`[SubscriptionEventBus] Error handling ${event.type}:`, error);
          }
        })
      );
    }
  }
}

// Singleton instance
export const subscriptionEvents = new SubscriptionEventBus();

// ============================================================
// Default Event Handlers
// ============================================================

// Send notification when approaching limit
subscriptionEvents.on('StudentLimitApproaching', async (event: StudentLimitApproachingEvent) => {
  logger.info('[Subscription Event]', `Academy ${event.academyId} approaching student limit: ${event.percentage.toFixed(1)}%`);
  // TODO: Send email/notification to admin
});

// Log plan upgrades
subscriptionEvents.on('PlanUpgraded', async (event: PlanUpgradedEvent) => {
  logger.info('[Subscription Event]', `Academy ${event.academyId} upgraded from ${event.previousPlan} to ${event.newPlan}`);
  // TODO: Send confirmation email
});

// Alert on overage
subscriptionEvents.on('OverageIncurred', async (event: OverageIncurredEvent) => {
  logger.info('[Subscription Event]', `Academy ${event.academyId} incurred overage: ${event.metricType} = R$ ${event.charge}`);
  // TODO: Update real-time dashboard
});

// Track store sales
subscriptionEvents.on('StoreSaleCompleted', async (event: StoreSaleCompletedEvent) => {
  logger.info('[Subscription Event]', `Store sale completed: ${event.orderId} = R$ ${event.amount}`);
  // TODO: Update analytics
});
