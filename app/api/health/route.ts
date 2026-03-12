import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const startedAt = Date.now();

export async function GET() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const databaseStatus = hasDatabase ? 'ok' : hasSupabase ? 'degraded' : 'error';

  return NextResponse.json({
    status: databaseStatus === 'error' ? 'degraded' : 'ok',
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
        : hasSupabase
          ? { status: 'degraded', error: 'DATABASE_URL not configured; app is running with Supabase-only data paths' }
          : { status: 'error', error: 'Database and Supabase public environment variables are not configured' },
    },
  });
}
