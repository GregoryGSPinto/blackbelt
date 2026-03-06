/**
 * Telemetry — Product Analytics + Performance + Error Tracking
 *
 * Unified telemetry API for the BlackBelt platform:
 * - trackEvent: product analytics (user actions, feature usage)
 * - trackPerformance: performance metrics (API latency, render time)
 * - trackError: error tracking with Sentry-compatible context
 */

import { structuredLog } from './structured-logger';
import { recordLatency, incrementCounter } from './metrics';

// ============================================================
// TYPES
// ============================================================

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface ErrorContext {
  userId?: string;
  academyId?: string;
  route?: string;
  component?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Track a product analytics event.
 *
 * @example
 * trackEvent('checkin_completed', { method: 'QR', academyId: '...' });
 * trackEvent('belt_promotion_viewed', { beltColor: 'blue' });
 */
export function trackEvent(name: string, properties?: EventProperties): void {
  incrementCounter(`event_${name}`);

  structuredLog.business.info(`Event: ${name}`, {
    eventName: name,
    ...properties,
  });
}

/**
 * Track a performance metric.
 *
 * @example
 * const start = performance.now();
 * await fetchData();
 * trackPerformance('api_fetch_athletes', performance.now() - start);
 */
export function trackPerformance(name: string, durationMs: number): void {
  recordLatency(name, 'INTERNAL', 200, durationMs);

  structuredLog.system.info(`Performance: ${name}`, {
    metric: name,
    durationMs,
  });
}

/**
 * Track an error with rich context.
 * Wraps Sentry (when available) with extra BlackBelt context.
 *
 * @example
 * try { await riskyOperation(); }
 * catch (err) {
 *   trackError(err as Error, { userId: '...', component: 'CheckinForm' });
 * }
 */
export function trackError(error: Error, context?: ErrorContext): void {
  incrementCounter('errors_tracked');

  structuredLog.error.error(`Error: ${error.message}`, {
    errorName: error.name,
    stack: error.stack?.slice(0, 500),
    ...context,
  });

  // Sentry integration (when DSN is configured)
  if (typeof globalThis !== 'undefined' && (globalThis as any).Sentry) {
    const Sentry = (globalThis as any).Sentry;
    Sentry.withScope((scope: any) => {
      if (context?.userId) scope.setUser({ id: context.userId });
      if (context?.academyId) scope.setTag('academyId', context.academyId);
      if (context?.route) scope.setTag('route', context.route);
      if (context?.component) scope.setTag('component', context.component);
      if (context?.extra) scope.setExtras(context.extra);
      Sentry.captureException(error);
    });
  }
}
