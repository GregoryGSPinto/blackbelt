import type { LogCategory } from '@/lib/monitoring/structured-logger';
import { structuredLog } from '@/lib/monitoring/structured-logger';
import { sanitizeErrorForLogging } from '@/lib/security/sensitive-data';

type RouteLogLevel = 'info' | 'warn' | 'error';

type RouteObservabilityContext = {
  route?: string;
  event_type: string;
  academy_id?: string | null;
  membership_id?: string | null;
  profile_id?: string | null;
  request_id?: string | null;
  reason?: unknown;
  [key: string]: unknown;
};

function resolveRoute(request?: Request, explicitRoute?: string): string {
  if (explicitRoute) return explicitRoute;
  if (!request) return 'unknown';

  try {
    return new URL(request.url).pathname;
  } catch {
    return 'unknown';
  }
}

function normalizeReason(reason: unknown): string | undefined {
  if (!reason) return undefined;
  if (typeof reason === 'string') return reason;

  const sanitized = sanitizeErrorForLogging(reason);
  if (typeof sanitized === 'string') return sanitized;
  if (sanitized && typeof sanitized === 'object' && 'message' in sanitized && typeof sanitized.message === 'string') {
    return sanitized.message;
  }

  return 'unknown_error';
}

export function createRouteLogContext(
  request: Request | undefined,
  context: RouteObservabilityContext,
): Record<string, unknown> {
  const { route, reason, event_type, ...rest } = context;
  const failureReason = normalizeReason(reason);

  return {
    route: resolveRoute(request, route),
    event_type,
    ...rest,
    ...(failureReason ? { failure_reason: failureReason } : {}),
  };
}

export function logRouteEvent(
  level: RouteLogLevel,
  category: LogCategory,
  message: string,
  request: Request | undefined,
  context: RouteObservabilityContext,
): void {
  const logger = structuredLog[category][level];
  logger(message, createRouteLogContext(request, context));
}
