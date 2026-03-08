import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const startedAt = Date.now();

export async function GET() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      eventStore: {
        mode: hasDatabase ? 'POSTGRES' : 'MEMORY',
      },
      database: hasDatabase
        ? { status: 'ok' }
        : { status: 'error', error: 'DATABASE_URL not configured' },
    },
  });
}
