import { NextResponse } from 'next/server';
import { runHealthCheck } from '@/lib/monitoring/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await runHealthCheck();
    const httpStatus = health.status === 'unhealthy' ? 503 : 200;
    return NextResponse.json(health, { status: httpStatus });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
