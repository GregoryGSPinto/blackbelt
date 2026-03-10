import { NextResponse } from 'next/server';
import { getOptionalEnv } from '@/lib/env';
import { runHealthCheck } from '@/lib/monitoring/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await runHealthCheck();
    const envChecks = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL')),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY')),
      NEXT_PUBLIC_STRIPE_PUBLIC_KEY: Boolean(getOptionalEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY')),
      STRIPE_SECRET_KEY: Boolean(getOptionalEnv('STRIPE_SECRET_KEY')),
    };
    const stripeConfigured = envChecks.NEXT_PUBLIC_STRIPE_PUBLIC_KEY && envChecks.STRIPE_SECRET_KEY;
    const status = health.status === 'unhealthy' || !envChecks.NEXT_PUBLIC_SUPABASE_URL || !envChecks.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? 'unhealthy'
      : stripeConfigured
        ? health.status
        : health.status === 'healthy'
          ? 'degraded'
          : health.status;

    const httpStatus = status === 'unhealthy' ? 503 : 200;
    return NextResponse.json(
      {
        ...health,
        status,
        checks: {
          ...health.checks,
          environment: {
            status: Object.values(envChecks).every(Boolean) ? 'healthy' : 'degraded',
            variables: envChecks,
          },
          stripe: stripeConfigured
            ? { status: 'healthy' }
            : { status: 'degraded', error: 'Stripe environment variables are not fully configured' },
          supabase: envChecks.NEXT_PUBLIC_SUPABASE_URL && envChecks.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? { status: 'healthy' }
            : { status: 'unhealthy', error: 'Supabase public environment variables are missing' },
        },
      },
      { status: httpStatus },
    );
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
