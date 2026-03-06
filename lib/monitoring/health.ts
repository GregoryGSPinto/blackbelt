/**
 * Health Check Module — System Health Assessment
 *
 * Provides comprehensive health checks for:
 * - Database connectivity and latency
 * - Auth service status
 * - Storage service status
 * - Event store status
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ComponentHealth {
  status: HealthStatus;
  latencyMs?: number;
  error?: string;
}

export interface EventStoreHealth {
  status: HealthStatus;
  lastEventAt?: string;
  totalEvents?: number;
}

export interface HealthCheckResult {
  status: HealthStatus;
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    database: ComponentHealth;
    auth: ComponentHealth;
    storage: ComponentHealth;
    eventStore: EventStoreHealth;
  };
}

// ============================================================
// INTERNALS
// ============================================================

const startTime = Date.now();

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getVersion(): string {
  try {
    return process.env.npm_package_version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

// ============================================================
// HEALTH CHECKS
// ============================================================

async function checkDatabase(): Promise<ComponentHealth> {
  const client = getSupabaseAdmin();
  if (!client) return { status: 'unhealthy', error: 'No Supabase credentials' };

  const start = Date.now();
  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    const latencyMs = Date.now() - start;

    if (error) {
      return { status: 'degraded', latencyMs, error: error.message };
    }

    return {
      status: latencyMs > 2000 ? 'degraded' : 'healthy',
      latencyMs,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkAuth(): Promise<ComponentHealth> {
  const client = getSupabaseAdmin();
  if (!client) return { status: 'unhealthy', error: 'No Supabase credentials' };

  const start = Date.now();
  try {
    const { error } = await client.auth.getSession();
    const latencyMs = Date.now() - start;
    if (error) {
      return { status: 'degraded', latencyMs, error: error.message };
    }
    return { status: 'healthy', latencyMs };
  } catch (err) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkStorage(): Promise<ComponentHealth> {
  const client = getSupabaseAdmin();
  if (!client) return { status: 'unhealthy', error: 'No Supabase credentials' };

  const start = Date.now();
  try {
    const { error } = await client.storage.listBuckets();
    const latencyMs = Date.now() - start;
    if (error) {
      return { status: 'degraded', latencyMs, error: error.message };
    }
    return { status: 'healthy', latencyMs };
  } catch (err) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkEventStore(): Promise<EventStoreHealth> {
  const client = getSupabaseAdmin();
  if (!client) return { status: 'unhealthy' };

  try {
    const { data, error } = await client
      .from('domain_events')
      .select('occurred_at')
      .order('occurred_at', { ascending: false })
      .limit(1);

    if (error) {
      return { status: 'degraded' };
    }

    const { count } = await client
      .from('domain_events')
      .select('*', { count: 'exact', head: true });

    return {
      status: 'healthy',
      lastEventAt: data?.[0]?.occurred_at || undefined,
      totalEvents: count || 0,
    };
  } catch {
    return { status: 'degraded' };
  }
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Run all health checks and return aggregated result.
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const [database, auth, storage, eventStore] = await Promise.all([
    checkDatabase(),
    checkAuth(),
    checkStorage(),
    checkEventStore(),
  ]);

  const checks = { database, auth, storage, eventStore };

  // Overall status: worst of all checks
  const statuses = [database.status, auth.status, storage.status, eventStore.status];
  let status: HealthStatus = 'healthy';
  if (statuses.includes('unhealthy')) status = 'unhealthy';
  else if (statuses.includes('degraded')) status = 'degraded';

  return {
    status,
    version: getVersion(),
    uptime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    checks,
  };
}
