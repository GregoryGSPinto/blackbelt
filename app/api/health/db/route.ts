import { NextResponse } from 'next/server';
import { withAuth, apiError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

async function importPg() {
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  return dynamicImport('pg') as Promise<typeof import('pg')>;
}

export async function GET(request: Request) {
  try {
    const { membership } = await withAuth(request);
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json(
        {
          status: 'error',
          responseTimeMs: 0,
          poolStats: { total: 0, idle: 0, waiting: 0 },
          error: 'DATABASE_URL not configured',
        },
        { status: 503 },
      );
    }

    const start = Date.now();
    const { Pool } = await importPg();
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      max: 1,
    });

    await pool.query('SELECT 1');
    const responseTimeMs = Date.now() - start;
    const poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };

    await pool.end();

    return NextResponse.json({
      status: 'ok',
      responseTimeMs,
      poolStats,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json(
      {
        status: 'error',
        responseTimeMs: 0,
        poolStats: { total: 0, idle: 0, waiting: 0 },
        error: 'Database connectivity check failed',
      },
      { status: 503 },
    );
  }
}
