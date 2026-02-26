/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  HEALTH API — Endpoints administrativos                        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  GET /api/health     → status geral do sistema                 ║
 * ║  GET /api/health/db  → teste de conexão com Postgres           ║
 * ║                                                                 ║
 * ║  Funciona como Next.js API Route ou handler standalone.        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { checkDatabaseHealth } from '../infrastructure/database/postgres';
import { env } from '../infrastructure/env';

// ════════════════════════════════════════════════════════════════════
// HEALTH RESPONSE
// ════════════════════════════════════════════════════════════════════

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  checks: {
    database?: {
      status: 'ok' | 'error';
      responseTimeMs?: number;
      error?: string;
      poolStats?: { total: number; idle: number; waiting: number };
    };
    eventStore?: {
      mode: 'POSTGRES' | 'MEMORY';
    };
  };
}

const startedAt = Date.now();

// ════════════════════════════════════════════════════════════════════
// HANDLERS
// ════════════════════════════════════════════════════════════════════

/**
 * GET /api/health — Status geral
 */
export async function getHealth(): Promise<HealthResponse> {
  const response: HealthResponse = {
    status: 'ok',
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      eventStore: {
        mode: env.hasDatabase ? 'POSTGRES' : 'MEMORY',
      },
    },
  };

  // If database is configured, test it
  if (env.hasDatabase) {
    const dbHealth = await checkDatabaseHealth();
    response.checks.database = {
      status: dbHealth.healthy ? 'ok' : 'error',
      responseTimeMs: dbHealth.responseTimeMs,
      error: dbHealth.error,
      poolStats: dbHealth.poolStats,
    };

    if (!dbHealth.healthy) {
      response.status = 'degraded';
    }
  }

  return response;
}

/**
 * GET /api/health/db — Teste detalhado de conexão
 */
export async function getHealthDb(): Promise<{
  status: 'ok' | 'error';
  responseTimeMs: number;
  poolStats: { total: number; idle: number; waiting: number };
  error?: string;
}> {
  if (!env.hasDatabase) {
    return {
      status: 'error',
      responseTimeMs: 0,
      poolStats: { total: 0, idle: 0, waiting: 0 },
      error: 'DATABASE_URL not configured — running in MEMORY mode',
    };
  }

  const result = await checkDatabaseHealth();

  return {
    status: result.healthy ? 'ok' : 'error',
    responseTimeMs: result.responseTimeMs,
    poolStats: result.poolStats,
    error: result.error,
  };
}
