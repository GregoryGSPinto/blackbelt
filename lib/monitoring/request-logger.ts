/**
 * Request Logger — HTTP Request/Response Logging
 *
 * Logs: method, path, status, duration, userId, academyId
 * Does NOT log: body, headers (privacy)
 *
 * Persists to Supabase request_logs table (partitioned by month).
 * Retention: 90 days.
 */

import { structuredLog } from './structured-logger';
import { recordLatency } from './metrics';

// ============================================================
// TYPES
// ============================================================

export interface RequestLogEntry {
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  user_id?: string;
  academy_id?: string;
  ip_hash?: string;
  user_agent?: string;
}

// ============================================================
// BUFFER — Batch writes to Supabase
// ============================================================

const logBuffer: RequestLogEntry[] = [];
const FLUSH_INTERVAL_MS = 10_000;
const MAX_BUFFER_SIZE = 100;
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flushToSupabase(): Promise<void> {
  if (logBuffer.length === 0) return;

  const batch = logBuffer.splice(0, MAX_BUFFER_SIZE);

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return;

    const client = createClient(url, key);
    const { error } = await client.from('request_logs').insert(batch);

    if (error) {
      structuredLog.error.warn('Failed to flush request logs', {
        error: error.message,
        batchSize: batch.length,
      });
    }
  } catch (err) {
    structuredLog.error.warn('Request log flush error', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
  }
}

/**
 * Start periodic flushing of request logs to Supabase.
 */
export function startRequestLogFlush(): void {
  if (flushTimer) return;
  flushTimer = setInterval(flushToSupabase, FLUSH_INTERVAL_MS);
}

/**
 * Stop periodic flushing.
 */
export function stopRequestLogFlush(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// ============================================================
// HASH — Simple IP hashing for privacy
// ============================================================

function hashIp(ip: string): string {
  // Simple non-reversible hash for privacy (not crypto-grade, just obfuscation)
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `h_${Math.abs(hash).toString(36)}`;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Log an HTTP request/response.
 *
 * @example
 * logRequest({
 *   method: 'GET',
 *   path: '/api/alunos',
 *   status_code: 200,
 *   duration_ms: 45,
 *   user_id: 'uuid...',
 * });
 */
export function logRequest(entry: RequestLogEntry): void {
  // 1. Structured log (console/aggregator)
  structuredLog.http.info(`${entry.method} ${entry.path} ${entry.status_code}`, {
    method: entry.method,
    path: entry.path,
    statusCode: entry.status_code,
    durationMs: entry.duration_ms,
    userId: entry.user_id,
    academyId: entry.academy_id,
  });

  // 2. Metrics
  recordLatency(entry.path, entry.method, entry.status_code, entry.duration_ms);

  // 3. Buffer for Supabase persistence
  logBuffer.push({
    ...entry,
    ip_hash: entry.ip_hash ? hashIp(entry.ip_hash) : undefined,
  });

  // Auto-flush if buffer is full
  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    flushToSupabase();
  }
}

/**
 * Create a request logging wrapper for Next.js API routes.
 *
 * @example
 * // In API route:
 * import { withRequestLogging } from '@/lib/monitoring/request-logger';
 *
 * export const GET = withRequestLogging(async (req) => {
 *   return NextResponse.json({ data });
 * });
 */
export function withRequestLogging(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const start = Date.now();
    const url = new URL(request.url);

    try {
      const response = await handler(request);

      logRequest({
        method: request.method,
        path: url.pathname,
        status_code: response.status,
        duration_ms: Date.now() - start,
        ip_hash: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });

      return response;
    } catch (err) {
      logRequest({
        method: request.method,
        path: url.pathname,
        status_code: 500,
        duration_ms: Date.now() - start,
        ip_hash: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
      throw err;
    }
  };
}
