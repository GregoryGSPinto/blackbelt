/**
 * Supabase Monitor — Connects Supabase metrics with existing monitoring API.
 * Provides functions compatible with lib/monitoring/ interfaces.
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export interface SupabaseHealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  database: 'connected' | 'error' | 'unknown';
  latencyMs: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

/** Check Supabase database health */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const start = Date.now();

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from('academies').select('id').limit(1);
    const latencyMs = Date.now() - start;

    if (error) {
      return {
        status: 'unhealthy',
        database: 'error',
        latencyMs,
        timestamp: new Date().toISOString(),
        details: { error: error.message },
      };
    }

    return {
      status: 'healthy',
      database: 'connected',
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      database: 'error',
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: { error: err instanceof Error ? err.message : 'Unknown' },
    };
  }
}

/** Get table row counts for monitoring dashboard */
export async function getTableStats() {
  const admin = getSupabaseAdminClient();

  const tables = [
    'profiles',
    'memberships',
    'academies',
    'class_sessions',
    'attendances',
    'notifications',
  ] as const;

  const results: Record<string, number> = {};

  await Promise.all(
    tables.map(async (table) => {
      const { count } = await admin
        .from(table)
        .select('*', { count: 'exact', head: true });
      results[table] = count ?? 0;
    }),
  );

  return results;
}

/** Get recent audit log entries */
export async function getRecentAuditEntries(limit = 20) {
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/** Get rate limit summary */
export async function getRateLimitSummary() {
  const admin = getSupabaseAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from('rate_limit_log')
    .select('*')
    .gte('window_start', oneHourAgo)
    .order('count', { ascending: false })
    .limit(10);

  return { data, error };
}
