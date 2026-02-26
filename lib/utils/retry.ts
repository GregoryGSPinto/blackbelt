// ============================================================
// withRetry — Exponential Backoff Retry Utility
// ============================================================
// Generic retry wrapper for any async function.
// Only retries on network errors and 5xx — never on 4xx.
//
// Usage:
//   const data = await withRetry(() => myService.getData(), { maxRetries: 3 });
// ============================================================

import { logger } from '@/lib/logger';

export interface RetryOptions {
  /** Maximum number of retries (default: 3) */
  maxRetries?: number;
  /** Initial backoff delay in ms (default: 1000) */
  backoffMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Only retry on these HTTP status codes. Default: 5xx + network errors */
  retryOn?: number[];
  /** Called before each retry attempt */
  onRetry?: (attempt: number, maxRetries: number, error: unknown) => void;
  /** Label for logging */
  label?: string;
}

/**
 * Extracts HTTP status from various error shapes.
 */
function getErrorStatus(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null;
  const obj = err as Record<string, unknown>;
  if (typeof obj.status === 'number') return obj.status;
  if (typeof obj.statusCode === 'number') return obj.statusCode;
  return null;
}

/**
 * Determines if an error is retryable.
 * - Network errors (status 0 or null) → retryable
 * - 5xx errors → retryable
 * - 4xx errors → NOT retryable (client errors)
 * - Custom retryOn list overrides defaults
 */
function isRetryable(err: unknown, retryOn?: number[]): boolean {
  const status = getErrorStatus(err);

  // Network error / timeout (no status)
  if (status === null || status === 0) return true;

  // Custom override
  if (retryOn && retryOn.length > 0) {
    return retryOn.includes(status);
  }

  // Default: only 5xx
  return status >= 500;
}

/**
 * Wraps an async function with automatic retry + exponential backoff.
 *
 * @example
 * ```ts
 * const data = await withRetry(
 *   () => professorService.getDashboard(),
 *   { maxRetries: 3, label: 'ProfDashboard' }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    backoffMs = 1000,
    backoffMultiplier = 2,
    retryOn,
    onRetry,
    label = 'withRetry',
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry if not retryable or last attempt
      if (!isRetryable(err, retryOn) || attempt >= maxRetries) {
        throw err;
      }

      const delay = Math.min(backoffMs * Math.pow(backoffMultiplier, attempt), 10_000);

      logger.warn(`[${label}] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms`, {
        status: getErrorStatus(err),
        attempt: attempt + 1,
      });

      onRetry?.(attempt + 1, maxRetries, err);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but TypeScript wants it
  throw lastError;
}

/**
 * Wraps multiple async calls with retry (like Promise.all but with retry per call).
 *
 * @example
 * ```ts
 * const [dashboard, stats] = await withRetryAll([
 *   () => professorService.getDashboard(),
 *   () => pedagogicoService.getEstatisticas(),
 * ], { label: 'ProfDashboard' });
 * ```
 */
export async function withRetryAll<T extends readonly (() => Promise<unknown>)[]>(
  fns: [...T],
  options: RetryOptions = {},
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results = await Promise.all(
    fns.map((fn, i) =>
      withRetry(fn, { ...options, label: `${options.label || 'withRetryAll'}[${i}]` })
    )
  );
  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
