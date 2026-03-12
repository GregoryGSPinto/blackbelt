import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function GET() {
  const urlConfigured = Boolean(getEnv('NEXT_PUBLIC_SUPABASE_URL'));
  const anonKeyConfigured = Boolean(getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

  const checks = {
    node_env: process.env.NODE_ENV || 'unknown',
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    supabase: {
      url_configured: urlConfigured,
      anon_key_configured: anonKeyConfigured,
      service_role_configured: Boolean(getEnv('SUPABASE_SERVICE_ROLE_KEY')),
      fully_configured: urlConfigured && anonKeyConfigured,
    },
    stripe: {
      secret_key_configured: Boolean(getEnv('STRIPE_SECRET_KEY')),
      webhook_secret_configured: Boolean(getEnv('STRIPE_WEBHOOK_SECRET')),
    },
    email: {
      resend_key_configured: Boolean(getEnv('RESEND_API_KEY')),
    },
  };

  const allCritical = urlConfigured && anonKeyConfigured;
  const status = allCritical ? 'healthy' : 'unhealthy';
  const httpStatus = status === 'unhealthy' ? 503 : 200;

  return NextResponse.json({ status, timestamp: new Date().toISOString(), checks }, { status: httpStatus });
}
