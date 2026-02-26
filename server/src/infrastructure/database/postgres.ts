/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  POSTGRES — Connection pool                                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Pool singleton com configuração de produção:                  ║
 * ║  • SSL automático quando ?sslmode=require na URL               ║
 * ║  • Reconexão automática                                        ║
 * ║  • Pool sizing adequado                                        ║
 * ║  • Timeout configurável                                        ║
 * ║  • Health check embutido                                       ║
 * ║                                                                 ║
 * ║  Não acoplado a nenhum fornecedor (Supabase, RDS, etc.)       ║
 * ║  Funciona com qualquer PostgreSQL via DATABASE_URL.            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { Pool } from 'pg';
import type { PoolConfig } from 'pg';
import { env } from '../env';

// ════════════════════════════════════════════════════════════════════
// POOL SINGLETON
// ════════════════════════════════════════════════════════════════════

let pool: Pool | null = null;

/**
 * Cria ou retorna o pool singleton.
 *
 * Configuração automática baseada no ambiente:
 * • Dev: pool menor, sem SSL, timeouts relaxados
 * • Prod: pool maior, SSL obrigatório, timeouts rigorosos
 */
export function createPgPool(): Pool {
  if (pool) return pool;

  if (!env.DATABASE_URL) {
    throw new Error('[Postgres] DATABASE_URL not configured. Cannot create pool.');
  }

  const isSSL = env.DATABASE_URL.includes('sslmode=require') ||
                env.DATABASE_URL.includes('ssl=true') ||
                env.isProduction;

  const config: PoolConfig = {
    connectionString: env.DATABASE_URL,

    // Pool sizing
    min: env.isProduction ? 2 : 1,
    max: env.isProduction ? 20 : 5,

    // Timeouts
    idleTimeoutMillis: env.isProduction ? 30_000 : 10_000,
    connectionTimeoutMillis: env.isProduction ? 5_000 : 10_000,
    statement_timeout: 30_000, // 30s max per query

    // SSL
    ssl: isSSL ? { rejectUnauthorized: false } : undefined,
  };

  pool = new Pool(config);

  // Error handler — prevents unhandled rejections on idle clients
  pool.on('error', (err) => {
    console.error('[Postgres] Unexpected pool error:', err.message);
  });

  // Connection logging
  pool.on('connect', () => {
    if (env.isDevelopment) {
      console.log('[Postgres] New client connected');
    }
  });

  console.log(
    `[Postgres] Pool created | max=${config.max} | ssl=${!!config.ssl} | env=${env.NODE_ENV}`
  );

  return pool;
}

/**
 * Get existing pool (throws if not initialized).
 */
export function getPgPool(): Pool {
  if (!pool) {
    throw new Error('[Postgres] Pool not initialized. Call createPgPool() first.');
  }
  return pool;
}

/**
 * Health check — tests actual database connectivity.
 * Returns response time in ms.
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  responseTimeMs: number;
  error?: string;
  poolStats: { total: number; idle: number; waiting: number };
}> {
  if (!pool) {
    return { healthy: false, responseTimeMs: 0, error: 'Pool not initialized', poolStats: { total: 0, idle: 0, waiting: 0 } };
  }

  const start = Date.now();
  try {
    const result = await pool.query('SELECT 1 as alive, NOW() as server_time');
    const responseTimeMs = Date.now() - start;

    return {
      healthy: true,
      responseTimeMs,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  } catch (err: any) {
    return {
      healthy: false,
      responseTimeMs: Date.now() - start,
      error: err.message,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  }
}

/**
 * Graceful shutdown — drains pool connections.
 */
export async function closePgPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[Postgres] Pool closed');
  }
}
