import { NextResponse } from 'next/server';
import { ensureInitialized } from '@/server/src/init';
import { getHealthDb } from '@/server/src/api/health';

export async function GET() {
  try {
    await ensureInitialized();
    const health = await getHealthDb();
    const status = health.status === 'ok' ? 200 : 503;
    return NextResponse.json(health, { status });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', responseTimeMs: 0, error: err.message },
      { status: 503 },
    );
  }
}
