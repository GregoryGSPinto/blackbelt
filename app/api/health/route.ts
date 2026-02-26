import { NextResponse } from 'next/server';
import { ensureInitialized } from '@/server/src/init';
import { getHealth } from '@/server/src/api/health';

export async function GET() {
  try {
    await ensureInitialized();
    const health = await getHealth();
    const status = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;
    return NextResponse.json(health, { status });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', error: err.message },
      { status: 503 },
    );
  }
}
